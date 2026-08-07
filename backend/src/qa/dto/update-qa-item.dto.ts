import { PartialType } from '@nestjs/mapped-types';
import { CreateQaItemDto } from './create-qa-item.dto';

export class UpdateQaItemDto extends PartialType(CreateQaItemDto) {}
