import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { NotificationModule } from 'src/modules/notification-socket/notification.module';
import { TapModule } from 'src/modules/tap/tap.module';

@Module({
  imports: [NotificationModule, TapModule],
  controllers: [JobController],
  providers: [JobService],
})
export class JobModule {}
