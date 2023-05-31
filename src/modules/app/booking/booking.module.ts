import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { BookingController } from './booking.controller';
@Module({
  providers: [BookingService, BookingRepository],
  controllers: [BookingController],
})
export class BookingModule {}
