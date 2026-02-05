import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../entities/warehouse.entity';
import { CreateWarehouseDto } from '../dto/warehouse/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/warehouse/update-warehouse.dto';
import { Stock } from '../entities/stock.entity';
import { StockTransfer } from '../entities/stock-transfer.entity';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    @InjectRepository(StockTransfer)
    private stockTransferRepository: Repository<StockTransfer>,
  ) {}

  create(createWarehouseDto: CreateWarehouseDto) {
    const warehouse = this.warehouseRepository.create(createWarehouseDto);
    return this.warehouseRepository.save(warehouse);
  }

  async findAll(name?: string, location?: string, isActive?: string) {
    const queryBuilder =
      this.warehouseRepository.createQueryBuilder('warehouse');

    // Name filter
    if (name) {
      queryBuilder.andWhere('warehouse.name LIKE :name', { name: `%${name}%` });
    }

    // Location filter
    if (location) {
      queryBuilder.andWhere('warehouse.location LIKE :location', {
        location: `%${location}%`,
      });
    }

    // IsActive filter
    if (isActive !== undefined && isActive !== '') {
      if (isActive === 'true') {
        queryBuilder.andWhere('warehouse.isActive = :isActive', {
          isActive: true,
        });
      } else if (isActive === 'false') {
        queryBuilder.andWhere('warehouse.isActive = :isActive', {
          isActive: false,
        });
      }
      // if isActive === 'all', don't filter
    }

    queryBuilder.orderBy('warehouse.id', 'DESC');

    return await queryBuilder.getMany();
  }

  findOne(id: number) {
    return this.warehouseRepository.findOne({ where: { id } });
  }

  async update(id: number, updateWarehouseDto: UpdateWarehouseDto) {
    await this.warehouseRepository.update(id, updateWarehouseDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const warehouse = await this.findOne(id);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    // 1. Önce bu depoya ait tüm stok hareketlerini bul ve sil
    const stockTransfers = await this.stockTransferRepository.find({
      where: [{ fromWarehouse: { id } }, { toWarehouse: { id } }],
    });

    if (stockTransfers.length > 0) {
      await this.stockTransferRepository.remove(stockTransfers);
    }

    // 2. Depoya ait tüm stokları bul ve sil
    const stocks = await this.stockRepository.find({
      where: { warehouse: { id } },
    });

    if (stocks.length > 0) {
      await this.stockRepository.remove(stocks);
    }

    // 3. Son olarak depoyu sil
    return this.warehouseRepository.remove(warehouse);
  }
}
