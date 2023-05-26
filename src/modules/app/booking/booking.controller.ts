import {
  Controller,
  Post,
  Get,
  UseGuards,
  Query,
  Param,
  Patch,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { ApiTags } from '@nestjs/swagger';

import { RolesGuard } from '../../../core/guards';
import { Authorized } from '../../../core/decorators';
import { UserType } from '@prisma/client';
import { CreateBookingDto } from './dto';
import { BookingService } from './booking.service';

@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Booking')
@Controller('booking')
export class BookingController {
  constructor(private bookingService: BookingService) {}
  @Authorized(UserType.CUSTOMER)
  @Post()
  createBooking(@GetUser() user, dto: CreateBookingDto) {
    return this.bookingService.createBooking(user.userTypeId, dto);
  }
}
