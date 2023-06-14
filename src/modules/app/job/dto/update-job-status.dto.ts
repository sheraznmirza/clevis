import { ApiProperty } from '@nestjs/swagger';
import { RiderJobStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateJobStatusDto {
  @ApiProperty({
    required: true,
    enum: RiderJobStatus,
  })
  @IsEnum(RiderJobStatus)
  @IsNotEmpty()
  RiderJobStatus: RiderJobStatus;
}
