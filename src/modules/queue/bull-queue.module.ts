import { BullModule, InjectQueue } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import AppConfig from 'src/configs/app.config';
import { BullQueueService } from './bull-queue.service';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({ name: AppConfig.QUEUE.NAME.MAIL }),
  ],
  providers: [BullQueueService],
  exports: [BullQueueService],
})
export class BullQueueModule {}
