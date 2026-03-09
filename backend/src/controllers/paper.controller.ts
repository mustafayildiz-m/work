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
import { PaperService } from '../services/paper.service';
import { CreatePaperDto } from '../dto/paper/create-paper.dto';
import { UpdatePaperDto } from '../dto/paper/update-paper.dto';

@Controller('papers')
export class PaperController {
  constructor(
    private readonly paperService: PaperService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('lang') lang?: string,
  ) {
    return this.paperService.findAll(page, limit, search, lang);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang?: string,
  ) {
    return this.paperService.findOne(id, lang);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'imageFile', maxCount: 1 }]))
  async create(
    @Body() dto: CreatePaperDto,
    @UploadedFiles() files?: { imageFile?: Express.Multer.File[] },
  ) {
    const imageFile = files?.imageFile?.[0];
    const imageUrl = imageFile
      ? await this.uploadService.uploadFile(imageFile)
      : undefined;

    return this.paperService.create(dto, imageUrl);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'imageFile', maxCount: 1 }]))
  async updatePatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaperDto,
    @UploadedFiles() files?: { imageFile?: Express.Multer.File[] },
  ) {
    const imageFile = files?.imageFile?.[0];
    const imageUrl = imageFile
      ? await this.uploadService.uploadFile(imageFile)
      : undefined;

    return this.paperService.update(id, dto, imageUrl);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'imageFile', maxCount: 1 }]))
  async updatePut(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaperDto,
    @UploadedFiles() files?: { imageFile?: Express.Multer.File[] },
  ) {
    const imageFile = files?.imageFile?.[0];
    const imageUrl = imageFile
      ? await this.uploadService.uploadFile(imageFile)
      : undefined;

    return this.paperService.update(id, dto, imageUrl);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.paperService.remove(id);
    return { message: 'Paper silindi.' };
  }
}
