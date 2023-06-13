import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ServiceType } from '@prisma/client';

export enum VendorStatus {
  BUSY = 'BUSY',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}
export class ServiceNames {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  serviceId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  serviceName: string;
}
export class VendorLocationDto {
  @ApiProperty({
    required: false,
    description: 'Listing parameters Page Number',
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({
    required: false,
    description: 'Listing parameters Per Page Limit',
  })
  @IsOptional()
  @IsNumber()
  take?: number;

  @ApiProperty({
    required: false,
    description: 'Search by name, title or code',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    description: 'The longitude',
  })
  @IsNumber()
  @IsOptional()
  longitude: number;

  @ApiProperty({
    required: false,
    description: 'The latitude',
  })
  @IsNumber()
  @IsNumber()
  @IsOptional()
  latitude: number;

  @ApiProperty({
    required: false,
    description: 'The distance radius',
  })
  @IsNumber()
  @IsOptional()
  distance: number;

  @ApiProperty({
    required: false,
    description: 'Status for vendor.',
    enum: VendorStatus,
  })
  @IsEnum(VendorStatus)
  @IsOptional()
  vendorStatus: VendorStatus;

  @ApiProperty({
    required: false,
    description: 'Select the respective service type.',
    enum: ServiceType,
  })
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiProperty({
    isArray: true,
    type: ServiceNames,
  })
  @IsArray()
  @ValidateNested()
  @Type(() => ServiceNames)
  @IsOptional()
  services: ServiceNames[];

  // @ApiProperty({
  //   required: false,
  //   description: 'Enum for the day of the week',
  //   enum: Days,
  // })
  // @IsNotEmpty()
  // @IsEnum(Days)
  // currentDay: Days;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  currentDay: string;
}
