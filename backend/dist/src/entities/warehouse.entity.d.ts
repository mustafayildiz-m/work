import { Stock } from './stock.entity';
export declare class Warehouse {
    id: number;
    name: string;
    description: string;
    location: string;
    isActive: boolean;
    stocks: Stock[];
    createdAt: Date;
    updatedAt: Date;
}
