import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { Scholar } from '../scholars/entities/scholar.entity';
import { ScholarPost } from '../scholars/entities/scholar-post.entity';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        @InjectRepository(Scholar)
        private readonly scholarRepository: Repository<Scholar>,
        @InjectRepository(ScholarPost)
        private readonly scholarPostRepository: Repository<ScholarPost>,
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
        const notifications = await this.notificationRepository.find({
            where: { user_id: userId },
            relations: ['related_user'],
            order: { created_at: 'DESC' },
            take: 50,
        });

        await Promise.all(
            notifications.map(async (notification: any) => {
                if (notification.type !== 'scholar_post') return;

                const scholarName = (notification.title || '')
                    .replace(/\s+yeni bir gönderi paylaştı$/i, '')
                    .trim();
                if (!scholarName) return;

                const scholar = await this.scholarRepository.findOne({
                    where: { fullName: scholarName },
                    select: ['id', 'fullName', 'photoUrl'],
                });
                if (!scholar) return;

                const latestPost = await this.scholarPostRepository.findOne({
                    where: { scholarId: scholar.id },
                    order: { createdAt: 'DESC' },
                    select: ['id'],
                });

                notification.scholar_id = scholar.id;
                notification.post_id = latestPost?.id || null;

                if (!notification.related_user) {
                    notification.related_user = {
                        firstName: scholar.fullName,
                        lastName: '',
                        photoUrl: scholar.photoUrl,
                    };
                }
            }),
        );

        return notifications;
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

    async deleteNotification(notificationId: string, userId: number) {
        const result = await this.notificationRepository.delete({ id: notificationId, user_id: userId });
        if (result.affected === 0) {
            throw new NotFoundException('Notification not found');
        }
        return { success: true };
    }

    async deleteAll(userId: number) {
        await this.notificationRepository.delete({ user_id: userId });
        return { success: true };
    }
}
