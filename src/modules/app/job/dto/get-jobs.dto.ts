import { ApiProperty } from '@nestjs/swagger';
import { JobType } from '@prisma/client';
import { ListingParams } from 'src/core/dto';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class GetRiderJobsDto extends ListingParams {
  @ApiProperty({
    required: true,
    enum: JobType,
  })
  @IsEnum(JobType)
  @IsNotEmpty()
  jobType: JobType;
}
