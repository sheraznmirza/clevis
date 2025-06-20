import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class VendorUpdateStatusDto {
  @ApiProperty({
    required: true,
    description: 'Enum for status of the vendor',
    enum: Status,
  })
  @IsNotEmpty()
  @IsEnum(Status)
  status?: Status;
}

export class VendorUpdateBusyStatusDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isBusy: boolean;
}
