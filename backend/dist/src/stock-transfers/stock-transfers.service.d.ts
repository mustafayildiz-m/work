import { Repository } from 'typeorm';
import { StockTransfer } from '../entities/stock-transfer.entity';
import { Stock } from '../entities/stock.entity';
import { CreateTransferDto } from '../dto/stock-transfer/create-transfer.dto';
import { TransferHistoryDto } from '../dto/stock-transfer/transfer-history.dto';
export declare class StockTransfersService {
    private transferRepository;
    private stockRepository;
    constructor(transferRepository: Repository<StockTransfer>, stockRepository: Repository<Stock>);
    create(createTransferDto: CreateTransferDto): Promise<StockTransfer>;
    findAll(filters: TransferHistoryDto): Promise<StockTransfer[]>;
    findOne(id: number): Promise<StockTransfer>;
    complete(id: number): Promise<StockTransfer>;
    cancel(id: number): Promise<StockTransfer>;
    update(id: number, updateData: Partial<CreateTransferDto>): Promise<StockTransfer>;
}
