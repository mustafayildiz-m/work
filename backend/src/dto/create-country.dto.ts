import {
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsBoolean,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  alpha2: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  alpha3?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  name: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  nameTr?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  flagUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  primaryLanguageId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
