import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { ListingParams } from 'src/core/dto';

export enum AllEarning {
  Receive = 'Receive',
  Disperse = 'Disperse',
}
export class EarningDto extends ListingParams {
  @ApiProperty({
    required: true,

    enum: AllEarning,
  })
  @IsNotEmpty()
  @IsEnum(AllEarning)
  status: AllEarning;
}
export class EarningDtos {
  @ApiProperty({
    required: true,

    enum: AllEarning,
  })
  @IsNotEmpty()
  @IsEnum(AllEarning)
  status: AllEarning;
}
