import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../entities/system-setting.entity';

@Injectable()
export class SystemSettingsService {
    constructor(
        @InjectRepository(SystemSetting)
        private settingsRepository: Repository<SystemSetting>,
    ) { }

    async getSetting(key: string, defaultValue: string = ''): Promise<string> {
        const setting = await this.settingsRepository.findOne({ where: { key } });
        return setting ? setting.value : defaultValue;
    }

    async getSettingBool(key: string, defaultValue: boolean = false): Promise<boolean> {
        const value = await this.getSetting(key);
        if (!value) return defaultValue;
        return value === 'true';
    }

    async setSetting(key: string, value: string, description?: string): Promise<SystemSetting> {
        let setting = await this.settingsRepository.findOne({ where: { key } });
        if (setting) {
            setting.value = value;
            if (description) setting.description = description;
        } else {
            setting = this.settingsRepository.create({ key, value, description });
        }
        return this.settingsRepository.save(setting);
    }

    async getAllSettings(): Promise<SystemSetting[]> {
        return this.settingsRepository.find();
    }
}
