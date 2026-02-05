"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockTransfersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const stock_transfers_service_1 = require("./stock-transfers.service");
const stock_transfers_controller_1 = require("./stock-transfers.controller");
const stock_transfer_entity_1 = require("../entities/stock-transfer.entity");
const stock_entity_1 = require("../entities/stock.entity");
let StockTransfersModule = class StockTransfersModule {
};
exports.StockTransfersModule = StockTransfersModule;
exports.StockTransfersModule = StockTransfersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([stock_transfer_entity_1.StockTransfer, stock_entity_1.Stock])],
        controllers: [stock_transfers_controller_1.StockTransfersController],
        providers: [stock_transfers_service_1.StockTransfersService],
        exports: [stock_transfers_service_1.StockTransfersService],
    })
], StockTransfersModule);
//# sourceMappingURL=stock-transfers.module.js.map