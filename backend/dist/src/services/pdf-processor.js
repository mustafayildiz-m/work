"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PDFProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const pdf_parsing_service_1 = require("./pdf-parsing.service");
let PDFProcessor = PDFProcessor_1 = class PDFProcessor {
    constructor(pdfParsingService) {
        this.pdfParsingService = pdfParsingService;
        this.logger = new common_1.Logger(PDFProcessor_1.name);
    }
    async handlePDFParsing(job) {
        const startTime = Date.now();
        const { filePath, userId, parserConfig, metadata } = job.data;
        try {
            this.logger.log(`Starting PDF parsing job ${job.id} for: ${filePath}`);
            job.progress(10);
            const result = await this.pdfParsingService.parseScholarsPDF(filePath, parserConfig);
            job.progress(90);
            const scholars = result.scholars;
            const avgConfidence = scholars.length > 0
                ? scholars.reduce((sum, s) => sum + (s.confidence || 0), 0) / scholars.length
                : 0;
            const scholarsWithAlternativeNames = scholars.filter(s => s.alternativeName).length;
            const scholarsWithDates = scholars.filter(s => s.birthDate || s.deathDate || s.birthDateHijri || s.deathDateHijri).length;
            const scholarsWithLineage = scholars.filter(s => s.lineage).length;
            const processingTimeMs = Date.now() - startTime;
            const processResult = {
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
                }
            };
            this.logger.log(`Successfully completed PDF parsing job ${job.id}: ${result.metadata.totalCount} scholars found in ${processingTimeMs}ms`);
            job.progress(100);
            return processResult;
        }
        catch (error) {
            const processingTimeMs = Date.now() - startTime;
            this.logger.error(`PDF parsing job ${job.id} failed for ${filePath}:`, error);
            const errorResult = {
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
                }
            };
            return errorResult;
        }
    }
};
exports.PDFProcessor = PDFProcessor;
__decorate([
    (0, bull_1.Process)('parse-pdf'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PDFProcessor.prototype, "handlePDFParsing", null);
exports.PDFProcessor = PDFProcessor = PDFProcessor_1 = __decorate([
    (0, bull_1.Processor)('pdf-processing'),
    __metadata("design:paramtypes", [pdf_parsing_service_1.PDFParsingService])
], PDFProcessor);
//# sourceMappingURL=pdf-processor.js.map