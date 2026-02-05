import { StocksService } from './stocks.service';
import { CreateStockDto } from '../dto/stock/create-stock.dto';
import { UpdateStockDto } from '../dto/stock/update-stock.dto';
export declare class StocksController {
    private readonly stocksService;
    constructor(stocksService: StocksService);
    create(createStockDto: CreateStockDto): Promise<import("../entities/stock.entity").Stock>;
    findAll(bookName?: string, languageId?: string, warehouseId?: string, lowStock?: string): Promise<{
        book: import("../books/entities/book.entity").Book;
        language: import("../entities/language.entity").Language;
        warehouse: import("../entities/warehouse.entity").Warehouse;
        pendingTransfers: import("../stock-transfers/entities/stock-transfer.entity").StockTransfer[];
        transfers: undefined;
        id: number;
        quantity: number;
        unitPrice: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<import("../entities/stock.entity").Stock | null>;
    findByBook(bookId: string): Promise<import("../entities/stock.entity").Stock[]>;
    update(id: string, updateStockDto: UpdateStockDto): Promise<import("../entities/stock.entity").Stock | null>;
    remove(id: string): Promise<import("../entities/stock.entity").Stock>;
}
