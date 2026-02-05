import { PartialType } from '@nestjs/mapped-types';
import { CreateScholarStoryDto } from './create-scholar-story.dto';

export class UpdateScholarStoryDto extends PartialType(CreateScholarStoryDto) {}
