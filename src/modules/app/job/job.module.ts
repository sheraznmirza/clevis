import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { NotificationModule } from 'src/modules/notification-socket/notification.module';
import { TapModule } from 'src/modules/tap/tap.module';
import { MailModule } from 'src/modules/mail/mail.module';

@Module({
  imports: [NotificationModule, TapModule, MailModule],
  controllers: [JobController],
  providers: [JobService],
})
export class JobModule {}
