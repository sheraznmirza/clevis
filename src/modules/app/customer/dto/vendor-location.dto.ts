import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Days } from '@prisma/client';

class ServiceNames {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  serviceId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  serviceName: string;
}
export class VendorLocationDto {
  @ApiProperty({
    isArray: true,
    type: ServiceNames,
  })
  @IsArray()
  @Type(() => ServiceNames)
  @IsOptional()
  services: ServiceNames[];

  // @ApiProperty({
  //   required: false,
  //   description: 'Enum for the day of the week',
  //   enum: Days,
  // })
  // @IsNotEmpty()
  // @IsEnum(Days)
  // currentDay: Days;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  currentDay: Date;
}
