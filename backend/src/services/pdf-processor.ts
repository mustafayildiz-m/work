import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PDFParsingService } from './pdf-parsing.service';
import { ParserConfig } from './enhanced-pdf-parser';
import * as path from 'path';

// Job data interface
export interface PDFProcessingJobData {
  filePath: string;
  userId?: string;
  timestamp: Date;
  parserConfig?: Partial<ParserConfig>;
  metadata?: {
    originalFileName?: string;
    fileSize?: number;
    uploadedAt?: Date;
  };
}

// Job result interface
export interface PDFProcessingResult {
  success: boolean;
  scholarCount: number;
  highConfidenceCount: number;
  mediumConfidenceCount: number;
  lowConfidenceCount: number;
  filePath: string;
  outputPath?: string;
  processedAt: Date;
  processingTimeMs: number;
  errorMessage?: string;
  metadata?: {
    avgConfidence: number;
    scholarsWithAlternativeNames: number;
    scholarsWithDates: number;
    scholarsWithLineage: number;
    originalFileName?: string;
    fileSize?: number;
  };
}

@Processor('pdf-processing')
export class PDFProcessor {
  private readonly logger = new Logger(PDFProcessor.name);

  constructor(private pdfParsingService: PDFParsingService) {}

  @Process('parse-pdf')
  async handlePDFParsing(
    job: Job<PDFProcessingJobData>,
  ): Promise<PDFProcessingResult> {
    const startTime = Date.now();
    const { filePath, userId, parserConfig, metadata } = job.data;

    try {
      this.logger.log(`Starting PDF parsing job ${job.id} for: ${filePath}`);
      job.progress(10);

      // Parse the PDF
      const result = await this.pdfParsingService.parseScholarsPDF(
        filePath,
        parserConfig,
      );
      job.progress(90);

      // Calculate additional metadata
      const scholars = result.scholars;
      const avgConfidence =
        scholars.length > 0
          ? scholars.reduce((sum, s) => sum + (s.confidence || 0), 0) /
            scholars.length
          : 0;

      const scholarsWithAlternativeNames = scholars.filter(
        (s) => s.alternativeName,
      ).length;
      const scholarsWithDates = scholars.filter(
        (s) =>
          s.birthDate || s.deathDate || s.birthDateHijri || s.deathDateHijri,
      ).length;
      const scholarsWithLineage = scholars.filter((s) => s.lineage).length;

      const processingTimeMs = Date.now() - startTime;

      const processResult: PDFProcessingResult = {
        success: true,
        scholarCount: result.metadata.totalCount,
        highConfidenceCount: result.metadata.highConfidence,
        mediumConfidenceCount: result.metadata.mediumConfidence,
        lowConfidenceCount: result.metadata.lowConfidence,
        filePath,
        outputPath: result.metadata.sourceFile,
        processedAt: new Date(),
        processingTimeMs,
        metadata: {
          avgConfidence: Math.round(avgConfidence * 100) / 100,
          scholarsWithAlternativeNames,
          scholarsWithDates,
          scholarsWithLineage,
          originalFileName: metadata?.originalFileName,
          fileSize: metadata?.fileSize,
        },
      };

      this.logger.log(
        `Successfully completed PDF parsing job ${job.id}: ${result.metadata.totalCount} scholars found in ${processingTimeMs}ms`,
      );
      job.progress(100);

      return processResult;
    } catch (error) {
      const processingTimeMs = Date.now() - startTime;
      this.logger.error(
        `PDF parsing job ${job.id} failed for ${filePath}:`,
        error,
      );

      const errorResult: PDFProcessingResult = {
        success: false,
        scholarCount: 0,
        highConfidenceCount: 0,
        mediumConfidenceCount: 0,
        lowConfidenceCount: 0,
        filePath,
        processedAt: new Date(),
        processingTimeMs,
        errorMessage: error.message,
        metadata: {
          avgConfidence: 0,
          scholarsWithAlternativeNames: 0,
          scholarsWithDates: 0,
          scholarsWithLineage: 0,
          originalFileName: metadata?.originalFileName,
          fileSize: metadata?.fileSize,
        },
      };

      // Optionally, you can add the failed job to a retry queue
      // await this.pdfQueue.add('handle-failed-job', {
      //   originalJobId: job.id,
      //   filePath: job.data.filePath,
      //   error: error.message,
      //   userId: job.data.userId,
      // });

      return errorResult;
    }
  }
}
