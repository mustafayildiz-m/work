import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Patch,
} from '@nestjs/common';
import { ScholarPostsService } from './scholar-posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { CreateTranslationDto } from './dto/create-scholar-post.dto';
import { UpdateTranslationDto } from './dto/update-scholar-post.dto';

@Controller('scholar-posts')
export class ScholarPostsController {
  constructor(private readonly scholarPostsService: ScholarPostsService) { }

  // Public endpoint - must be before the guarded routes
  @Get('public/:id')
  findOnePublic(@Param('id') id: string, @Query('language') language?: string) {
    return this.scholarPostsService.findOne(id, language);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = 'uploads/posts';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    // Dosya yollarını ayıkla
    const fileUrls =
      files?.map((file) => `/uploads/posts/${file.filename}`) || [];

    // Translation oluştur
    const translation: CreateTranslationDto = {
      language: body.language || 'tr',
      content: body.content,
      mediaUrls: body.mediaUrls ? JSON.parse(body.mediaUrls) : [],
      fileUrls,
      status: body.status || undefined,
    };

    return this.scholarPostsService.create({
      scholarId: Number(body.scholarId),
      translations: [translation],
    });
  }

  @Get('scholar/:scholarId')
  findAll(
    @Param('scholarId') scholarId: string,
    @Query('language') language?: string,
  ) {
    return this.scholarPostsService.findAll(Number(scholarId), language);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Query('language') language?: string) {
    return this.scholarPostsService.findOne(id, language);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.scholarPostsService.remove(id);
  }

  // Translation ekleme/güncelleme endpoint'i
  @Patch(':postId/translations/:language')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = 'uploads/posts';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async addOrUpdateTranslation(
    @Param('postId') postId: string,
    @Param('language') language: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    const fileUrls =
      files?.map((file) => `/uploads/posts/${file.filename}`) || [];

    // Mevcut dosya yollarını birleştir
    let allFileUrls = fileUrls;
    if (body.fileUrls) {
      const existingFiles =
        typeof body.fileUrls === 'string'
          ? JSON.parse(body.fileUrls)
          : body.fileUrls;
      allFileUrls = [...existingFiles, ...fileUrls];
    }

    let mediaUrls = [];
    if (body.mediaUrls) {
      mediaUrls =
        typeof body.mediaUrls === 'string'
          ? JSON.parse(body.mediaUrls)
          : body.mediaUrls;
    }

    const translationData: UpdateTranslationDto = {
      content: body.content,
      mediaUrls,
      fileUrls: allFileUrls,
      status: body.status,
      translatedBy: body.translatedBy ? Number(body.translatedBy) : undefined,
      approvedBy: body.approvedBy ? Number(body.approvedBy) : undefined,
    };

    return this.scholarPostsService.addOrUpdateTranslation(
      postId,
      language,
      translationData,
    );
  }

  // Translation silme endpoint'i
  @Delete(':postId/translations/:language')
  @UseGuards(JwtAuthGuard)
  removeTranslation(
    @Param('postId') postId: string,
    @Param('language') language: string,
  ) {
    return this.scholarPostsService.deleteTranslation(postId, language);
  }
}
