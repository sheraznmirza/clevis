import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { BookingController } from './booking.controller';
import { HttpModule, HttpService } from '@nestjs/axios';
import { TapModule } from 'src/modules/tap/tap.module';
import { NotificationModule } from 'src/modules/notification-socket/notification.module';
import { MailModule } from 'src/modules/mail/mail.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    TapModule,
    NotificationModule,
    MailModule,
  ],
  providers: [BookingService, BookingRepository],
  controllers: [BookingController],
})
export class BookingModule {}
