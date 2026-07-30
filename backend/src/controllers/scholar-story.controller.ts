import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ScholarStoryService } from '../services/scholar-story.service';
import { CreateScholarStoryDto } from '../dto/scholar-story/create-scholar-story.dto';
import { UpdateScholarStoryDto } from '../dto/scholar-story/update-scholar-story.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from '../upload/upload.service';

@Controller('scholar-stories')
export class ScholarStoryController {
  constructor(
    private readonly scholarStoryService: ScholarStoryService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('thumbnail'))
  async create(
    @Body() body: any, // FormData'dan gelen ham veri
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      // FormData'dan gelen string değerleri uygun tiplere çevir
      const createScholarStoryDto: CreateScholarStoryDto = {
        title: body.title,
        description: body.description,
        language: body.language,
        scholar_id: body.scholar_id ? parseInt(body.scholar_id, 10) : undefined,
        is_active: body.is_active === 'true' || body.is_active === true,
        is_featured: body.is_featured === 'true' || body.is_featured === true,
        video_url: body.video_url || undefined,
        duration: body.duration ? parseInt(body.duration, 10) : undefined,
        thumbnail_url: body.thumbnail_url || undefined,
      };

      // Thumbnail dosyası varsa upload et
      if (file) {
        const thumbnailUrl = await this.uploadService.uploadFile(file);
        createScholarStoryDto.thumbnail_url = thumbnailUrl;
      }

      return this.scholarStoryService.create(createScholarStoryDto);
    } catch (error) {
      console.error('❌ Error creating scholar story:', error);
      throw error;
    }
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('language') language?: string, // Optional - tüm diller gelsin
    @Query('isActive') isActive?: string, // Optional - default true (sadece aktif hikayeler)
    @Query('search') search?: string,
  ) {
    // isActive parametresini işle:
    // - 'all' ise tüm hikayeleri göster (admin panelden)
    // - 'true' ise sadece aktif
    // - 'false' ise sadece pasif
    // - undefined/null ise default olarak sadece aktif (public kullanım)
    let isActiveBool: boolean | undefined;

    if (isActive === 'all') {
      isActiveBool = undefined; // Filtre uygulanmaz, tüm hikayeler gelir
    } else if (isActive === 'true') {
      isActiveBool = true;
    } else if (isActive === 'false') {
      isActiveBool = false;
    } else {
      isActiveBool = true; // Default: sadece aktif hikayeler (public kullanım)
    }

    const result = await this.scholarStoryService.findAll(
      page,
      limit,
      language,
      isActiveBool,
      search,
    );
    return result;
  }

  @Get('test')
  testEndpoint() {
    return { page: 2, limit: 12, test: 'working' };
  }

  @Get('featured')
  getFeaturedStories(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return this.scholarStoryService.getFeaturedStories(limit);
  }

  @Get('search')
  searchStories(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    if (!query) {
      return { stories: [], total: 0, totalPages: 0 };
    }
    return this.scholarStoryService.searchStories(query, page, limit);
  }

  @Get('scholar/:scholarId')
  findByScholarId(
    @Param('scholarId', ParseIntPipe) scholarId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.scholarStoryService.findByScholarId(scholarId, page, limit);
  }

  @Get('resolve-thumbnail')
  resolveThumbnail(@Query('url') url: string) {
    return this.scholarStoryService.resolveThumbnail(url || '');
  }

  @Get('thumbnail-image')
  async getThumbnailImage(@Query('url') url: string, @Res() res: Response) {
    if (!url) {
      return res.status(400).send('URL required');
    }

    try {
      const { thumbnail_url } = await this.scholarStoryService.resolveThumbnail(url);
      if (!thumbnail_url) {
        return res.status(404).send('Thumbnail not found');
      }

      const imageRes = await fetch(thumbnail_url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://www.instagram.com/',
        },
      });

      if (!imageRes.ok) {
        return res.status(502).send('Failed to fetch thumbnail');
      }

      const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
      const buffer = Buffer.from(await imageRes.arrayBuffer());
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    } catch (error) {
      console.error('Thumbnail proxy error:', error);
      return res.status(500).send('Thumbnail proxy failed');
    }
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scholarStoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('thumbnail'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      // FormData'dan gelen string değerleri uygun tiplere çevir
      console.log('Update Body:', body);
      const updateScholarStoryDto: UpdateScholarStoryDto = {
        title: body.title,
        description: body.description,
        language: body.language,
        scholar_id: body.scholar_id ? parseInt(body.scholar_id, 10) : undefined,
        is_active: body.is_active === 'true' || body.is_active === true,
        is_featured: body.is_featured === 'true' || body.is_featured === true,
        video_url: body.video_url || undefined,
        duration: body.duration ? parseInt(body.duration, 10) : undefined,
        thumbnail_url: body.thumbnail_url || undefined,
      };

      // Thumbnail dosyası varsa upload et
      if (file) {
        const thumbnailUrl = await this.uploadService.uploadFile(file);
        updateScholarStoryDto.thumbnail_url = thumbnailUrl;
      }

      console.log('Update DTO:', updateScholarStoryDto);
      return this.scholarStoryService.update(id, updateScholarStoryDto);
    } catch (error) {
      console.error('❌ Error updating scholar story:', error);
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.scholarStoryService.remove(id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  likeStory(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.scholarStoryService.incrementLikeCount(id, req.user.id);
  }

  @Post(':id/view')
  @UseGuards(JwtAuthGuard)
  incrementView(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.scholarStoryService.incrementViewCount(id, req.user.id);
  }
}
