import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { BookingController } from './booking.controller';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    HttpModule,
  ],
  providers: [BookingService, BookingRepository],
  controllers: [BookingController],
})
export class BookingModule {}
