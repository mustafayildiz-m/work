import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../entities/notification.entity';
import { Scholar } from '../scholars/entities/scholar.entity';
import { ScholarPost } from '../scholars/entities/scholar-post.entity';
import { NotificationService } from '../services/notification.service';
import { NotificationController } from '../controllers/notification.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Notification, Scholar, ScholarPost])],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule { }
