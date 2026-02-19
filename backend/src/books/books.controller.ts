import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UploadService } from '../upload/upload.service';
import { AuthGuard } from '@nestjs/passport';
import * as fs from 'fs';
import * as path from 'path';

@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly uploadService: UploadService,
  ) { }

  // Public endpoint - must be before the guarded routes
  @Get('public/:id')
  findOnePublic(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang?: string,
  ) {
    return this.booksService.findOne(id);
  }

  @Get('with-articles')
  getBooksWithArticles(@Query('languageId') languageId?: string) {
    return this.booksService.getBooksWithArticles(languageId);
  }

  @Get('categories')
  getCategories(@Query('languageId') languageId?: string) {
    return this.booksService.getCategories(languageId);
  }

  @Get()
  findAll(
    @Query('languageId') languageId?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {

    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 12;
    return this.booksService.findAll(
      languageId,
      search,
      category,
      pageNumber,
      limitNumber,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {

    return this.booksService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Cover image işle
    const coverImageFile = files.find((f) => f.fieldname === 'coverImage');
    if (coverImageFile) {
      const coverImageUrl = await this.uploadService.uploadFile(coverImageFile);
      createBookDto.coverImage = coverImageUrl;
    }
    // Translations PDF dosyalarını eşleştir ve ID'leri number'a çevir
    if (
      createBookDto.translations &&
      Array.isArray(createBookDto.translations)
    ) {
      createBookDto.translations = await Promise.all(
        createBookDto.translations.map(async (trans: any, idx: number) => {
          const transData = {
            ...trans,
            languageId: parseInt(trans.languageId),
          };

          const pdfFile = files.find(
            (f) => f.fieldname === `translations[${idx}][pdfFile]`,
          );
          if (pdfFile) {
            transData.pdfUrl = await this.uploadService.uploadPdf(pdfFile);
          }
          return transData;
        }),
      );
    }
    // Kategorileri diziye dönüştür (eğer string olarak gelirse)
    if (createBookDto.category && !Array.isArray(createBookDto.category)) {
      if (typeof createBookDto.category === 'object') {
        createBookDto.category = Object.values(createBookDto.category);
      } else {
        createBookDto.category = [createBookDto.category];
      }
    }
    return this.booksService.create(createBookDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const book = await this.booksService.findOne(id);
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    // 📷 Cover image işlemi
    const coverImageFile = files.find((f) => f.fieldname === 'coverImage');
    if (coverImageFile) {
      // Eski dosya varsa sil
      if (book.coverImage) {
        const oldPath = path.join(process.cwd(), book.coverImage);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (err) {
            console.error(`Eski kapak silinemedi: ${err.message}`);
          }
        }
      }
      updateBookDto.coverImage =
        await this.uploadService.uploadFile(coverImageFile);
    }

    // 📄 Çevirilerin PDF dosyalarını eşle ve ID'leri number'a çevir
    if (
      updateBookDto.translations &&
      Array.isArray(updateBookDto.translations)
    ) {
      updateBookDto.translations = await Promise.all(
        updateBookDto.translations.map(async (trans: any, idx: number) => {
          const transData = {
            ...trans,
            id: trans.id ? parseInt(trans.id) : undefined,
            languageId: parseInt(trans.languageId),
          };

          const pdfFile = files.find(
            (f) => f.fieldname === `translations[${idx}][pdfFile]`,
          );
          if (pdfFile) {
            transData.pdfUrl = await this.uploadService.uploadPdf(pdfFile);
          }
          return transData;
        }),
      );
    }

    // Kategorileri diziye dönüştür (eğer string olarak gelirse)
    if (updateBookDto.category && !Array.isArray(updateBookDto.category)) {
      if (typeof updateBookDto.category === 'object') {
        updateBookDto.category = Object.values(updateBookDto.category);
      } else {
        updateBookDto.category = [updateBookDto.category];
      }
    }

    return this.booksService.update(id, updateBookDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deletedBook = await this.booksService.findOne(id);
    await this.booksService.remove(id);
    return {
      message: 'Kitap ve ilişkili dosyalar başarıyla silindi.',
      deletedBook,
    };
  }

  @Post(':id/page-translate')

  async translatePage(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      pageNumber: number;
      originalText: string;
      targetLangCode: string;
    },
  ) {
    const translatedText = await this.booksService.getOrTranslatePage(
      id,
      body.pageNumber,
      body.originalText,
      body.targetLangCode,
    );
    return { success: true, translatedText };
  }
}
