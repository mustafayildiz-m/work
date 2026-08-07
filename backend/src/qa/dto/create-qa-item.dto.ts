import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QaItemTranslationDto {
  @IsNumber()
  languageId: number;

  @IsString()
  question: string;

  @IsString()
  answer: string;

  @IsOptional()
  @IsString()
  keywords?: string;
}

export class CreateQaItemDto {
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsString()
  sourceReference?: string;

  @IsOptional()
  @IsString()
  sourceBookletName?: string;

  @IsOptional()
  @IsString()
  sourceSection?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  tagIds?: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QaItemTranslationDto)
  translations: QaItemTranslationDto[];
}
