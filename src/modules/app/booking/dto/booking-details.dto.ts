import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

class Articles {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  allocatePriceId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

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

  @ApiProperty({
    isArray: true,
    required: true,
    type: Articles,
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Articles)
  articles: Articles[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  vendorId: number;
}
