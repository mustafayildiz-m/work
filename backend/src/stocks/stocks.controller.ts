import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStockDto } from '../dto/stock/create-stock.dto';
import { UpdateStockDto } from '../dto/stock/update-stock.dto';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stocksService.create(createStockDto);
  }

  @Get()
  async findAll(
    @Query('bookName') bookName?: string,
    @Query('languageId') languageId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    try {
      return await this.stocksService.findAll(
        bookName,
        languageId,
        warehouseId,
        lowStock,
      );
    } catch (error) {
      console.error('Error in StocksController.findAll:', error);
      throw error;
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stocksService.findOne(+id);
  }

  @Get('book/:bookId')
  findByBook(@Param('bookId') bookId: string) {
    return this.stocksService.findByBook(+bookId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.stocksService.update(+id, updateStockDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stocksService.remove(+id);
  }
}
