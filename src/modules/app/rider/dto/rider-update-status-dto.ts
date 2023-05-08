import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class VendorUpdateStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: Status;
}
