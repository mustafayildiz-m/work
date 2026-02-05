import { Stock } from '../../entities/stock.entity';
import { Warehouse } from '../../entities/warehouse.entity';
export declare class StockTransfer {
    id: number;
    stock: Stock;
    fromWarehouse: Warehouse;
    toWarehouse: Warehouse;
    quantity: number;
    status: 'pending' | 'completed' | 'cancelled';
    notes: string;
    cargoCompany: string;
    trackingNumber: string;
    estimatedDeliveryDate: Date;
    cargoFee: number;
    createdAt: Date;
    updatedAt: Date;
}
