import { Repository } from 'typeorm';
import { Stock } from '../entities/stock.entity';
import { CreateStockDto } from '../dto/stock/create-stock.dto';
import { UpdateStockDto } from '../dto/stock/update-stock.dto';
export declare class StocksService {
    private stockRepository;
    constructor(stockRepository: Repository<Stock>);
    create(createStockDto: CreateStockDto): Promise<Stock>;
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
    findOne(id: number): Promise<Stock | null>;
    findByBook(bookId: number): Promise<Stock[]>;
    update(id: number, updateStockDto: UpdateStockDto): Promise<Stock | null>;
    remove(id: number): Promise<Stock>;
}
