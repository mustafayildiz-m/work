"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockTransfersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stock_transfer_entity_1 = require("../entities/stock-transfer.entity");
const stock_entity_1 = require("../entities/stock.entity");
let StockTransfersService = class StockTransfersService {
    constructor(transferRepository, stockRepository) {
        this.transferRepository = transferRepository;
        this.stockRepository = stockRepository;
    }
    async create(createTransferDto) {
        const { stockId, fromWarehouseId, toWarehouseId, quantity } = createTransferDto;
        const stock = await this.stockRepository.findOne({
            where: { id: stockId, warehouse: { id: fromWarehouseId } },
        });
        if (!stock) {
            throw new common_1.NotFoundException('Stock not found in source warehouse');
        }
        if (stock.quantity < quantity) {
            throw new common_1.BadRequestException('Insufficient stock quantity');
        }
        await this.stockRepository.update({ id: stockId, warehouse: { id: fromWarehouseId } }, { quantity: stock.quantity - quantity });
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
    async findAll(filters) {
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
            query.andWhere('(fromWarehouse.id = :warehouseId OR toWarehouse.id = :warehouseId)', { warehouseId: filters.warehouseId });
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
    async findOne(id) {
        const transfer = await this.transferRepository.findOne({
            where: { id },
            relations: ['stock', 'fromWarehouse', 'toWarehouse'],
        });
        if (!transfer) {
            throw new common_1.NotFoundException(`Transfer with ID ${id} not found`);
        }
        return transfer;
    }
    async complete(id) {
        const transfer = await this.findOne(id);
        if (transfer.status !== 'pending') {
            throw new common_1.BadRequestException('Only pending transfers can be completed');
        }
        const stock = await this.stockRepository.findOne({
            where: { id: transfer.stock.id },
            relations: ['book', 'language'],
        });
        if (!stock) {
            throw new common_1.NotFoundException('Stock not found');
        }
        const targetStock = await this.stockRepository.findOne({
            where: {
                book: { id: stock.book.id },
                language: { id: stock.language.id },
                warehouse: { id: transfer.toWarehouse.id },
            },
        });
        if (targetStock) {
            await this.stockRepository.update({ id: targetStock.id }, { quantity: targetStock.quantity + transfer.quantity });
        }
        else {
            await this.stockRepository.save({
                book: stock.book,
                language: stock.language,
                warehouse: { id: transfer.toWarehouse.id },
                quantity: transfer.quantity,
                unitPrice: stock.unitPrice,
            });
        }
        transfer.status = 'completed';
        return this.transferRepository.save(transfer);
    }
    async cancel(id) {
        const transfer = await this.findOne(id);
        if (transfer.status !== 'pending') {
            throw new common_1.BadRequestException('Only pending transfers can be cancelled');
        }
        const stock = await this.stockRepository.findOne({
            where: {
                id: transfer.stock.id,
                warehouse: { id: transfer.fromWarehouse.id },
            },
        });
        if (stock) {
            await this.stockRepository.update({ id: stock.id }, { quantity: stock.quantity + transfer.quantity });
        }
        transfer.status = 'cancelled';
        return this.transferRepository.save(transfer);
    }
    async update(id, updateData) {
        const transfer = await this.findOne(id);
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
            transfer.estimatedDeliveryDate = updateData.estimatedDeliveryDate;
        }
        if (updateData.cargoFee !== undefined) {
            transfer.cargoFee = updateData.cargoFee;
        }
        return this.transferRepository.save(transfer);
    }
};
exports.StockTransfersService = StockTransfersService;
exports.StockTransfersService = StockTransfersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(stock_transfer_entity_1.StockTransfer)),
    __param(1, (0, typeorm_1.InjectRepository)(stock_entity_1.Stock)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], StockTransfersService);
//# sourceMappingURL=stock-transfers.service.js.map