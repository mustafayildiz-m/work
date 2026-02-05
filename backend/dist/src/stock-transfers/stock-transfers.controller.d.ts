import { StockTransfersService } from './stock-transfers.service';
import { CreateTransferDto } from '../dto/stock-transfer/create-transfer.dto';
import { TransferHistoryDto } from '../dto/stock-transfer/transfer-history.dto';
export declare class StockTransfersController {
    private readonly stockTransfersService;
    constructor(stockTransfersService: StockTransfersService);
    create(createTransferDto: CreateTransferDto): Promise<import("../entities/stock-transfer.entity").StockTransfer>;
    findAll(filters: TransferHistoryDto): Promise<import("../entities/stock-transfer.entity").StockTransfer[]>;
    findOne(id: string): Promise<import("../entities/stock-transfer.entity").StockTransfer>;
    update(id: string, updateTransferDto: Partial<CreateTransferDto>): Promise<import("../entities/stock-transfer.entity").StockTransfer>;
    complete(id: string): Promise<import("../entities/stock-transfer.entity").StockTransfer>;
    cancel(id: string): Promise<import("../entities/stock-transfer.entity").StockTransfer>;
}
