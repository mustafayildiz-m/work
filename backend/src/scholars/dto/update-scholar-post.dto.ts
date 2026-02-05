import { PartialType } from '@nestjs/mapped-types';
import {
  CreateScholarPostDto,
  CreateTranslationDto,
} from './create-scholar-post.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateScholarPostDto extends PartialType(CreateScholarPostDto) {}

export class UpdateTranslationDto extends PartialType(CreateTranslationDto) {
  @IsString()
  @IsOptional()
  id?: string;
}
