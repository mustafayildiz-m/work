import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Param,
  Body,
  Query,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { PDFParsingService } from '../services/pdf-parsing.service';
import { ParserConfig } from '../services/enhanced-pdf-parser';
import {
  IsOptional,
  IsBoolean,
  IsNumber,
  IsString,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

// DTO Definitions
class UploadPDFDto {
  @ApiProperty({
    description: 'Enable alternative name support (parantez içi isimler)',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  alternativeNameSupport?: boolean;

  @ApiProperty({
    description: 'Confidence threshold (40-100)',
    default: 40,
    minimum: 40,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(40)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  confidenceThreshold?: number;

  @ApiProperty({
    description: 'Minimum name length',
    default: 3,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => parseInt(value))
  minNameLength?: number;

  @ApiProperty({
    description: 'Maximum name length',
    default: 120,
    minimum: 10,
    maximum: 200,
  })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(200)
  @Transform(({ value }) => parseInt(value))
  maxNameLength?: number;

  @ApiProperty({
    description: 'Minimum word count',
    default: 2,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value))
  minWordCount?: number;

  @ApiProperty({
    description: 'Maximum word count',
    default: 10,
    minimum: 5,
    maximum: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(20)
  @Transform(({ value }) => parseInt(value))
  maxWordCount?: number;
}

class ParseDirectDto {
  @ApiProperty({
    description: 'Path to PDF file',
    example: '/path/to/file.pdf',
  })
  @IsString()
  filePath: string;

  @ApiProperty({ description: 'Parser configuration', required: false })
  @IsOptional()
  config?: Partial<ParserConfig>;
}

class TestParserDto {
  @ApiProperty({ description: 'Sample text to test parser', required: false })
  @IsOptional()
  @IsString()
  sampleText?: string;
}

@ApiTags('PDF Processing')
@Controller('pdf')
export class PDFController {
  constructor(private pdfParsingService: PDFParsingService) {}

  @Post('upload-and-parse')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload PDF file for scholar parsing',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF file containing scholar biographies',
        },
        alternativeNameSupport: {
          type: 'boolean',
          description: 'Enable alternative name support',
          default: true,
        },
        confidenceThreshold: {
          type: 'number',
          description: 'Confidence threshold (40-100)',
          default: 40,
          minimum: 40,
          maximum: 100,
        },
        minNameLength: {
          type: 'number',
          description: 'Minimum name length',
          default: 3,
          minimum: 1,
          maximum: 50,
        },
        maxNameLength: {
          type: 'number',
          description: 'Maximum name length',
          default: 120,
          minimum: 10,
          maximum: 200,
        },
        minWordCount: {
          type: 'number',
          description: 'Minimum word count',
          default: 2,
          minimum: 1,
          maximum: 5,
        },
        maxWordCount: {
          type: 'number',
          description: 'Maximum word count',
          default: 10,
          minimum: 5,
          maximum: 20,
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload and parse PDF for scholars' })
  @ApiResponse({
    status: 200,
    description: 'PDF processing started successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        jobId: { type: 'string' },
        filePath: { type: 'string' },
        config: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid file or parameters',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async uploadAndParse(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadPDFDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    try {
      const config: Partial<ParserConfig> = {
        alternativeNameSupport: uploadDto.alternativeNameSupport,
        confidenceThreshold: uploadDto.confidenceThreshold,
        minNameLength: uploadDto.minNameLength,
        maxNameLength: uploadDto.maxNameLength,
        minWordCount: uploadDto.minWordCount,
        maxWordCount: uploadDto.maxWordCount,
      };

      const result = await this.pdfParsingService.processPDF(
        file.path,
        undefined,
      );

      return {
        message: 'PDF processing started successfully',
        jobId: result.jobId,
        filePath: file.path,
        originalName: file.originalname,
        size: file.size,
        config: config,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to start PDF processing: ${error.message}`,
      );
    }
  }

  @Get('status/:jobId')
  @ApiOperation({ summary: 'Get parsing job status' })
  @ApiParam({ name: 'jobId', description: 'Job ID', example: '123' })
  @ApiResponse({
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
        finishedOn: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getStatus(@Param('jobId') jobId: string) {
    try {
      return await this.pdfParsingService.getParsingStatus(jobId);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('parse-direct')
  @ApiOperation({ summary: 'Parse PDF directly (synchronous)' })
  @ApiBody({ type: ParseDirectDto })
  @ApiResponse({
    status: 200,
    description: 'PDF parsed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        scholarCount: { type: 'number' },
        scholars: {
          type: 'array',
          items: { type: 'object' },
        },
        metadata: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid file path' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async parseDirect(@Body() body: ParseDirectDto) {
    try {
      const result = await this.pdfParsingService.parseScholarsPDF(
        body.filePath,
        body.config,
      );

      return {
        success: true,
        scholarCount: result.scholars.length,
        scholars: result.scholars.slice(0, 10), // Return first 10 scholars
        metadata: result.metadata,
      };
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get all processing jobs' })
  @ApiResponse({
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
          failedReason: { type: 'string' },
        },
      },
    },
  })
  async getAllJobs() {
    try {
      return await this.pdfParsingService.getAllJobs();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('clean-jobs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clean completed and failed jobs' })
  @ApiResponse({
    status: 200,
    description: 'Jobs cleaned successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        cleaned: { type: 'number' },
      },
    },
  })
  async cleanJobs() {
    try {
      const result = await this.pdfParsingService.cleanJobs();
      return {
        message: 'Jobs cleaned successfully',
        ...result,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('test-parser')
  @ApiOperation({ summary: 'Test parser with sample data' })
  @ApiBody({ type: TestParserDto, required: false })
  @ApiResponse({
    status: 200,
    description: 'Parser test completed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        scholarCount: { type: 'number' },
        scholars: {
          type: 'array',
          items: { type: 'object' },
        },
        testText: { type: 'string' },
        error: { type: 'string' },
      },
    },
  })
  async testParser(@Body() testData?: TestParserDto) {
    try {
      return await this.pdfParsingService.testParser(testData?.sampleText);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('parser-info')
  @ApiOperation({ summary: 'Get parser configuration and capabilities' })
  @ApiResponse({
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
        excludePatterns: { type: 'array' },
      },
    },
  })
  getParserInfo() {
    return {
      name: 'PDFSpecificScholarParser',
      version: '2.0.0',
      description:
        'Advanced PDF parser specifically designed for Islamic scholar biographies',
      capabilities: [
        'Scholar name detection with confidence scoring',
        'Alternative name extraction (parantez içi isimler)',
        'Hijri and Miladi date extraction',
        'Lineage information extraction',
        'Biography text processing',
        'Pattern-based filtering',
        'Batch processing support',
      ],
      supportedFormats: [
        'PDF files with Turkish/Arabic text',
        'Scholar biographies in specific format',
        'Mixed content with dates and lineage info',
      ],
      datePatterns: [
        '243 (m. 857) - Hijri (Miladi)',
        '699-767 - Two dates',
        'doğumu 699 - Single date',
        'vefât 767 - Death date',
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
        'SAYFA',
        'İÇİNDEKİLER',
        'KAYNAKLAR',
        'BÖLÜM',
        'FASIL',
        'KISIM',
        'ÖZET',
        'GİRİŞ',
        'SONUÇ',
      ],
    };
  }
}
