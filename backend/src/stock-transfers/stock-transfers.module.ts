import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockTransfersService } from './stock-transfers.service';
import { StockTransfersController } from './stock-transfers.controller';
import { StockTransfer } from '../entities/stock-transfer.entity';
import { Stock } from '../entities/stock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockTransfer, Stock])],
  controllers: [StockTransfersController],
  providers: [StockTransfersService],
  exports: [StockTransfersService],
})
export class StockTransfersModule {}
