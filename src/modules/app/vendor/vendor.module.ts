import { Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { VendorRepository } from './vendor.repository';
import { MailModule } from '../../../modules/mail/mail.module';
import { NotificationModule } from 'src/modules/notification-socket/notification.module';
@Module({
  imports: [MailModule, NotificationModule],
  providers: [VendorService, VendorRepository],
  controllers: [VendorController],
})
export class VendorModule {}
