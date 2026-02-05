import { Warehouse } from './warehouse.entity';
import { StockTransfer } from '../stock-transfers/entities/stock-transfer.entity';
import { Book } from '../books/entities/book.entity';
import { Language } from './language.entity';
export declare class Stock {
    id: number;
    book: Book;
    language: Language;
    quantity: number;
    unitPrice: number;
    warehouse: Warehouse;
    transfers: StockTransfer[];
    createdAt: Date;
    updatedAt: Date;
}
