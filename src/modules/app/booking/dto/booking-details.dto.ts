import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

class LocationDetails {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Min(1)
  userAddressId?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class BookingDetailsDto {
  @ApiProperty({
    required: true,
    type: LocationDetails,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDetails)
  pickupLocation: LocationDetails;

  @ApiProperty({
    required: true,
    type: LocationDetails,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDetails)
  dropoffLocation: LocationDetails;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  vendorId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isWithDelivery: boolean;
}
