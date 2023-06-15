import { BullModule, InjectQueue } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import AppConfig from 'src/configs/app.config';
import { BullQueueService } from './bull-queue.service';
import { MailProcessor } from './jobs/mail.processor';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../app/auth/auth.module';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({ name: AppConfig.QUEUE.NAME.MAIL }),
    MailModule,
    AuthModule,
  ],
  providers: [BullQueueService, MailProcessor],
  exports: [BullQueueService],
})
export class BullQueueModule {}
