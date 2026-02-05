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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PodcastService } from '../services/podcast.service';
import { CreatePodcastDto } from '../dto/podcast/create-podcast.dto';
import { UpdatePodcastDto } from '../dto/podcast/update-podcast.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from '../upload/upload.service';

@Controller('podcasts')
export class PodcastController {
  constructor(
    private readonly podcastService: PodcastService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audio', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createPodcastDto: CreatePodcastDto,
    @UploadedFiles()
    files?: { audio?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    let audioUrl: string | undefined;
    let coverUrl: string | undefined;

    if (files?.audio?.[0]) {
      audioUrl = await this.uploadService.uploadFile(files.audio[0]);
    }

    if (files?.cover?.[0]) {
      coverUrl = await this.uploadService.uploadFile(files.cover[0]);
    }

    return this.podcastService.create(createPodcastDto, audioUrl, coverUrl);
  }

  @Get('featured')
  getFeaturedPodcasts(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return this.podcastService.getFeaturedPodcasts(limit);
  }

  @Get('search')
  searchPodcasts(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('language') language?: string,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
  ) {
    if (!query) {
      return { podcasts: [], total: 0, totalPages: 0 };
    }
    const isActiveBoolean =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.podcastService.search(
      query,
      page,
      limit,
      language,
      category,
      isActiveBoolean,
    );
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('isActive') isActive?: string,
    @Query('category') category?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('language') language?: string,
  ) {
    const isActiveBoolean =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    const isFeaturedBoolean =
      isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined;

    return this.podcastService.findAll(
      page,
      limit,
      isActiveBoolean,
      category,
      isFeaturedBoolean,
      language,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.podcastService.findOne(id);
  }

  @Post(':id/listen')
  incrementListenCount(@Param('id', ParseIntPipe) id: number) {
    return this.podcastService.incrementListenCount(id);
  }

  @Post(':id/like')
  incrementLikeCount(@Param('id', ParseIntPipe) id: number) {
    return this.podcastService.incrementLikeCount(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audio', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePodcastDto: UpdatePodcastDto,
    @UploadedFiles()
    files?: { audio?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    let audioUrl: string | undefined;
    let coverUrl: string | undefined;

    if (files?.audio?.[0]) {
      audioUrl = await this.uploadService.uploadFile(files.audio[0]);
    }

    if (files?.cover?.[0]) {
      coverUrl = await this.uploadService.uploadFile(files.cover[0]);
    }

    return this.podcastService.update(id, updatePodcastDto, audioUrl, coverUrl);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.podcastService.remove(id);
  }
}
