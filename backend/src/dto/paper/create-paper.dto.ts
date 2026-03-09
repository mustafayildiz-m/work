import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePaperDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsDateString()
  @IsOptional()
  publishDate?: string;

  @IsString()
  @IsOptional()
  intro?: string;

  @IsOptional()
  tags?: any; // JSON string or array from FormData

  @IsOptional()
  sections?: any;

  @IsString()
  @IsOptional()
  content?: string;
}
