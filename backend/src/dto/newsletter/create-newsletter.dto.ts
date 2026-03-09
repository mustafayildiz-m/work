import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateNewsletterDto {
  @IsString()
  title: string;

  @IsDateString()
  @IsOptional()
  publishDate?: string;

  @IsString()
  @IsOptional()
  intro?: string;

  @IsOptional()
  sections?: any;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  sourceLanguage?: string;
}
