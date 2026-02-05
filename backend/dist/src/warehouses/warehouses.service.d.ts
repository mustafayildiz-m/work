import { Repository } from 'typeorm';
import { Warehouse } from '../entities/warehouse.entity';
import { CreateWarehouseDto } from '../dto/warehouse/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/warehouse/update-warehouse.dto';
import { Stock } from '../entities/stock.entity';
import { StockTransfer } from '../entities/stock-transfer.entity';
export declare class WarehousesService {
    private warehouseRepository;
    private stockRepository;
    private stockTransferRepository;
    constructor(warehouseRepository: Repository<Warehouse>, stockRepository: Repository<Stock>, stockTransferRepository: Repository<StockTransfer>);
    create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse>;
    findAll(name?: string, location?: string, isActive?: string): Promise<Warehouse[]>;
    findOne(id: number): Promise<Warehouse | null>;
    update(id: number, updateWarehouseDto: UpdateWarehouseDto): Promise<Warehouse | null>;
    remove(id: number): Promise<Warehouse>;
}
