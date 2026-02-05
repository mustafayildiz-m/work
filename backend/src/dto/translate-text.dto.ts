import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class TranslateTextDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000, { message: 'Metin çok uzun (maksimum 10,000 karakter)' })
  text: string;

  @IsString()
  @IsNotEmpty()
  targetLangCode: string;

  @IsString()
  @IsOptional()
  sourceLangCode?: string;
}
