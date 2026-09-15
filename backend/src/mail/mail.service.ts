import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  /**
   * Açılışta SMTP bağlantısını doğrular. Amaç: app password süresi dolduğunda
   * ya da MAIL_* değişkenleri eksik/eski kaldığında hatayı ilk mail denemesine
   * kadar saklamak yerine, boot log'unda hemen görünür kılmak.
   */
  async onModuleInit() {
    const missing = ['MAIL_HOST', 'MAIL_USER', 'MAIL_PASS', 'MAIL_FROM'].filter(
      (key) => !this.configService.get<string>(key),
    );
    if (missing.length) {
      this.logger.error(
        `SMTP yapılandırması eksik: ${missing.join(', ')} tanımlı değil. Mail gönderimi çalışmayacak.`,
      );
      return;
    }

    try {
      const transporter = (
        this.mailerService as unknown as {
          transporter: { verify: () => Promise<unknown> };
        }
      ).transporter;
      await transporter.verify();
      this.logger.log(
        `SMTP bağlantısı doğrulandı (${this.configService.get('MAIL_HOST')}:${this.configService.get('MAIL_PORT')}, kullanıcı: ${this.configService.get('MAIL_USER')})`,
      );
    } catch (error) {
      this.logger.error(
        `SMTP bağlantısı doğrulanamadı (${this.configService.get('MAIL_HOST')}:${this.configService.get('MAIL_PORT')}, kullanıcı: ${this.configService.get('MAIL_USER')}): ${(error as Error).message}. Gmail app password'ü yenilenmiş olabilir — .env içindeki MAIL_PASS'i güncelleyip commit'leyin.`,
      );
    }
  }

  async sendWelcomeEmail(email: string, recipientName: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'İslâmî Windows - Hoş Geldiniz!',
      template: './welcome',
      context: {
        recipientName: recipientName || 'Sayın Kullanıcı',
        name: recipientName || 'Sayın Kullanıcı',
      },
    });
  }

  async sendVerificationEmail(
    email: string,
    recipientName: string,
    token: string,
  ) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'https://islamicwindows.com';
    const url = `${frontendUrl}/auth/verify?token=${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'E-posta Adresinizi Doğrulayın',
      template: './verification',
      context: {
        recipientName: recipientName || 'Sayın Kullanıcı',
        name: recipientName || 'Sayın Kullanıcı',
        url: url,
      },
    });
  }

  async sendPasswordResetEmail(
    email: string,
    recipientName: string,
    token: string,
  ) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'https://islamicwindows.com';
    const url = `${frontendUrl}/auth/reset-password?token=${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Şifrenizi Sıfırlayın',
      template: './reset-password',
      context: {
        recipientName: recipientName || 'Sayın Kullanıcı',
        name: recipientName || 'Sayın Kullanıcı',
        url: url,
      },
    });
  }

  async sendTestMail(to: string) {
    try {
      await this.mailerService.sendMail({
        to: to,
        subject: 'Mail Testi',
        text: 'Bu bir test mailidir.',
        html: '<b>Bu bir test mailidir.</b>',
      });
      return { success: true };
    } catch (error) {
      console.error('Mail gönderim hatası:', error);
      return { success: false, error: error.message };
    }
  }
}
