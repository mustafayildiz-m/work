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
exports.StocksController = void 0;
const common_1 = require("@nestjs/common");
const stocks_service_1 = require("./stocks.service");
const create_stock_dto_1 = require("../dto/stock/create-stock.dto");
const update_stock_dto_1 = require("../dto/stock/update-stock.dto");
let StocksController = class StocksController {
    constructor(stocksService) {
        this.stocksService = stocksService;
    }
    create(createStockDto) {
        return this.stocksService.create(createStockDto);
    }
    async findAll(bookName, languageId, warehouseId, lowStock) {
        try {
            return await this.stocksService.findAll(bookName, languageId, warehouseId, lowStock);
        }
        catch (error) {
            console.error('Error in StocksController.findAll:', error);
            throw error;
        }
    }
    findOne(id) {
        return this.stocksService.findOne(+id);
    }
    findByBook(bookId) {
        return this.stocksService.findByBook(+bookId);
    }
    update(id, updateStockDto) {
        return this.stocksService.update(+id, updateStockDto);
    }
    remove(id) {
        return this.stocksService.remove(+id);
    }
};
exports.StocksController = StocksController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_dto_1.CreateStockDto]),
    __metadata("design:returntype", void 0)
], StocksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('bookName')),
    __param(1, (0, common_1.Query)('languageId')),
    __param(2, (0, common_1.Query)('warehouseId')),
    __param(3, (0, common_1.Query)('lowStock')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], StocksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StocksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('book/:bookId'),
    __param(0, (0, common_1.Param)('bookId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StocksController.prototype, "findByBook", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_stock_dto_1.UpdateStockDto]),
    __metadata("design:returntype", void 0)
], StocksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StocksController.prototype, "remove", null);
exports.StocksController = StocksController = __decorate([
    (0, common_1.Controller)('stocks'),
    __metadata("design:paramtypes", [stocks_service_1.StocksService])
], StocksController);
//# sourceMappingURL=stocks.controller.js.map