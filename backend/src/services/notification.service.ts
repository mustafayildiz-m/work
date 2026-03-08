import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    async createNotification(data: {
        userId: number;
        type: string;
        title: string;
        message?: string;
        relatedUserId?: number;
    }) {
        const notification = this.notificationRepository.create({
            user_id: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            related_user_id: data.relatedUserId,
        });
        return this.notificationRepository.save(notification);
    }

    async getUserNotifications(userId: number) {
        return this.notificationRepository.find({
            where: { user_id: userId },
            relations: ['related_user'],
            order: { created_at: 'DESC' },
            take: 50,
        });
    }

    async markAsRead(notificationId: string, userId: number) {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId, user_id: userId },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        notification.is_read = true;
        return this.notificationRepository.save(notification);
    }

    async markAllAsRead(userId: number) {
        await this.notificationRepository.update(
            { user_id: userId, is_read: false },
            { is_read: true },
        );
        return { success: true };
    }

    async deleteAll(userId: number) {
        await this.notificationRepository.delete({ user_id: userId });
        return { success: true };
    }
}
