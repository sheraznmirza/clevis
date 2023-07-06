import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import AppConfig from 'src/configs/app.config';
import { AuthModule } from '../app/auth/auth.module';
import { RiderModule } from '../app/rider/rider.module';
import { VendorModule } from '../app/vendor/vendor.module';
import { VendorRepository } from '../app/vendor/vendor.repository';
import { VendorService } from '../app/vendor/vendor.service';
import { MailModule } from '../mail/mail.module';
import { BullQueueService } from './bull-queue.service';
import { MailProcessor } from './jobs/mail.processor';
import { ConfigService } from '@nestjs/config';

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
    VendorModule,
    RiderModule,
  ],
  providers: [
    BullQueueService,
    MailProcessor,
    VendorService,
    VendorRepository,
    ConfigService,
  ],
  exports: [BullQueueService],
})
export class BullQueueModule {}
