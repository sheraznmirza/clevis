import { ApiProperty } from '@nestjs/swagger';
import { JobType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ListingParams } from 'src/core/dto';

export class RiderEarning extends ListingParams {
  @ApiProperty({
    required: false,
    description: 'JobType',
    enum: JobType,
  })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiProperty({
    required: false,
  })
  @IsDateString()
  @IsOptional()
  timeFrom?: string;

  @ApiProperty({
    required: false,
  })
  @IsDateString()
  @IsOptional()
  timeTill?: string;
}
