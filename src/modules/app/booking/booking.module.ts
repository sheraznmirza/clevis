import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { BookingController } from './booking.controller';
import { TapModule } from 'src/modules/tap/tap.module';
import { TapService } from 'src/modules/tap/tap.service';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),TapModule, HttpModule
  ],
  providers: [BookingService, BookingRepository,TapService],
  controllers: [BookingController],
})
export class BookingModule {}
