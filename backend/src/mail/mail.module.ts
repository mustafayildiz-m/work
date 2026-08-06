import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/adapters/ejs.adapter';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { existsSync } from 'fs';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const port = Number(config.get('MAIL_PORT') || 587);
        return {
        transport: {
          host: config.get('MAIL_HOST'),
          port,
          secure: port === 465,
          requireTLS: port === 587,
          connectionTimeout: 10_000,
          greetingTimeout: 10_000,
          socketTimeout: 15_000,
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"İslâmî Windows" <${config.get('MAIL_FROM')}>`,
        },
        template: {
          dir: existsSync(join(__dirname, 'templates'))
            ? join(__dirname, 'templates')
            : join(process.cwd(), 'src/mail/templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        },
      };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
