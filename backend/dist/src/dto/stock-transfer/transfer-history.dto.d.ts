export declare class TransferHistoryDto {
    stockId?: number;
    warehouseId?: number;
    fromWarehouseId?: number;
    toWarehouseId?: number;
    cargoCompany?: string;
    status?: 'pending' | 'completed' | 'cancelled';
    startDate?: Date;
    endDate?: Date;
}
