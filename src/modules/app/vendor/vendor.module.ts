import { Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { VendorRepository } from './vendor.repository';
import { MailModule } from '../../../modules/mail/mail.module';
@Module({
  imports: [MailModule],
  providers: [VendorService, VendorRepository],
  controllers: [VendorController],
})
export class VendorModule {}
