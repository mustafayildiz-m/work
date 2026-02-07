import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) { }

  async sendWelcomeEmail(email: string, name: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'İslâmî Windows - Hoş Geldiniz!',
      template: './welcome',
      context: {
        name: name,
      },
    });
  }

  async sendVerificationEmail(email: string, name: string, token: string) {
    const url = `https://islamicwindows.com/auth/verify?token=${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'E-posta Adresinizi Doğrulayın',
      template: './verification',
      context: {
        name: name,
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
