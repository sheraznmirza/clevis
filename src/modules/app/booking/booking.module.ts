import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { BookingController } from './booking.controller';
import { HttpModule, HttpService } from '@nestjs/axios';
import { TapModule } from 'src/modules/tap/tap.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    TapModule,
  ],
  providers: [BookingService, BookingRepository],
  controllers: [BookingController],
})
export class BookingModule {}
