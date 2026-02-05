import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockTransfer } from '../entities/stock-transfer.entity';
import { Stock } from '../entities/stock.entity';
import { CreateTransferDto } from '../dto/stock-transfer/create-transfer.dto';
import { TransferHistoryDto } from '../dto/stock-transfer/transfer-history.dto';

@Injectable()
export class StockTransfersService {
  constructor(
    @InjectRepository(StockTransfer)
    private transferRepository: Repository<StockTransfer>,
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  async create(createTransferDto: CreateTransferDto) {
    const { stockId, fromWarehouseId, toWarehouseId, quantity } =
      createTransferDto;

    // Check if stock exists and has enough quantity
    const stock = await this.stockRepository.findOne({
      where: { id: stockId, warehouse: { id: fromWarehouseId } },
    });

    if (!stock) {
      throw new NotFoundException('Stock not found in source warehouse');
    }

    if (stock.quantity < quantity) {
      throw new BadRequestException('Insufficient stock quantity');
    }

    // Kaynak depodaki stok miktarını hemen düş
    await this.stockRepository.update(
      { id: stockId, warehouse: { id: fromWarehouseId } },
      { quantity: stock.quantity - quantity },
    );

    // Create transfer record
    const transfer = this.transferRepository.create({
      stock: { id: stockId },
      fromWarehouse: { id: fromWarehouseId },
      toWarehouse: { id: toWarehouseId },
      quantity,
      status: 'pending',
      notes: createTransferDto.notes,
      cargoCompany: createTransferDto.cargoCompany,
      trackingNumber: createTransferDto.trackingNumber,
      estimatedDeliveryDate: createTransferDto.estimatedDeliveryDate,
      cargoFee: createTransferDto.cargoFee,
    });

    return this.transferRepository.save(transfer);
  }

  async findAll(filters: TransferHistoryDto) {
    const query = this.transferRepository
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.stock', 'stock')
      .leftJoinAndSelect('stock.book', 'book')
      .leftJoinAndSelect('book.translations', 'bookTranslations')
      .leftJoinAndSelect('transfer.fromWarehouse', 'fromWarehouse')
      .leftJoinAndSelect('transfer.toWarehouse', 'toWarehouse');

    if (filters.stockId) {
      query.andWhere('stock.id = :stockId', { stockId: filters.stockId });
    }

    if (filters.warehouseId) {
      query.andWhere(
        '(fromWarehouse.id = :warehouseId OR toWarehouse.id = :warehouseId)',
        { warehouseId: filters.warehouseId },
      );
    }

    if (filters.fromWarehouseId) {
      query.andWhere('fromWarehouse.id = :fromWarehouseId', {
        fromWarehouseId: filters.fromWarehouseId,
      });
    }

    if (filters.toWarehouseId) {
      query.andWhere('toWarehouse.id = :toWarehouseId', {
        toWarehouseId: filters.toWarehouseId,
      });
    }

    if (filters.cargoCompany) {
      query.andWhere('transfer.cargoCompany LIKE :cargoCompany', {
        cargoCompany: `%${filters.cargoCompany}%`,
      });
    }

    if (filters.status) {
      query.andWhere('transfer.status = :status', { status: filters.status });
    }

    if (filters.startDate) {
      query.andWhere('transfer.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('transfer.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    query.orderBy('transfer.id', 'DESC');

    return query.getMany();
  }

  async findOne(id: number) {
    const transfer = await this.transferRepository.findOne({
      where: { id },
      relations: ['stock', 'fromWarehouse', 'toWarehouse'],
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer with ID ${id} not found`);
    }

    return transfer;
  }

  async complete(id: number) {
    const transfer = await this.findOne(id);

    if (transfer.status !== 'pending') {
      throw new BadRequestException('Only pending transfers can be completed');
    }

    // Hedef depoya miktarı ekle
    const stock = await this.stockRepository.findOne({
      where: { id: transfer.stock.id },
      relations: ['book', 'language'],
    });

    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    // Add quantity to target warehouse
    const targetStock = await this.stockRepository.findOne({
      where: {
        book: { id: stock.book.id },
        language: { id: stock.language.id },
        warehouse: { id: transfer.toWarehouse.id },
      },
    });

    if (targetStock) {
      await this.stockRepository.update(
        { id: targetStock.id },
        { quantity: targetStock.quantity + transfer.quantity },
      );
    } else {
      await this.stockRepository.save({
        book: stock.book,
        language: stock.language,
        warehouse: { id: transfer.toWarehouse.id },
        quantity: transfer.quantity,
        unitPrice: stock.unitPrice,
      });
    }

    // Update transfer status
    transfer.status = 'completed';
    return this.transferRepository.save(transfer);
  }

  async cancel(id: number) {
    const transfer = await this.findOne(id);

    if (transfer.status !== 'pending') {
      throw new BadRequestException('Only pending transfers can be cancelled');
    }

    // Kaynak depoya miktarı iade et
    const stock = await this.stockRepository.findOne({
      where: {
        id: transfer.stock.id,
        warehouse: { id: transfer.fromWarehouse.id },
      },
    });
    if (stock) {
      await this.stockRepository.update(
        { id: stock.id },
        { quantity: stock.quantity + transfer.quantity },
      );
    }

    transfer.status = 'cancelled';
    return this.transferRepository.save(transfer);
  }

  async update(id: number, updateData: Partial<CreateTransferDto>) {
    const transfer = await this.findOne(id);

    // Sadece belirli alanların güncellenmesine izin ver
    if (updateData.quantity !== undefined) {
      transfer.quantity = updateData.quantity;
    }
    if (updateData.notes !== undefined) {
      transfer.notes = updateData.notes;
    }
    if (updateData.cargoCompany !== undefined) {
      transfer.cargoCompany = updateData.cargoCompany;
    }
    if (updateData.trackingNumber !== undefined) {
      transfer.trackingNumber = updateData.trackingNumber;
    }
    if (updateData.estimatedDeliveryDate !== undefined) {
      transfer.estimatedDeliveryDate = updateData.estimatedDeliveryDate as any;
    }
    if (updateData.cargoFee !== undefined) {
      transfer.cargoFee = updateData.cargoFee;
    }

    return this.transferRepository.save(transfer);
  }
}
