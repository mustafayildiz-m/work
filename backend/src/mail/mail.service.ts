import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) { }

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

  async sendVerificationEmail(email: string, recipientName: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://islamicwindows.com';
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
