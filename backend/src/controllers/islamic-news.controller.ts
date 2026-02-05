import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { IslamicNewsService } from '../services/islamic-news.service';
import { CreateIslamicNewsDto } from '../dto/islamic-news/create-islamic-news.dto';
import { UpdateIslamicNewsDto } from '../dto/islamic-news/update-islamic-news.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('islamic-news')
export class IslamicNewsController {
  constructor(private readonly islamicNewsService: IslamicNewsService) {}

  // Dış API'den güncel haberleri getir ve veritabanına kaydet (Admin için)
  @Get('fetch-latest')
  @UseGuards(AuthGuard('jwt'))
  async fetchLatestNews() {
    return this.islamicNewsService.fetchLatestNews();
  }

  // Arşiv haberleri getir
  @Get('fetch-archive')
  async fetchArchiveNews(
    @Query('from_date') fromDate: string,
    @Query('to_date') toDate: string,
  ) {
    if (!fromDate || !toDate) {
      return {
        status: 'error',
        message: 'from_date and to_date parameters are required',
      };
    }
    return this.islamicNewsService.fetchArchiveNews(fromDate, toDate);
  }

  // Veritabanından tüm haberleri getir (Cache ile)
  @Get()
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('language') language?: string,
    @Query('country') country?: string,
    @Query('category') category?: string,
    @Query('is_archived') isArchived?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    const offsetNumber = offset ? parseInt(offset, 10) : 0;
    const isArchivedBoolean = isArchived ? isArchived === 'true' : undefined;

    const [news, totalCount] =
      await this.islamicNewsService.getNewsFromDatabase(
        limitNumber,
        offsetNumber,
        language,
        country,
        category,
        isArchivedBoolean,
      );

    // Cache header'ları ekle (5 dakika)
    if (res) {
      res.set({
        'Cache-Control': 'public, max-age=300', // 5 dakika
        ETag: `news-${totalCount}-${offsetNumber}`,
        'Last-Modified': new Date().toUTCString(),
      });
    }

    return {
      news,
      totalCount,
      hasMore: offsetNumber + limitNumber < totalCount,
      pagination: {
        limit: limitNumber,
        offset: offsetNumber,
        total: totalCount,
      },
    };
  }

  // ID'ye göre haber getir
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const news = await this.islamicNewsService.findOne(id);
    if (!news) {
      throw new NotFoundException('Haber bulunamadı');
    }
    return news;
  }

  // Haber arama
  @Get('search/:query')
  async searchNews(
    @Param('query') query: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    const offsetNumber = offset ? parseInt(offset, 10) : 0;

    const [news, totalCount] = await this.islamicNewsService.searchNews(
      query,
      limitNumber,
      offsetNumber,
    );

    return {
      news,
      totalCount,
      hasMore: offsetNumber + limitNumber < totalCount,
      searchQuery: query,
      pagination: {
        limit: limitNumber,
        offset: offsetNumber,
        total: totalCount,
      },
    };
  }

  // Yeni haber oluştur (Admin için)
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createIslamicNewsDto: CreateIslamicNewsDto) {
    return this.islamicNewsService.create(createIslamicNewsDto);
  }

  // Haber güncelle (Admin için)
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIslamicNewsDto: UpdateIslamicNewsDto,
  ) {
    const news = await this.islamicNewsService.update(id, updateIslamicNewsDto);
    if (!news) {
      throw new NotFoundException('Haber bulunamadı');
    }
    return news;
  }

  // Haber sil (Admin için)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.islamicNewsService.remove(id);
    return { message: 'News article deleted successfully' };
  }

  // Eski haberleri temizle (Admin için)
  @Delete('clean/old')
  @UseGuards(AuthGuard('jwt'))
  async cleanOldNews() {
    const deletedCount = await this.islamicNewsService.cleanOldNews();
    return {
      message: 'Old news cleaned successfully',
      deletedCount,
    };
  }

  // Haber istatistikleri
  @Get('stats/summary')
  async getNewsStats() {
    const [allNews, allCount] = await this.islamicNewsService.findAll();
    const [archivedNews, archivedCount] =
      await this.islamicNewsService.getNewsFromDatabase(
        1000,
        0,
        undefined,
        undefined,
        undefined,
        true,
      );
    const [latestNews, latestCount] =
      await this.islamicNewsService.getNewsFromDatabase(
        1000,
        0,
        undefined,
        undefined,
        undefined,
        false,
      );

    // Dil bazında istatistikler
    const languageStats = {};
    allNews.forEach((news) => {
      if (news.language) {
        languageStats[news.language] = (languageStats[news.language] || 0) + 1;
      }
    });

    // Ülke bazında istatistikler
    const countryStats = {};
    allNews.forEach((news) => {
      if (news.country) {
        countryStats[news.country] = (countryStats[news.country] || 0) + 1;
      }
    });

    // Kategori bazında istatistikler
    const categoryStats = {};
    allNews.forEach((news) => {
      if (news.category) {
        categoryStats[news.category] = (categoryStats[news.category] || 0) + 1;
      }
    });

    return {
      totalNews: allCount,
      archivedNews: archivedCount,
      latestNews: latestCount,
      languageDistribution: languageStats,
      countryDistribution: countryStats,
      categoryDistribution: categoryStats,
    };
  }
}
