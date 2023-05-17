import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Days, ServiceType } from '@prisma/client';
import { ListingParams } from 'src/core/dto';

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
export class VendorLocationDto extends ListingParams {
  @ApiProperty({
    required: false,
    description: 'The longitude',
  })
  @IsString()
  @IsOptional()
  longitude: number;

  @ApiProperty({
    required: false,
    description: 'The latitude',
  })
  @IsString()
  @IsOptional()
  latitude: number;

  @ApiProperty({
    required: false,
    description: 'The distance radius',
  })
  @IsString()
  @IsOptional()
  distance: number;

  @ApiProperty({
    required: false,
    description: 'Select the respective service type.',
    enum: ServiceType,
  })
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType: ServiceType;

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
  @IsOptional()
  @IsString()
  currentDay: string;
}
