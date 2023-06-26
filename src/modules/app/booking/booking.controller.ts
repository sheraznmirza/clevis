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
  BookingDetailsDto,
  CreateBookingDto,
  CustomerGetBookingsDto,
  UpdateBookingStatusParam,
  VendorGetBookingsDto,
} from './dto';
import { BookingService } from './booking.service';
import { CreateBookingCarWashDto } from './dto/create-booking-carwash.dto';
import { GetUserType } from 'src/core/dto';

@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Booking')
@Controller('booking')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Authorized(UserType.CUSTOMER)
  @Post('car-wash')
  createBookingCarWash(
    @GetUser() user: GetUserType,
    @Body() dto: CreateBookingCarWashDto,
  ) {
    return this.bookingService.createBookingCarWash(user.userTypeId, dto);
  }

  @Authorized(UserType.CUSTOMER)
  @Post('laundry')
  createBookingLaundry(
    @GetUser() user: GetUserType,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingService.createBooking(user.userTypeId, dto);
  }

  @Authorized(UserType.CUSTOMER)
  @Post('customer/me')
  getCustomerBookings(
    @GetUser() user: GetUserType,
    @Body() dto: CustomerGetBookingsDto,
  ) {
    return this.bookingService.getCustomerBookings(user.userTypeId, dto);
  }

  @Authorized(UserType.VENDOR)
  @Get('vendor/me')
  getVendorBookings(
    @GetUser() user: GetUserType,
    @Query() dto: VendorGetBookingsDto,
  ) {
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
    @GetUser() user: GetUserType,
  ) {
    return this.bookingService.updateVendorBookingStatus(
      bookingMasterId,
      dto,
      user,
    );
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

  @Authorized(UserType.CUSTOMER)
  @Post('details')
  getBookingDetails(
    @GetUser() user: GetUserType,
    @Body() dto: BookingDetailsDto,
  ) {
    return this.bookingService.getBookingDetails(user, dto);
  }

  @Authorized(UserType.VENDOR)
  @Get('vendor/delivery')
  getVendorDelivery(@GetUser() user: GetUserType) {
    return this.bookingService.VendorDetail(user.userTypeId);
  }
}
