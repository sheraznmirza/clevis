import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MediaFormat } from 'src/core/globalTypes';

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

class LocationType {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  userAddressId?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fullAddress?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  cityId?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  timeFrom: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  timeTill: string;
}

export class CreateBookingDto {
  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  bookingDate: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  vendorId: number;

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

  @ApiProperty({
    required: false,
    isArray: true,
    type: MediaFormat,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaFormat)
  attachments: MediaFormat[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  instructions: string;

  @ApiProperty({
    required: true,
    type: LocationType,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationType)
  pickupLocation: LocationType;

  @ApiProperty({
    required: true,
    type: LocationType,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationType)
  dropoffLocation: LocationType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  carNumberPlate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tapAuthId: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isWithDelivery: boolean;
}
