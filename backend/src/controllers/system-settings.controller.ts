import { Controller, Get, Post, Body, UseGuards, Patch, Param } from '@nestjs/common';
import { SystemSettingsService } from '../services/system-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('system-settings')
export class SystemSettingsController {
    constructor(private readonly settingsService: SystemSettingsService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getAll() {
        return this.settingsService.getAllSettings();
    }

    @Get(':key')
    async getOne(@Param('key') key: string) {
        const value = await this.settingsService.getSetting(key);
        return { key, value };
    }

    @Patch(':key')
    @UseGuards(JwtAuthGuard)
    async update(@Param('key') key: string, @Body() body: { value: string, description?: string }) {
        return this.settingsService.setSetting(key, body.value, body.description);
    }
}
