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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockTransfer = void 0;
const typeorm_1 = require("typeorm");
const stock_entity_1 = require("./stock.entity");
const warehouse_entity_1 = require("./warehouse.entity");
let StockTransfer = class StockTransfer {
};
exports.StockTransfer = StockTransfer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StockTransfer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => stock_entity_1.Stock, (stock) => stock.transfers),
    __metadata("design:type", stock_entity_1.Stock)
], StockTransfer.prototype, "stock", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_entity_1.Warehouse),
    __metadata("design:type", warehouse_entity_1.Warehouse)
], StockTransfer.prototype, "fromWarehouse", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_entity_1.Warehouse),
    __metadata("design:type", warehouse_entity_1.Warehouse)
], StockTransfer.prototype, "toWarehouse", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], StockTransfer.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], StockTransfer.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StockTransfer.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StockTransfer.prototype, "cargoCompany", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StockTransfer.prototype, "trackingNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], StockTransfer.prototype, "estimatedDeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], StockTransfer.prototype, "cargoFee", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StockTransfer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], StockTransfer.prototype, "updatedAt", void 0);
exports.StockTransfer = StockTransfer = __decorate([
    (0, typeorm_1.Entity)('stock_transfers')
], StockTransfer);
//# sourceMappingURL=stock-transfer.entity.js.map