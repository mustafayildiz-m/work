import { PDFParsingService } from '../services/pdf-parsing.service';
import { ParserConfig } from '../services/enhanced-pdf-parser';
declare class UploadPDFDto {
    alternativeNameSupport?: boolean;
    confidenceThreshold?: number;
    minNameLength?: number;
    maxNameLength?: number;
    minWordCount?: number;
    maxWordCount?: number;
}
declare class ParseDirectDto {
    filePath: string;
    config?: Partial<ParserConfig>;
}
declare class TestParserDto {
    sampleText?: string;
}
export declare class PDFController {
    private pdfParsingService;
    constructor(pdfParsingService: PDFParsingService);
    uploadAndParse(file: Express.Multer.File, uploadDto: UploadPDFDto): Promise<{
        message: string;
        jobId: string;
        filePath: string;
        originalName: string;
        size: number;
        config: Partial<ParserConfig>;
    }>;
    getStatus(jobId: string): Promise<any>;
    parseDirect(body: ParseDirectDto): Promise<{
        success: boolean;
        scholarCount: number;
        scholars: import("../services/enhanced-pdf-parser").ScholarData[];
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
    getAllJobs(): Promise<any[]>;
    cleanJobs(): Promise<{
        cleaned: number;
        message: string;
    }>;
    testParser(testData?: TestParserDto): Promise<any>;
    getParserInfo(): {
        name: string;
        version: string;
        description: string;
        capabilities: string[];
        supportedFormats: string[];
        datePatterns: string[];
        lineageKeywords: string[];
        excludePatterns: string[];
    };
}
export {};
