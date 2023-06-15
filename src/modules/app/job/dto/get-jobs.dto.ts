import { ApiProperty } from '@nestjs/swagger';
import { JobType, RiderJobStatus } from '@prisma/client';
import { ListingParams } from 'src/core/dto';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

enum Order {
  asc = 'asc',
  desc = 'desc',
}

export class GetRiderJobsDto extends ListingParams {
  @ApiProperty({
    required: false,
    enum: JobType,
  })
  @IsEnum(JobType)
  @IsOptional()
  jobType: JobType;

  @ApiProperty({
    required: false,
    enum: RiderJobStatus,
  })
  @IsEnum(RiderJobStatus)
  @IsOptional()
  status: RiderJobStatus;

  @ApiProperty({
    required: false,
    enum: Order,
  })
  @IsEnum(Order)
  @IsOptional()
  orderBy: Order;
}

export class GetVendorJobsDto extends ListingParams {
  @ApiProperty({
    required: false,
    enum: JobType,
  })
  @IsEnum(JobType)
  @IsOptional()
  jobType: JobType;

  @ApiProperty({
    required: false,
    enum: RiderJobStatus,
  })
  @IsEnum(RiderJobStatus)
  @IsOptional()
  status: RiderJobStatus;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  timeFrom: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  timeTill: string;

  @ApiProperty({
    required: false,
    enum: Order,
  })
  @IsEnum(Order)
  @IsOptional()
  orderBy: Order;
}
