import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class RiderUpdateStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: Status;
}
