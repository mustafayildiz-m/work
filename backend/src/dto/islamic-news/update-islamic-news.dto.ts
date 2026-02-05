import { PartialType } from '@nestjs/mapped-types';
import { CreateIslamicNewsDto } from './create-islamic-news.dto';

export class UpdateIslamicNewsDto extends PartialType(CreateIslamicNewsDto) {}
