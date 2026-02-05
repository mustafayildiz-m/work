import {
  IsString,
  IsOptional,
  IsDateString,
  ValidateNested,
  IsArray,
  IsNumber,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateScholarBookDto {
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  coverUrl?: string;
  @IsOptional()
  @IsString()
  pdfUrl?: string;
}

class CreateSourceDto {
  @IsString()
  content: string;
  @IsOptional()
  @IsString()
  url?: string;
}

export class CreateScholarDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  lineage?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  deathDate?: string;

  @IsString()
  biography: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  // Konum bilgileri
  @IsOptional()
  @IsNumber()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsString()
  locationName?: string;

  @IsOptional()
  @IsString()
  locationDescription?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateScholarBookDto)
  @IsArray()
  ownBooks?: CreateScholarBookDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSourceDto)
  @IsArray()
  sources?: CreateSourceDto[];

  @IsOptional()
  @IsArray()
  relatedBooks?: number[]; // book id listesi
}
