import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreatePodcastDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  audioUrl?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsOptional()
  duration?: number | string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsOptional()
  isActive?: boolean | string;

  @IsOptional()
  isFeatured?: boolean | string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsDateString()
  @IsOptional()
  publishDate?: string;
}
