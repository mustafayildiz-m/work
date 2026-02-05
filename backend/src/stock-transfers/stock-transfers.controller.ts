import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { StockTransfersService } from './stock-transfers.service';
import { CreateTransferDto } from '../dto/stock-transfer/create-transfer.dto';
import { TransferHistoryDto } from '../dto/stock-transfer/transfer-history.dto';

@Controller('stock-transfers')
export class StockTransfersController {
  constructor(private readonly stockTransfersService: StockTransfersService) {}

  @Post()
  create(@Body() createTransferDto: CreateTransferDto) {
    return this.stockTransfersService.create(createTransferDto);
  }

  @Get()
  findAll(@Query() filters: TransferHistoryDto) {
    return this.stockTransfersService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockTransfersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransferDto: Partial<CreateTransferDto>,
  ) {
    return this.stockTransfersService.update(+id, updateTransferDto);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string) {
    return this.stockTransfersService.complete(+id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.stockTransfersService.cancel(+id);
  }
}
