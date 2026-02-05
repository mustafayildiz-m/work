export declare class CreateTransferDto {
    stockId: number;
    fromWarehouseId: number;
    toWarehouseId: number;
    quantity: number;
    notes?: string;
    cargoCompany?: string;
    trackingNumber?: string;
    estimatedDeliveryDate?: string;
    cargoFee?: number;
}
