import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from '../upload/upload.service';
import { NewsletterService } from '../services/newsletter.service';
import { CreateNewsletterDto } from '../dto/newsletter/create-newsletter.dto';
import { UpdateNewsletterDto } from '../dto/newsletter/update-newsletter.dto';

@Controller('newsletters')
export class NewsletterController {
  constructor(
    private readonly newsletterService: NewsletterService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.newsletterService.findAll(page, limit, search);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.newsletterService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'imageFile', maxCount: 1 }]))
  async create(
    @Body() dto: CreateNewsletterDto,
    @UploadedFiles() files?: { imageFile?: Express.Multer.File[] },
  ) {
    const imageFile = files?.imageFile?.[0];
    const imageUrl = imageFile
      ? await this.uploadService.uploadFile(imageFile)
      : undefined;

    return this.newsletterService.create(dto, imageUrl);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'imageFile', maxCount: 1 }]))
  async updatePatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNewsletterDto,
    @UploadedFiles() files?: { imageFile?: Express.Multer.File[] },
  ) {
    const imageFile = files?.imageFile?.[0];
    const imageUrl = imageFile
      ? await this.uploadService.uploadFile(imageFile)
      : undefined;

    return this.newsletterService.update(id, dto, imageUrl);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'imageFile', maxCount: 1 }]))
  async updatePut(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNewsletterDto,
    @UploadedFiles() files?: { imageFile?: Express.Multer.File[] },
  ) {
    const imageFile = files?.imageFile?.[0];
    const imageUrl = imageFile
      ? await this.uploadService.uploadFile(imageFile)
      : undefined;

    return this.newsletterService.update(id, dto, imageUrl);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.newsletterService.remove(id);
    return { message: 'Newsletter silindi.' };
  }
}
