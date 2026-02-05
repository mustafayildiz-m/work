import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDetailsDto } from './create-event-details.dto';

export class UpdateEventDetailsDto extends PartialType(CreateEventDetailsDto) {}
