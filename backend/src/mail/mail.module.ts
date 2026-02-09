import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
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
            useFactory: (config: ConfigService) => ({
                transport: {
                    host: config.get('MAIL_HOST'),
                    port: config.get('MAIL_PORT'),
                    secure: config.get('MAIL_PORT') == 465, // SSL for 465
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
            }),
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }
