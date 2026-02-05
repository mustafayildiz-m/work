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
exports.StocksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stock_entity_1 = require("../entities/stock.entity");
let StocksService = class StocksService {
    constructor(stockRepository) {
        this.stockRepository = stockRepository;
    }
    async create(createStockDto) {
        const existing = await this.stockRepository.findOne({
            where: {
                book: { id: createStockDto.bookId },
                language: { id: createStockDto.languageId },
                warehouse: { id: createStockDto.warehouseId },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Bu kitap, dil ve depo kombinasyonu için zaten bir stok kaydı var.');
        }
        const stock = this.stockRepository.create({
            quantity: createStockDto.quantity,
            unitPrice: createStockDto.unitPrice,
            book: { id: createStockDto.bookId },
            language: { id: createStockDto.languageId },
            warehouse: { id: createStockDto.warehouseId },
        });
        return this.stockRepository.save(stock);
    }
    async findAll(bookName, languageId, warehouseId, lowStock) {
        try {
            const queryBuilder = this.stockRepository.createQueryBuilder('stock')
                .leftJoinAndSelect('stock.book', 'book')
                .leftJoin('book.translations', 'bookTranslations')
                .addSelect(['bookTranslations.id', 'bookTranslations.title', 'bookTranslations.languageId'])
                .leftJoinAndSelect('stock.language', 'language')
                .leftJoinAndSelect('stock.warehouse', 'warehouse')
                .leftJoinAndSelect('stock.transfers', 'transfers')
                .leftJoinAndSelect('transfers.toWarehouse', 'toWarehouse');
            if (bookName) {
                queryBuilder.andWhere('(bookTranslations.title LIKE :bookName OR book.title LIKE :bookName)', { bookName: `%${bookName}%` });
            }
            if (languageId && languageId !== 'all') {
                queryBuilder.andWhere('stock.languageId = :languageId', { languageId: +languageId });
            }
            if (warehouseId && warehouseId !== 'all') {
                queryBuilder.andWhere('stock.warehouseId = :warehouseId', { warehouseId: +warehouseId });
            }
            if (lowStock === 'true') {
                queryBuilder.andWhere('stock.quantity < 10');
            }
            queryBuilder.orderBy('stock.id', 'DESC');
            const stocks = await queryBuilder.getMany();
            return stocks.map(stock => {
                const safeStock = {
                    ...stock,
                    book: stock.book || null,
                    language: stock.language || null,
                    warehouse: stock.warehouse || null,
                    pendingTransfers: stock.transfers?.filter(t => t && t.status === 'pending') || [],
                    transfers: undefined,
                };
                return safeStock;
            });
        }
        catch (error) {
            console.error('Error in StocksService.findAll:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            console.error('Query parameters:', { bookName, languageId, warehouseId, lowStock });
            throw new Error(`Stocks listesi alınırken hata oluştu: ${error.message}`);
        }
    }
    findOne(id) {
        return this.stockRepository.findOne({
            where: { id },
            relations: ['book', 'language', 'warehouse'],
        });
    }
    async findByBook(bookId) {
        return this.stockRepository.find({
            where: { book: { id: bookId } },
            relations: ['language', 'warehouse'],
        });
    }
    async update(id, updateStockDto) {
        const stock = await this.findOne(id);
        if (!stock) {
            throw new common_1.NotFoundException(`Stock with ID ${id} not found`);
        }
        await this.stockRepository.update(id, updateStockDto);
        return this.findOne(id);
    }
    async remove(id) {
        const stock = await this.findOne(id);
        if (!stock) {
            throw new common_1.NotFoundException(`Stock with ID ${id} not found`);
        }
        return this.stockRepository.remove(stock);
    }
};
exports.StocksService = StocksService;
exports.StocksService = StocksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(stock_entity_1.Stock)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StocksService);
//# sourceMappingURL=stocks.service.js.map