import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { EventDetailsService } from '../services/event-details.service';
import { CreateEventDetailsDto } from '../dto/event-details/create-event-details.dto';
import { UpdateEventDetailsDto } from '../dto/event-details/update-event-details.dto';

@Controller('event-details')
export class EventDetailsController {
  constructor(private readonly eventDetailsService: EventDetailsService) {}

  @Post()
  create(@Body() createEventDetailsDto: CreateEventDetailsDto) {
    return this.eventDetailsService.create(createEventDetailsDto);
  }

  @Get()
  findAll() {
    return this.eventDetailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.eventDetailsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateEventDetailsDto: UpdateEventDetailsDto,
  ) {
    return this.eventDetailsService.update(id, updateEventDetailsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.eventDetailsService.remove(id);
  }

  @Get('timeline/:userId')
  getTimeline(@Param('userId') userId: number) {
    return this.eventDetailsService.getTimeline(userId);
  }
}
