import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  PDFSpecificScholarParser,
  ScholarData,
  ParserConfig,
} from './enhanced-pdf-parser';
import * as path from 'path';
import * as fs from 'fs/promises';

interface ProcessingResult {
  success: boolean;
  scholarCount: number;
  highConfidenceCount: number;
  mediumConfidenceCount: number;
  lowConfidenceCount: number;
  filePath: string;
  outputPath: string;
  processedAt: Date;
  errorMessage?: string;
}

@Injectable()
export class PDFParsingService {
  private readonly logger = new Logger(PDFParsingService.name);

  constructor(
    private configService: ConfigService,
    @InjectQueue('pdf-processing') private pdfQueue: Queue,
  ) {}

  /**
   * Queue PDF processing job
   */
  async processPDF(
    filePath: string,
    userId?: string,
  ): Promise<{ jobId: string }> {
    try {
      // Validate file exists
      await this.validateFile(filePath);

      const job = await this.pdfQueue.add(
        'parse-pdf',
        {
          filePath,
          userId,
          timestamp: new Date(),
          parserConfig: this.getParserConfig(),
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 10,
          removeOnFail: 5,
        },
      );

      this.logger.log(
        `PDF processing job ${job.id} queued for file: ${filePath}`,
      );
      return { jobId: job.id.toString() };
    } catch (error) {
      this.logger.error(
        `Failed to queue PDF processing for ${filePath}:`,
        error,
      );
      throw new Error(`Failed to queue PDF processing: ${error.message}`);
    }
  }

  /**
   * Get parsing job status
   */
  async getParsingStatus(jobId: string): Promise<any> {
    try {
      const job = await this.pdfQueue.getJob(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      return {
        id: job.id,
        progress: job.progress(),
        state: await job.getState(),
        result: job.returnvalue,
        failedReason: job.failedReason,
        data: job.data,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
      };
    } catch (error) {
      this.logger.error(`Failed to get job status for ${jobId}:`, error);
      throw new Error(`Failed to get job status: ${error.message}`);
    }
  }

  /**
   * Parse PDF directly (synchronous)
   */
  async parseScholarsPDF(
    filePath: string,
    config?: Partial<ParserConfig>,
  ): Promise<{
    scholars: ScholarData[];
    metadata: {
      totalCount: number;
      highConfidence: number;
      mediumConfidence: number;
      lowConfidence: number;
      processedAt: string;
      sourceFile: string;
      parserConfig: ParserConfig;
    };
  }> {
    try {
      await this.validateFile(filePath);

      const outputPath = this.generateOutputPath(filePath);
      const parserConfig = { ...this.getParserConfig(), ...config };

      this.logger.log(`Starting direct PDF parsing for: ${filePath}`);

      const parser = new PDFSpecificScholarParser(
        filePath,
        outputPath,
        parserConfig,
      );
      const scholars = await parser.process();

      // Calculate confidence distribution
      const highConfidence = scholars.filter(
        (s) => (s.confidence || 0) >= 80,
      ).length;
      const mediumConfidence = scholars.filter(
        (s) => (s.confidence || 0) >= 60 && (s.confidence || 0) < 80,
      ).length;
      const lowConfidence = scholars.filter(
        (s) => (s.confidence || 0) >= 40 && (s.confidence || 0) < 60,
      ).length;

      const result = {
        scholars,
        metadata: {
          totalCount: scholars.length,
          highConfidence,
          mediumConfidence,
          lowConfidence,
          processedAt: new Date().toISOString(),
          sourceFile: path.basename(filePath),
          parserConfig,
        },
      };

      this.logger.log(
        `Successfully parsed ${scholars.length} scholars from ${filePath}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`PDF parsing failed for ${filePath}:`, error);
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  /**
   * Test parser with sample data
   */
  async testParser(sampleText?: string): Promise<any> {
    const testText =
      sampleText ||
      `
      HENNÂD BİN SERÎ
      Bu âlim hakkında bilgi...
      
      HETTÂR (Îsâ bin İkbâl)
      Bu âlim hakkında bilgi...
      
      İMAM EBU HANİFE
      Bu âlim hakkında bilgi...
    `;

    try {
      // Create a temporary test file
      const testFilePath = path.join(process.cwd(), 'temp-test.txt');
      await fs.writeFile(testFilePath, testText, 'utf8');

      const outputPath = this.generateOutputPath('test');
      const parser = new PDFSpecificScholarParser(
        testFilePath,
        outputPath,
        this.getParserConfig(),
      );

      const scholars = await parser.process();

      // Clean up test file
      await fs.unlink(testFilePath);

      return {
        success: true,
        scholarCount: scholars.length,
        scholars: scholars.slice(0, 5), // Return first 5 for testing
        testText: testText.substring(0, 200) + '...',
      };
    } catch (error) {
      this.logger.error('Parser test failed:', error);
      return {
        success: false,
        error: error.message,
        testText: testText.substring(0, 200) + '...',
      };
    }
  }

  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<any[]> {
    try {
      const jobs = await this.pdfQueue.getJobs([
        'waiting',
        'active',
        'completed',
        'failed',
      ]);
      return jobs.map((job) => ({
        id: job.id,
        state: job.opts.delay ? 'delayed' : 'waiting',
        progress: job.progress(),
        data: job.data,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
      }));
    } catch (error) {
      this.logger.error('Failed to get jobs:', error);
      throw new Error(`Failed to get jobs: ${error.message}`);
    }
  }

  /**
   * Clean completed jobs
   */
  async cleanJobs(): Promise<{ cleaned: number }> {
    try {
      await this.pdfQueue.clean(24 * 60 * 60 * 1000, 'completed'); // Clean completed jobs older than 24 hours
      await this.pdfQueue.clean(7 * 24 * 60 * 60 * 1000, 'failed'); // Clean failed jobs older than 7 days

      this.logger.log('Job cleanup completed');
      return { cleaned: 1 };
    } catch (error) {
      this.logger.error('Failed to clean jobs:', error);
      throw new Error(`Failed to clean jobs: ${error.message}`);
    }
  }

  /**
   * Private helper methods
   */
  private async validateFile(filePath: string): Promise<void> {
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new Error(`File not found: ${filePath}`);
    }
  }

  private generateOutputPath(inputPath: string): string {
    const uploadsDir = this.configService.get('UPLOADS_DIR', './uploads');
    const fileName = `scholars-${Date.now()}.json`;
    return path.join(uploadsDir, 'processed', fileName);
  }

  private getParserConfig(): ParserConfig {
    return {
      minNameLength: this.configService.get('PARSER_MIN_NAME_LENGTH', 3),
      maxNameLength: this.configService.get('PARSER_MAX_NAME_LENGTH', 120),
      minWordCount: this.configService.get('PARSER_MIN_WORD_COUNT', 2),
      maxWordCount: this.configService.get('PARSER_MAX_WORD_COUNT', 10),
      datePatterns: [
        /(\d{2,4})\s*\(m\.\s*(\d{3,4})\)/g,
        /(\d{2,4})\s*[-–]\s*(\d{2,4})/g,
        /doğumu?\s*(\d{2,4})/gi,
        /vefât\s*(\d{2,4})/gi,
        /ölüm\s*(\d{2,4})/gi,
      ],
      lineageKeywords: [
        'İbn',
        'Ebu',
        'Ebû',
        'bin',
        'el-',
        'ed-',
        'en-',
        'er-',
        'es-',
        'et-',
        'ez-',
        'Abd',
        'Künyesi',
        'Adı',
      ],
      excludePatterns: [
        /^\d+$/,
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*SAYFA[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*İÇİNDEKİLER[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*KAYNAKLAR[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*BÖLÜM[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*FASIL[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*KISIM[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*ÖZET[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*GİRİŞ[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[A-ZÇĞİÖŞÜÂÎÛ\s]*SONUÇ[A-ZÇĞİÖŞÜÂÎÛ\s]*$/i,
        /^[-–=_\s]+$/,
        /^\([^)]*\)$/,
        /^İÇİNDEKİLER$/,
        /^KAYNAKÇA$/,
        /^DİZİN$/,
      ],
      alternativeNameSupport: true,
      confidenceThreshold: 40,
    };
  }
}
