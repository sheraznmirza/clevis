import { ApiProperty } from '@nestjs/swagger';
import { JobType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateJobDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  bookingMasterId: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  jobDate: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  jobTime: string;

  @ApiProperty({
    required: true,
    enum: JobType,
  })
  @IsEnum(JobType)
  @IsNotEmpty()
  jobType: JobType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  instructions?: string;
}
