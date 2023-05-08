import { Module } from '@nestjs/common';
import { MailModule } from '../../mail/mail.module';
import { RiderService } from './rider.service';
import { RiderRepository } from './rider.repository';
import { RiderController } from './rider.controller';
@Module({
  imports: [MailModule],
  providers: [RiderService, RiderRepository],
  controllers: [RiderController],
})
export class VendorModule {}
