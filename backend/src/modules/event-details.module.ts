import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventDetails } from '../entities/event-details.entity';
import { EventDetailsController } from '../controllers/event-details.controller';
import { EventDetailsService } from '../services/event-details.service';
import { UserFollow } from '../entities/user-follow.entity';
import { UserScholarFollow } from '../entities/user-scholar-follow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventDetails, UserFollow, UserScholarFollow]),
  ],
  controllers: [EventDetailsController],
  providers: [EventDetailsService],
  exports: [EventDetailsService],
})
export class EventDetailsModule {}
