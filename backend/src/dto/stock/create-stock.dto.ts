import { IsNumber, IsPositive, IsInt } from 'class-validator';

export class CreateStockDto {
  @IsInt()
  bookId: number;

  @IsInt()
  languageId: number;

  @IsInt()
  warehouseId: number;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  unitPrice: number;
}
