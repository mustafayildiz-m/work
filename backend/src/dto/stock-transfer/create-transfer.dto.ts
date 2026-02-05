import {
  IsInt,
  IsPositive,
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class CreateTransferDto {
  @IsInt()
  stockId: number;

  @IsInt()
  fromWarehouseId: number;

  @IsInt()
  toWarehouseId: number;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  cargoCompany?: string;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsDateString()
  @IsOptional()
  estimatedDeliveryDate?: string;

  @IsNumber()
  @IsOptional()
  cargoFee?: number;
}
