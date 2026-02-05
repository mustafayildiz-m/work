"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PDFParsingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFParsingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
const enhanced_pdf_parser_1 = require("./enhanced-pdf-parser");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
let PDFParsingService = PDFParsingService_1 = class PDFParsingService {
    constructor(configService, pdfQueue) {
        this.configService = configService;
        this.pdfQueue = pdfQueue;
        this.logger = new common_1.Logger(PDFParsingService_1.name);
    }
    async processPDF(filePath, userId) {
        try {
            await this.validateFile(filePath);
            const job = await this.pdfQueue.add('parse-pdf', {
                filePath,
                userId,
                timestamp: new Date(),
                parserConfig: this.getParserConfig(),
            }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
                removeOnComplete: 10,
                removeOnFail: 5,
            });
            this.logger.log(`PDF processing job ${job.id} queued for file: ${filePath}`);
            return { jobId: job.id.toString() };
        }
        catch (error) {
            this.logger.error(`Failed to queue PDF processing for ${filePath}:`, error);
            throw new Error(`Failed to queue PDF processing: ${error.message}`);
        }
    }
    async getParsingStatus(jobId) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get job status for ${jobId}:`, error);
            throw new Error(`Failed to get job status: ${error.message}`);
        }
    }
    async parseScholarsPDF(filePath, config) {
        try {
            await this.validateFile(filePath);
            const outputPath = this.generateOutputPath(filePath);
            const parserConfig = { ...this.getParserConfig(), ...config };
            this.logger.log(`Starting direct PDF parsing for: ${filePath}`);
            const parser = new enhanced_pdf_parser_1.PDFSpecificScholarParser(filePath, outputPath, parserConfig);
            const scholars = await parser.process();
            const highConfidence = scholars.filter(s => (s.confidence || 0) >= 80).length;
            const mediumConfidence = scholars.filter(s => (s.confidence || 0) >= 60 && (s.confidence || 0) < 80).length;
            const lowConfidence = scholars.filter(s => (s.confidence || 0) >= 40 && (s.confidence || 0) < 60).length;
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
                }
            };
            this.logger.log(`Successfully parsed ${scholars.length} scholars from ${filePath}`);
            return result;
        }
        catch (error) {
            this.logger.error(`PDF parsing failed for ${filePath}:`, error);
            throw new Error(`PDF parsing failed: ${error.message}`);
        }
    }
    async testParser(sampleText) {
        const testText = sampleText || `
      HENNÂD BİN SERÎ
      Bu âlim hakkında bilgi...
      
      HETTÂR (Îsâ bin İkbâl)
      Bu âlim hakkında bilgi...
      
      İMAM EBU HANİFE
      Bu âlim hakkında bilgi...
    `;
        try {
            const testFilePath = path.join(process.cwd(), 'temp-test.txt');
            await fs.writeFile(testFilePath, testText, 'utf8');
            const outputPath = this.generateOutputPath('test');
            const parser = new enhanced_pdf_parser_1.PDFSpecificScholarParser(testFilePath, outputPath, this.getParserConfig());
            const scholars = await parser.process();
            await fs.unlink(testFilePath);
            return {
                success: true,
                scholarCount: scholars.length,
                scholars: scholars.slice(0, 5),
                testText: testText.substring(0, 200) + '...',
            };
        }
        catch (error) {
            this.logger.error('Parser test failed:', error);
            return {
                success: false,
                error: error.message,
                testText: testText.substring(0, 200) + '...',
            };
        }
    }
    async getAllJobs() {
        try {
            const jobs = await this.pdfQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
            return jobs.map(job => ({
                id: job.id,
                state: job.opts.delay ? 'delayed' : 'waiting',
                progress: job.progress(),
                data: job.data,
                processedOn: job.processedOn,
                finishedOn: job.finishedOn,
                failedReason: job.failedReason,
            }));
        }
        catch (error) {
            this.logger.error('Failed to get jobs:', error);
            throw new Error(`Failed to get jobs: ${error.message}`);
        }
    }
    async cleanJobs() {
        try {
            await this.pdfQueue.clean(24 * 60 * 60 * 1000, 'completed');
            await this.pdfQueue.clean(7 * 24 * 60 * 60 * 1000, 'failed');
            this.logger.log('Job cleanup completed');
            return { cleaned: 1 };
        }
        catch (error) {
            this.logger.error('Failed to clean jobs:', error);
            throw new Error(`Failed to clean jobs: ${error.message}`);
        }
    }
    async validateFile(filePath) {
        try {
            await fs.access(filePath);
        }
        catch (error) {
            throw new Error(`File not found: ${filePath}`);
        }
    }
    generateOutputPath(inputPath) {
        const uploadsDir = this.configService.get('UPLOADS_DIR', './uploads');
        const fileName = `scholars-${Date.now()}.json`;
        return path.join(uploadsDir, 'processed', fileName);
    }
    getParserConfig() {
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
            lineageKeywords: ['İbn', 'Ebu', 'Ebû', 'bin', 'el-', 'ed-', 'en-', 'er-', 'es-', 'et-', 'ez-', 'Abd', 'Künyesi', 'Adı'],
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
};
exports.PDFParsingService = PDFParsingService;
exports.PDFParsingService = PDFParsingService = PDFParsingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bull_1.InjectQueue)('pdf-processing')),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], PDFParsingService);
//# sourceMappingURL=pdf-parsing.service.js.map