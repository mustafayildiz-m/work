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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const pdf_parsing_service_1 = require("../services/pdf-parsing.service");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UploadPDFDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable alternative name support (parantez içi isimler)', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true' || value === true)
            return true;
        if (value === 'false' || value === false)
            return false;
        return value;
    }),
    __metadata("design:type", Boolean)
], UploadPDFDto.prototype, "alternativeNameSupport", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Confidence threshold (40-100)', default: 40, minimum: 40, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(40),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], UploadPDFDto.prototype, "confidenceThreshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Minimum name length', default: 3, minimum: 1, maximum: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], UploadPDFDto.prototype, "minNameLength", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum name length', default: 120, minimum: 10, maximum: 200 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(10),
    (0, class_validator_1.Max)(200),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], UploadPDFDto.prototype, "maxNameLength", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Minimum word count', default: 2, minimum: 1, maximum: 5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], UploadPDFDto.prototype, "minWordCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum word count', default: 10, minimum: 5, maximum: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(20),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], UploadPDFDto.prototype, "maxWordCount", void 0);
class ParseDirectDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Path to PDF file', example: '/path/to/file.pdf' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ParseDirectDto.prototype, "filePath", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Parser configuration', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ParseDirectDto.prototype, "config", void 0);
class TestParserDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sample text to test parser', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TestParserDto.prototype, "sampleText", void 0);
let PDFController = class PDFController {
    constructor(pdfParsingService) {
        this.pdfParsingService = pdfParsingService;
    }
    async uploadAndParse(file, uploadDto) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (file.mimetype !== 'application/pdf') {
            throw new common_1.BadRequestException('Only PDF files are allowed');
        }
        try {
            const config = {
                alternativeNameSupport: uploadDto.alternativeNameSupport,
                confidenceThreshold: uploadDto.confidenceThreshold,
                minNameLength: uploadDto.minNameLength,
                maxNameLength: uploadDto.maxNameLength,
                minWordCount: uploadDto.minWordCount,
                maxWordCount: uploadDto.maxWordCount,
            };
            const result = await this.pdfParsingService.processPDF(file.path, undefined);
            return {
                message: 'PDF processing started successfully',
                jobId: result.jobId,
                filePath: file.path,
                originalName: file.originalname,
                size: file.size,
                config: config
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to start PDF processing: ${error.message}`);
        }
    }
    async getStatus(jobId) {
        try {
            return await this.pdfParsingService.getParsingStatus(jobId);
        }
        catch (error) {
            if (error.message.includes('not found')) {
                throw new common_1.NotFoundException(error.message);
            }
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async parseDirect(body) {
        try {
            const result = await this.pdfParsingService.parseScholarsPDF(body.filePath, body.config);
            return {
                success: true,
                scholarCount: result.scholars.length,
                scholars: result.scholars.slice(0, 10),
                metadata: result.metadata
            };
        }
        catch (error) {
            if (error.message.includes('not found')) {
                throw new common_1.NotFoundException(error.message);
            }
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async getAllJobs() {
        try {
            return await this.pdfParsingService.getAllJobs();
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async cleanJobs() {
        try {
            const result = await this.pdfParsingService.cleanJobs();
            return {
                message: 'Jobs cleaned successfully',
                ...result
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async testParser(testData) {
        try {
            return await this.pdfParsingService.testParser(testData?.sampleText);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    getParserInfo() {
        return {
            name: 'PDFSpecificScholarParser',
            version: '2.0.0',
            description: 'Advanced PDF parser specifically designed for Islamic scholar biographies',
            capabilities: [
                'Scholar name detection with confidence scoring',
                'Alternative name extraction (parantez içi isimler)',
                'Hijri and Miladi date extraction',
                'Lineage information extraction',
                'Biography text processing',
                'Pattern-based filtering',
                'Batch processing support'
            ],
            supportedFormats: [
                'PDF files with Turkish/Arabic text',
                'Scholar biographies in specific format',
                'Mixed content with dates and lineage info'
            ],
            datePatterns: [
                '243 (m. 857) - Hijri (Miladi)',
                '699-767 - Two dates',
                'doğumu 699 - Single date',
                'vefât 767 - Death date',
            ],
            lineageKeywords: [
                'İbn', 'Ebu', 'Ebû', 'bin', 'el-', 'ed-', 'en-', 'er-', 'es-', 'et-', 'ez-', 'Abd', 'Künyesi', 'Adı'
            ],
            excludePatterns: [
                'SAYFA', 'İÇİNDEKİLER', 'KAYNAKLAR', 'BÖLÜM', 'FASIL', 'KISIM', 'ÖZET', 'GİRİŞ', 'SONUÇ'
            ]
        };
    }
};
exports.PDFController = PDFController;
__decorate([
    (0, common_1.Post)('upload-and-parse'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Upload PDF file for scholar parsing',
        type: 'multipart/form-data',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'PDF file containing scholar biographies'
                },
                alternativeNameSupport: {
                    type: 'boolean',
                    description: 'Enable alternative name support',
                    default: true
                },
                confidenceThreshold: {
                    type: 'number',
                    description: 'Confidence threshold (40-100)',
                    default: 40,
                    minimum: 40,
                    maximum: 100
                },
                minNameLength: {
                    type: 'number',
                    description: 'Minimum name length',
                    default: 3,
                    minimum: 1,
                    maximum: 50
                },
                maxNameLength: {
                    type: 'number',
                    description: 'Maximum name length',
                    default: 120,
                    minimum: 10,
                    maximum: 200
                },
                minWordCount: {
                    type: 'number',
                    description: 'Minimum word count',
                    default: 2,
                    minimum: 1,
                    maximum: 5
                },
                maxWordCount: {
                    type: 'number',
                    description: 'Maximum word count',
                    default: 10,
                    minimum: 5,
                    maximum: 20
                }
            }
        }
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Upload and parse PDF for scholars' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'PDF processing started successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                jobId: { type: 'string' },
                filePath: { type: 'string' },
                config: { type: 'object' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - invalid file or parameters' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UploadPDFDto]),
    __metadata("design:returntype", Promise)
], PDFController.prototype, "uploadAndParse", null);
__decorate([
    (0, common_1.Get)('status/:jobId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get parsing job status' }),
    (0, swagger_1.ApiParam)({ name: 'jobId', description: 'Job ID', example: '123' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Job status retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                progress: { type: 'number' },
                state: { type: 'string' },
                result: { type: 'object' },
                failedReason: { type: 'string' },
                data: { type: 'object' },
                processedOn: { type: 'number' },
                finishedOn: { type: 'number' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Job not found' }),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PDFController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('parse-direct'),
    (0, swagger_1.ApiOperation)({ summary: 'Parse PDF directly (synchronous)' }),
    (0, swagger_1.ApiBody)({ type: ParseDirectDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'PDF parsed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                scholarCount: { type: 'number' },
                scholars: {
                    type: 'array',
                    items: { type: 'object' }
                },
                metadata: { type: 'object' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - invalid file path' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ParseDirectDto]),
    __metadata("design:returntype", Promise)
], PDFController.prototype, "parseDirect", null);
__decorate([
    (0, common_1.Get)('jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all processing jobs' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Jobs retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    state: { type: 'string' },
                    progress: { type: 'number' },
                    data: { type: 'object' },
                    processedOn: { type: 'number' },
                    finishedOn: { type: 'number' },
                    failedReason: { type: 'string' }
                }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PDFController.prototype, "getAllJobs", null);
__decorate([
    (0, common_1.Post)('clean-jobs'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Clean completed and failed jobs' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Jobs cleaned successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                cleaned: { type: 'number' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PDFController.prototype, "cleanJobs", null);
__decorate([
    (0, common_1.Post)('test-parser'),
    (0, swagger_1.ApiOperation)({ summary: 'Test parser with sample data' }),
    (0, swagger_1.ApiBody)({ type: TestParserDto, required: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Parser test completed',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                scholarCount: { type: 'number' },
                scholars: {
                    type: 'array',
                    items: { type: 'object' }
                },
                testText: { type: 'string' },
                error: { type: 'string' }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TestParserDto]),
    __metadata("design:returntype", Promise)
], PDFController.prototype, "testParser", null);
__decorate([
    (0, common_1.Get)('parser-info'),
    (0, swagger_1.ApiOperation)({ summary: 'Get parser configuration and capabilities' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Parser info retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                version: { type: 'string' },
                description: { type: 'string' },
                capabilities: { type: 'array' },
                supportedFormats: { type: 'array' },
                datePatterns: { type: 'array' },
                lineageKeywords: { type: 'array' },
                excludePatterns: { type: 'array' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PDFController.prototype, "getParserInfo", null);
exports.PDFController = PDFController = __decorate([
    (0, swagger_1.ApiTags)('PDF Processing'),
    (0, common_1.Controller)('pdf'),
    __metadata("design:paramtypes", [pdf_parsing_service_1.PDFParsingService])
], PDFController);
//# sourceMappingURL=pdf.controller.js.map