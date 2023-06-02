import {
  Controller,
  Post,
  Get,
  UseGuards,
  Query,
  Body,
  Param,
  Patch,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { ApiTags } from '@nestjs/swagger';

import { RolesGuard } from '../../../core/guards';
import { Authorized } from '../../../core/decorators';
import { UserType } from '@prisma/client';
import {
  AdminGetBookingsDto,
  CreateBookingDto,
  CustomerGetBookingsDto,
  UpdateBookingStatusParam,
  VendorGetBookingsDto,
} from './dto';
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
  @Post('customer/me')
  getCustomerBookings(@GetUser() user, @Body() dto: CustomerGetBookingsDto) {
    return this.bookingService.getCustomerBookings(user.userTypeId, dto);
  }

  @Authorized(UserType.VENDOR)
  @Get('vendor/me')
  getVendorBookings(@GetUser() user, @Query() dto: VendorGetBookingsDto) {
    return this.bookingService.getVendorBookings(user.userTypeId, dto);
  }

  @Authorized(UserType.CUSTOMER)
  @Get('customer/ById/:bookingMasterId')
  getCustomerBookingById(@Param('bookingMasterId') bookingMasterId: number) {
    return this.bookingService.getCustomerBookingById(bookingMasterId);
  }

  @Authorized(UserType.VENDOR)
  @Get('vendor/ById/:bookingMasterId')
  getVendorBookingById(@Param('bookingMasterId') bookingMasterId: number) {
    return this.bookingService.getVendorBookingById(bookingMasterId);
  }

  @Authorized(UserType.VENDOR)
  @Patch('status/:bookingMasterId')
  updateVendorBookingStatus(
    @Param('bookingMasterId') bookingMasterId: number,
    @Query() dto: UpdateBookingStatusParam,
  ) {
    return this.bookingService.updateVendorBookingStatus(bookingMasterId, dto);
  }

  @Authorized(UserType.ADMIN)
  @Get('admin/ById/:bookingMasterId')
  getAdminBookingById(@Param('bookingMasterId') bookingMasterId: number) {
    return this.bookingService.getAdminBookingById(bookingMasterId);
  }

  @Authorized(UserType.ADMIN)
  @Get('admin')
  getAdminBookings(@Query() dto: AdminGetBookingsDto) {
    return this.bookingService.getAdminBookings(dto);
  }
}
