import { ApiProperty } from '@nestjs/swagger';
import { JobType, RiderJobStatus } from '@prisma/client';
import { ListingParams } from 'src/core/dto';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class GetRiderJobsDto extends ListingParams {
  @ApiProperty({
    required: true,
    enum: JobType,
  })
  @IsEnum(JobType)
  @IsNotEmpty()
  jobType: JobType;
}

export class GetVendorJobsDto extends ListingParams {
  @ApiProperty({
    required: true,
    enum: JobType,
  })
  @IsEnum(JobType)
  @IsNotEmpty()
  jobType: JobType;

  @ApiProperty({
    required: true,
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
}
