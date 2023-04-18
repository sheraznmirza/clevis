import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MAIL_ENV } from './mailconstant';

// @Global() // 👈 global module
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule], // import module if not enabled globally
      useFactory: async (config: ConfigService) => ({
        // transport: config.get("MAIL_TRANSPORT"),
        // or
        transport: {
          host: MAIL_ENV.MAIL_HOST,
          port: 587, // 465 and 25 is not working
          secure: false,
          requireTLS: true,
          auth: {
            user: MAIL_ENV.MAIL_USER,
            pass: MAIL_ENV.MAIL_PASSWORD,
          },
        },
        defaults: {
          from: `"No Reply" <${MAIL_ENV.MAIL_FROM}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
