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
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QaService } from './qa.service';
import { QaImportService } from './qa-import.service';
import { QaExportService, ExportFormat } from './qa-export.service';
import { QaSeederService } from './qa-seeder.service';
import { CreateQaCategoryDto } from './dto/create-qa-category.dto';
import { UpdateQaCategoryDto } from './dto/update-qa-category.dto';
import { CreateQaItemDto } from './dto/create-qa-item.dto';
import { UpdateQaItemDto } from './dto/update-qa-item.dto';
import { CreateQaTagDto, UpdateQaTagDto } from './dto/create-qa-tag.dto';
import { QaFilterDto } from './dto/qa-filter.dto';

@Controller('qa')
export class QaController {
  constructor(
    private readonly qaService: QaService,
    private readonly importService: QaImportService,
    private readonly exportService: QaExportService,
    private readonly seederService: QaSeederService,
  ) {}

  // ─── PUBLIC ENDPOINTS ────────────────────────────────────────

  @Get('categories')
  getCategories(@Query('languageId') languageId?: string) {
    return this.qaService.getCategories(languageId ? +languageId : undefined);
  }

  @Get('categories/:id')
  getCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.qaService.getCategoryById(id);
  }

  @Get('categories/:id/items')
  getItemsByCategory(
    @Param('id', ParseIntPipe) id: number,
    @Query('languageId') languageId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.qaService.getItemsByCategory(
      id,
      languageId ? +languageId : undefined,
      page ? +page : 1,
      limit ? +limit : 50,
    );
  }

  @Get('items/search')
  searchItems(@Query(new ValidationPipe({ transform: true })) filter: QaFilterDto) {
    return this.qaService.searchItems(filter);
  }

  @Get('items/:id')
  getItemById(@Param('id', ParseIntPipe) id: number) {
    return this.qaService.getItemById(id);
  }

  @Get('tags')
  getAllTags() {
    return this.qaService.getAllTags();
  }

  // ─── ADMIN ENDPOINTS (JWT Protected) ────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('admin/categories')
  getAllCategoriesAdmin() {
    return this.qaService.getAllCategoriesAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Post('categories')
  createCategory(@Body(new ValidationPipe({ transform: true })) dto: CreateQaCategoryDto) {
    return this.qaService.createCategory(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('categories/:id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateQaCategoryDto,
  ) {
    return this.qaService.updateCategory(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.qaService.deleteCategory(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/items')
  getAllItemsAdmin(@Query(new ValidationPipe({ transform: true })) filter: QaFilterDto) {
    return this.qaService.getAllItemsAdmin(filter);
  }

  @UseGuards(JwtAuthGuard)
  @Post('items')
  createItem(@Body(new ValidationPipe({ transform: true })) dto: CreateQaItemDto) {
    return this.qaService.createItem(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('items/:id')
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateQaItemDto,
  ) {
    return this.qaService.updateItem(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('items/:id')
  deleteItem(@Param('id', ParseIntPipe) id: number) {
    return this.qaService.deleteItem(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('tags')
  createTag(@Body(new ValidationPipe({ transform: true })) dto: CreateQaTagDto) {
    return this.qaService.createTag(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('tags/:id')
  updateTag(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateQaTagDto,
  ) {
    return this.qaService.updateTag(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('tags/:id')
  deleteTag(@Param('id', ParseIntPipe) id: number) {
    return this.qaService.deleteTag(id);
  }

  // ─── IMPORT / EXPORT ─────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('seed')
  seedDummyData(@Body() body?: { force?: boolean; full?: boolean }) {
    if (body?.force || body?.full) {
      return this.seederService.seedComprehensive(Boolean(body.force));
    }
    return this.seederService.seedIfEmpty();
  }

  @UseGuards(JwtAuthGuard)
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importFile(@UploadedFile() file: Express.Multer.File) {
    return this.importService.importFromFile(file);
  }

  @UseGuards(JwtAuthGuard)
  @Get('export')
  async exportData(
    @Query('format') format: string,
    @Query('languageId') languageId?: string,
    @Query('categoryId') categoryId?: string,
    @Res() res?: Response,
  ) {
    const result = await this.exportService.exportData(
      (format as ExportFormat) || 'json',
      languageId ? +languageId : undefined,
      categoryId ? +categoryId : undefined,
    );
    res!.setHeader('Content-Type', result.mimeType);
    res!.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res!.send(result.content);
  }
}
