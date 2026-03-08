import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseGuards,
    Req,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    async getMyNotifications(@Req() req) {
        return this.notificationService.getUserNotifications(req.user.id);
    }

    @Post(':id/read')
    async markAsRead(@Param('id') id: string, @Req() req) {
        return this.notificationService.markAsRead(id, req.user.id);
    }

    @Post('read-all')
    async markAllAsRead(@Req() req) {
        return this.notificationService.markAllAsRead(req.user.id);
    }

    @Delete()
    async deleteAll(@Req() req) {
        return this.notificationService.deleteAll(req.user.id);
    }
}
