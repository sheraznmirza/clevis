import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateBookingStatusParam {
  @ApiProperty({
    required: false,
    description: 'Select the respective booking status.',
    enum: BookingStatus,
  })
  @IsNotEmpty()
  @IsEnum(BookingStatus)
  bookingStatus: BookingStatus;
}
