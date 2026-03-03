import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { LanguageService } from '../services/language.service';
import { CreateLanguageDto } from '../dto/create-language.dto';
import { UpdateLanguageDto } from '../dto/update-language.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('flag', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = 'uploads/language_flags';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `language-flag-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Sadece resim dosyaları yükleyebilirsiniz (JPG, PNG, GIF, WebP, SVG)',
            ),
            false,
          );
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  create(
    @Body() createLanguageDto: CreateLanguageDto,
    @UploadedFile() flag?: Express.Multer.File,
  ) {
    if (flag) {
      createLanguageDto.flagUrl = `/uploads/language_flags/${flag.filename}`;
    }
    return this.languageService.create(createLanguageDto);
  }

  @Get()
  findAll() {
    return this.languageService.findAll();
  }

  @Get('book-counts')
  getBookCounts() {
    return this.languageService.getBookCounts();
  }

  @Get('article-counts')
  getArticleCounts() {
    return this.languageService.getArticleCounts();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.languageService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('flag', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = 'uploads/language_flags';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `language-flag-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Sadece resim dosyaları yükleyebilirsiniz (JPG, PNG, GIF, WebP, SVG)',
            ),
            false,
          );
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLanguageDto: UpdateLanguageDto,
    @UploadedFile() flag?: Express.Multer.File,
  ) {
    if (flag) {
      updateLanguageDto.flagUrl = `/uploads/language_flags/${flag.filename}`;
    }
    return this.languageService.update(id, updateLanguageDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.languageService.remove(id);
  }
}
