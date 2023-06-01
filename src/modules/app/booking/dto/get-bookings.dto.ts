import { IsArray, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus, JobType, ServiceType } from '@prisma/client';
import { ListingParams } from 'src/core/dto';
import { ServiceNames } from '../../customer/dto';
import { Type } from 'class-transformer';

export class CustomerGetBookingsDto extends ListingParams {
  @ApiProperty({
    required: false,
    description: 'Select the respective service type.',
    enum: ServiceType,
  })
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiProperty({
    required: false,
    description: 'Select the respective status of the booking.',
    enum: BookingStatus,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @ApiProperty({
    isArray: true,
    type: ServiceNames,
  })
  @IsArray()
  @ValidateNested()
  @Type(() => ServiceNames)
  @IsOptional()
  services: ServiceNames[];
}

export class VendorGetBookingsDto extends ListingParams {
  @ApiProperty({
    required: false,
    description: 'Select the respective service type.',
    enum: ServiceType,
  })
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiProperty({
    required: false,
    description: 'Select the respective status of the booking.',
    enum: BookingStatus,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @ApiProperty({
    required: false,
    description: 'Select the vendorServiceId of the booking.',
  })
  @IsOptional()
  vendorServiceId: number;

  @ApiProperty({
    required: false,
    description: 'Select the date from range of the booking.',
  })
  @IsOptional()
  dateFrom: string;

  @ApiProperty({
    required: false,
    description: 'Select the date till range of the booking.',
  })
  @IsOptional()
  dateTill: string;
}

export class AdminGetBookingsDto extends ListingParams {
  @ApiProperty({
    required: false,
    description: 'Select the respective service type.',
    enum: ServiceType,
  })
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiProperty({
    required: false,
    description: 'Select the respective status of the booking.',
    enum: BookingStatus,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @ApiProperty({
    required: false,
    description: 'Select the respective status of the booking.',
    enum: JobType,
  })
  @IsOptional()
  @IsEnum(JobType)
  jobType: JobType;

  @ApiProperty({
    required: false,
    description: 'Select the date from range of the booking.',
  })
  @IsOptional()
  dateFrom: string;

  @ApiProperty({
    required: false,
    description: 'Select the date till range of the booking.',
  })
  @IsOptional()
  dateTill: string;
}
