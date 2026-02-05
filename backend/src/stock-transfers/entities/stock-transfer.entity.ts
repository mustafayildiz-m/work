import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Stock } from '../../entities/stock.entity';
import { Warehouse } from '../../entities/warehouse.entity';

@Entity('stock_transfers')
export class StockTransfer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Stock, (stock) => stock.transfers)
  stock: Stock;

  @ManyToOne(() => Warehouse)
  fromWarehouse: Warehouse;

  @ManyToOne(() => Warehouse)
  toWarehouse: Warehouse;

  @Column()
  quantity: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: 'pending' | 'completed' | 'cancelled';

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  cargoCompany: string;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ type: 'date', nullable: true })
  estimatedDeliveryDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cargoFee: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
