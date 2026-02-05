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
exports.WarehousesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const warehouse_entity_1 = require("../entities/warehouse.entity");
const stock_entity_1 = require("../entities/stock.entity");
const stock_transfer_entity_1 = require("../entities/stock-transfer.entity");
let WarehousesService = class WarehousesService {
    constructor(warehouseRepository, stockRepository, stockTransferRepository) {
        this.warehouseRepository = warehouseRepository;
        this.stockRepository = stockRepository;
        this.stockTransferRepository = stockTransferRepository;
    }
    create(createWarehouseDto) {
        const warehouse = this.warehouseRepository.create(createWarehouseDto);
        return this.warehouseRepository.save(warehouse);
    }
    async findAll(name, location, isActive) {
        const queryBuilder = this.warehouseRepository.createQueryBuilder('warehouse');
        if (name) {
            queryBuilder.andWhere('warehouse.name LIKE :name', { name: `%${name}%` });
        }
        if (location) {
            queryBuilder.andWhere('warehouse.location LIKE :location', {
                location: `%${location}%`,
            });
        }
        if (isActive !== undefined && isActive !== '') {
            if (isActive === 'true') {
                queryBuilder.andWhere('warehouse.isActive = :isActive', {
                    isActive: true,
                });
            }
            else if (isActive === 'false') {
                queryBuilder.andWhere('warehouse.isActive = :isActive', {
                    isActive: false,
                });
            }
        }
        queryBuilder.orderBy('warehouse.id', 'DESC');
        return await queryBuilder.getMany();
    }
    findOne(id) {
        return this.warehouseRepository.findOne({ where: { id } });
    }
    async update(id, updateWarehouseDto) {
        await this.warehouseRepository.update(id, updateWarehouseDto);
        return this.findOne(id);
    }
    async remove(id) {
        const warehouse = await this.findOne(id);
        if (!warehouse) {
            throw new common_1.NotFoundException(`Warehouse with ID ${id} not found`);
        }
        const stockTransfers = await this.stockTransferRepository.find({
            where: [{ fromWarehouse: { id } }, { toWarehouse: { id } }],
        });
        if (stockTransfers.length > 0) {
            await this.stockTransferRepository.remove(stockTransfers);
        }
        const stocks = await this.stockRepository.find({
            where: { warehouse: { id } },
        });
        if (stocks.length > 0) {
            await this.stockRepository.remove(stocks);
        }
        return this.warehouseRepository.remove(warehouse);
    }
};
exports.WarehousesService = WarehousesService;
exports.WarehousesService = WarehousesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(warehouse_entity_1.Warehouse)),
    __param(1, (0, typeorm_1.InjectRepository)(stock_entity_1.Stock)),
    __param(2, (0, typeorm_1.InjectRepository)(stock_transfer_entity_1.StockTransfer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], WarehousesService);
//# sourceMappingURL=warehouses.service.js.map