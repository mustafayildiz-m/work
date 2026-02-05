import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { ScholarData, ParserConfig } from './enhanced-pdf-parser';
export declare class PDFParsingService {
    private configService;
    private pdfQueue;
    private readonly logger;
    constructor(configService: ConfigService, pdfQueue: Queue);
    processPDF(filePath: string, userId?: string): Promise<{
        jobId: string;
    }>;
    getParsingStatus(jobId: string): Promise<any>;
    parseScholarsPDF(filePath: string, config?: Partial<ParserConfig>): Promise<{
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
    }>;
    testParser(sampleText?: string): Promise<any>;
    getAllJobs(): Promise<any[]>;
    cleanJobs(): Promise<{
        cleaned: number;
    }>;
    private validateFile;
    private generateOutputPath;
    private getParserConfig;
}
