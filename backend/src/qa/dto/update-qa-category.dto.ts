import { PartialType } from '@nestjs/mapped-types';
import { CreateQaCategoryDto } from './create-qa-category.dto';

export class UpdateQaCategoryDto extends PartialType(CreateQaCategoryDto) {}
