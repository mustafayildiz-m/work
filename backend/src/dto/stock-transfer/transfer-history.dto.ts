import { IsInt, IsOptional, IsEnum, IsDate, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class TransferHistoryDto {
  @IsInt()
  @IsOptional()
  stockId?: number;

  @IsInt()
  @IsOptional()
  warehouseId?: number;

  @IsInt()
  @IsOptional()
  fromWarehouseId?: number;

  @IsInt()
  @IsOptional()
  toWarehouseId?: number;

  @IsString()
  @IsOptional()
  cargoCompany?: string;

  @IsEnum(['pending', 'completed', 'cancelled'])
  @IsOptional()
  status?: 'pending' | 'completed' | 'cancelled';

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;
}
