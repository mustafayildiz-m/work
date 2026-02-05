import { Job } from 'bull';
import { PDFParsingService } from './pdf-parsing.service';
import { ParserConfig } from './enhanced-pdf-parser';
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
export declare class PDFProcessor {
    private pdfParsingService;
    private readonly logger;
    constructor(pdfParsingService: PDFParsingService);
    handlePDFParsing(job: Job<PDFProcessingJobData>): Promise<PDFProcessingResult>;
}
