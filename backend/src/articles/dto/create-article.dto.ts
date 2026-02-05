import {
  IsString,
  IsDate,
  IsArray,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class ArticleTranslationDto {
  @IsNumber()
  @IsOptional()
  id?: number; // Update için gerekli

  @IsNumber()
  @IsNotEmpty()
  languageId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  pdfUrl?: string;
}

export class CreateArticleDto {
  @IsNumber()
  @IsNotEmpty()
  bookId: number;

  @IsString()
  @IsOptional()
  author?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  publishDate?: Date;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArticleTranslationDto)
  translations: ArticleTranslationDto[];
}
