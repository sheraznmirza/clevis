import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { OneSignalService } from './one_signal.service';
// import { PrismaModule } from '../prisma/prisma.module';
// import DatabaseModule from 'database/database.module';

@Module({
  // imports: [DatabaseModule],
  // imports: [PrismaModule],
  providers: [NotificationService, OneSignalService],
  exports: [NotificationService, OneSignalService],
})
export class NotificationModule {}
