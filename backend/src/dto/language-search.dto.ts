import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class LanguageSearchDto {
  @IsString()
  @IsNotEmpty()
  q: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}

export class UpdateLanguageStatusDto {
  @IsEnum(['active', 'in_progress', 'not_published'])
  status: 'active' | 'in_progress' | 'not_published';
}

export class BulkUpdateStatusDto {
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  ids: number[];

  @IsEnum(['active', 'in_progress', 'not_published'])
  status: 'active' | 'in_progress' | 'not_published';
}

export class LanguageDashboardQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(['active', 'in_progress', 'not_published'])
  status?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  sort?: string = 'questionCount';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';
}
