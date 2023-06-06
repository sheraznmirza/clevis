import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../app/auth/auth.module';
import { NotificationService } from './notification.service';
import { OneSignalService } from './one-signal.service';
// import { PrismaModule } from '../prisma/prisma.module';
// import DatabaseModule from 'database/database.module';

@Global()
@Module({
  // imports: [DatabaseModule],
  // imports: [PrismaModule],
  imports: [AuthModule],
  providers: [NotificationService, OneSignalService],
  exports: [NotificationService, OneSignalService],
})
export class NotificationModule {}
