import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TagTranslationDto {
  @IsNumber()
  languageId: number;

  @IsString()
  name: string;
}

export class CreateQaTagDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagTranslationDto)
  translations: TagTranslationDto[];
}

export class UpdateQaTagDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagTranslationDto)
  translations?: TagTranslationDto[];
}
