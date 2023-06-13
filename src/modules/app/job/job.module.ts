import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { NotificationModule } from 'src/modules/notification-socket/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [JobController],
  providers: [JobService],
})
export class JobModule {}
