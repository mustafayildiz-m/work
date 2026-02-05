import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor() {}

  // Her 4 saatte bir API durumunu kontrol et
  @Cron('0 */4 * * *')
  async checkApiHealth() {
    this.logger.log('🕐 API sağlık kontrolü yapılıyor...');
    // API sağlık kontrolü yapılabilir
  }
}
