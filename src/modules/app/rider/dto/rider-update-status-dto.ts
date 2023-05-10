import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class RiderUpdateStatusDto {
  @ApiProperty({
    required: true,
    description: 'Enum for status of the rider',
    enum: Status,
  })
  @IsNotEmpty()
  @IsEnum(Status)
  status?: Status;
}
