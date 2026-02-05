import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TranslationStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
}

export class CreateTranslationDto {
  @IsString()
  language: string; // 'tr', 'en', 'ar', 'de'

  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsOptional()
  mediaUrls?: string[];

  @IsArray()
  @IsOptional()
  fileUrls?: string[];

  @IsEnum(TranslationStatus)
  @IsOptional()
  status?: TranslationStatus | null; // Nullable - moderasyon sistemi sonradan eklenecek

  @IsNumber()
  @IsOptional()
  translatedBy?: number | null; // Nullable - moderasyon sistemi sonradan eklenecek

  @IsNumber()
  @IsOptional()
  approvedBy?: number | null; // Nullable - moderasyon sistemi sonradan eklenecek
}

export class CreateScholarPostDto {
  @IsNumber()
  scholarId: number;

  @ValidateNested({ each: true })
  @Type(() => CreateTranslationDto)
  translations: CreateTranslationDto[];
}
