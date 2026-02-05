import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehousesService } from './warehouses.service';
import { WarehousesController } from './warehouses.controller';
import { Warehouse } from '../entities/warehouse.entity';
import { Stock } from '../entities/stock.entity';
import { StockTransfer } from '../entities/stock-transfer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse, Stock, StockTransfer])],
  controllers: [WarehousesController],
  providers: [WarehousesService],
  exports: [WarehousesService],
})
export class WarehousesModule {}
