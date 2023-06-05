import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { BookingController } from './booking.controller';
import { TapModule } from 'src/modules/tap/tap.module';
import { TapService } from 'src/modules/tap/tap.service';
import { HttpModule, HttpService } from '@nestjs/axios';
@Module({
  imports: [TapModule, HttpModule],
  providers: [BookingService, BookingRepository, TapService],
  controllers: [BookingController],
})
export class BookingModule {}
