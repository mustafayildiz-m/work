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
exports.StockTransfersController = void 0;
const common_1 = require("@nestjs/common");
const stock_transfers_service_1 = require("./stock-transfers.service");
const create_transfer_dto_1 = require("../dto/stock-transfer/create-transfer.dto");
const transfer_history_dto_1 = require("../dto/stock-transfer/transfer-history.dto");
let StockTransfersController = class StockTransfersController {
    constructor(stockTransfersService) {
        this.stockTransfersService = stockTransfersService;
    }
    create(createTransferDto) {
        return this.stockTransfersService.create(createTransferDto);
    }
    findAll(filters) {
        return this.stockTransfersService.findAll(filters);
    }
    findOne(id) {
        return this.stockTransfersService.findOne(+id);
    }
    update(id, updateTransferDto) {
        return this.stockTransfersService.update(+id, updateTransferDto);
    }
    complete(id) {
        return this.stockTransfersService.complete(+id);
    }
    cancel(id) {
        return this.stockTransfersService.cancel(+id);
    }
};
exports.StockTransfersController = StockTransfersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transfer_dto_1.CreateTransferDto]),
    __metadata("design:returntype", void 0)
], StockTransfersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transfer_history_dto_1.TransferHistoryDto]),
    __metadata("design:returntype", void 0)
], StockTransfersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockTransfersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StockTransfersController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockTransfersController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockTransfersController.prototype, "cancel", null);
exports.StockTransfersController = StockTransfersController = __decorate([
    (0, common_1.Controller)('stock-transfers'),
    __metadata("design:paramtypes", [stock_transfers_service_1.StockTransfersService])
], StockTransfersController);
//# sourceMappingURL=stock-transfers.controller.js.map