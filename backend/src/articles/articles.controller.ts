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
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { UploadService } from '../upload/upload.service';
import { AuthGuard } from '@nestjs/passport';
import * as fs from 'fs';
import * as path from 'path';

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly uploadService: UploadService,
  ) { }

  // Public endpoint - must be before the guarded routes
  @Get('public/:id')
  findOnePublic(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang?: string,
  ) {
    return this.articlesService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @Query('ignorePdfErrors') ignorePdfErrors: string | undefined,
    @Body() createArticleDto: CreateArticleDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Cover image işle
    const coverImageFile = files.find((f) => f.fieldname === 'coverImage');
    if (coverImageFile) {
      const coverImageUrl = await this.uploadService.uploadFile(coverImageFile);
      createArticleDto.coverImage = coverImageUrl;
    }

    // Translations PDF dosyalarını eşleştir
    if (
      createArticleDto.translations &&
      Array.isArray(createArticleDto.translations)
    ) {
      createArticleDto.translations = await Promise.all(
        createArticleDto.translations.map(async (trans: any, idx: number) => {
          const transData = { ...trans };
          const pdfFile = files.find(
            (f) => f.fieldname === `translations[${idx}][pdfFile]`,
          );

          if (pdfFile) {
            transData.pdfUrl = await this.uploadService.uploadPdf(pdfFile);

            // 🛡️ PDF Metin Kalitesi Kontrolü
            const pdfAbsPath = path.join(process.cwd(), transData.pdfUrl);
            try {
              await this.articlesService.validatePdf(pdfAbsPath);
            } catch (error) {
              if (ignorePdfErrors === 'true') {
                console.warn(`Kullanıcı onayı ile bozuk PDF kabul edildi: ${transData.pdfUrl}`);
              } else {
                // Clean up
                try {
                  if (fs.existsSync(pdfAbsPath)) fs.unlinkSync(pdfAbsPath);
                } catch (e) {
                  console.error('Yüklenen bozuk PDF silinemedi:', e);
                }
                throw new BadRequestException('PDF_INVALID_CONFIRM_NEEDED');
              }
            }
          }
          return transData;
        }),
      );
    }

    return this.articlesService.create(createArticleDto);
  }

  @Get('book/:bookId')
  findAllByBook(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Query('languageId') languageId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.articlesService.findAllByBook(
      bookId,
      languageId,
      search,
      pageNumber,
      limitNumber,
    );
  }

  @Get()
  findAll(
    @Query('languageId') languageId?: string,
    @Query('search') search?: string,
    @Query('bookIds') bookIds?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.articlesService.findAll(
      languageId,
      search,
      bookIds,
      pageNumber,
      limitNumber,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.findOne(id);
  }


  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Query('ignorePdfErrors') ignorePdfErrors: string | undefined,
    @Body() updateArticleDto: UpdateArticleDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // 🔍 DEBUG: Gelen veriyi logla
    console.log('📝 Article Update - ID:', id);
    console.log(
      '📦 Translations:',
      JSON.stringify(updateArticleDto.translations, null, 2),
    );

    // Cover image işle
    const coverImageFile = files.find((f) => f.fieldname === 'coverImage');
    if (coverImageFile) {
      const coverImageUrl = await this.uploadService.uploadFile(coverImageFile);
      updateArticleDto.coverImage = coverImageUrl;
    }

    // Translations PDF dosyalarını eşleştir
    if (
      updateArticleDto.translations &&
      Array.isArray(updateArticleDto.translations)
    ) {
      updateArticleDto.translations = await Promise.all(
        updateArticleDto.translations.map(async (trans: any, idx: number) => {
          const transData = { ...trans };
          const pdfFile = files.find(
            (f) => f.fieldname === `translations[${idx}][pdfFile]`,
          );

          if (pdfFile) {
            console.log(`✅ Translation [${idx}]: Yeni PDF yüklendi`);
            transData.pdfUrl = await this.uploadService.uploadPdf(pdfFile);

            // 🛡️ PDF Metin Kalitesi Kontrolü
            const pdfAbsPath = path.join(process.cwd(), transData.pdfUrl);
            try {
              await this.articlesService.validatePdf(pdfAbsPath);
            } catch (error) {
              if (ignorePdfErrors === 'true') {
                console.warn(`Kullanıcı onayı ile bozuk PDF kabul edildi: ${transData.pdfUrl}`);
              } else {
                // Clean up
                try {
                  if (fs.existsSync(pdfAbsPath)) fs.unlinkSync(pdfAbsPath);
                } catch (e) {
                  console.error('Yüklenen bozuk PDF silinemedi:', e);
                }
                throw new BadRequestException('PDF_INVALID_CONFIRM_NEEDED');
              }
            }
          } else {
            console.log(`📄 Translation [${idx}]: PDF yok, mevcut data:`, {
              id: trans.id,
              pdfUrl: trans.pdfUrl,
            });
          }
          return transData;
        }),
      );
    }

    return this.articlesService.update(id, updateArticleDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.articlesService.remove(id);
    return {
      message: 'Makale ve ilişkili dosyalar başarıyla silindi.',
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
    const translatedText = await this.articlesService.getOrTranslatePage(
      id,
      body.pageNumber,
      body.originalText,
      body.targetLangCode,
    );
    return { translatedText };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('book/:bookId/reorder')
  async reorder(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Body() body: { articles: { id: number; orderIndex: number }[] },
  ) {
    await this.articlesService.reorderArticles(bookId, body.articles);
    return {
      message: 'Makaleler başarıyla sıralandı.',
    };
  }
}
