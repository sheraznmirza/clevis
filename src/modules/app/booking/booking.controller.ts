import { Controller, Post, Get, UseGuards, Query, Body } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { ApiTags } from '@nestjs/swagger';

import { RolesGuard } from '../../../core/guards';
import { Authorized } from '../../../core/decorators';
import { UserType } from '@prisma/client';
import { CreateBookingDto, CustomerGetBookingsDto } from './dto';
import { BookingService } from './booking.service';

@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Booking')
@Controller('booking')
export class BookingController {
  constructor(private bookingService: BookingService) {}
  @Authorized(UserType.CUSTOMER)
  @Post()
  createBooking(@GetUser() user, @Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(user.userTypeId, dto);
  }

  @Authorized(UserType.CUSTOMER)
  @Post('/customer/me')
  getBookings(@GetUser() user, @Body() dto: CustomerGetBookingsDto) {
    return this.bookingService.getBookings(user.userTypeId, dto);
  }
}
