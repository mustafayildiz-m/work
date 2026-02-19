import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSetting } from '../entities/system-setting.entity';
import { SystemSettingsService } from '../services/system-settings.service';
import { SystemSettingsController } from '../controllers/system-settings.controller';

@Module({
    imports: [TypeOrmModule.forFeature([SystemSetting])],
    controllers: [SystemSettingsController],
    providers: [SystemSettingsService],
    exports: [SystemSettingsService],
})
export class SystemSettingsModule { }
