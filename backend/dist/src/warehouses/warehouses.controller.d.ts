import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from '../dto/warehouse/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/warehouse/update-warehouse.dto';
export declare class WarehousesController {
    private readonly warehousesService;
    constructor(warehousesService: WarehousesService);
    create(createWarehouseDto: CreateWarehouseDto): Promise<import("../entities/warehouse.entity").Warehouse>;
    findAll(name?: string, location?: string, isActive?: string): Promise<import("../entities/warehouse.entity").Warehouse[]>;
    findOne(id: string): Promise<import("../entities/warehouse.entity").Warehouse | null>;
    update(id: string, updateWarehouseDto: UpdateWarehouseDto): Promise<import("../entities/warehouse.entity").Warehouse | null>;
    remove(id: string): Promise<import("../entities/warehouse.entity").Warehouse>;
}
