import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Media } from '@prisma/client';
import { MediaFormat } from 'src/core/globalTypes';

// type AllocatePrice = {
//   price: number;
//   subcategoryId?: number;
//   categoryId: number;
//   vendorServiceId?: number;
// };

class AllocatePrice {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  subcategoryId?: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}

export class VendorCreateServiceDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  serviceId: number;

  @ApiProperty({
    isArray: true,
    type: AllocatePrice,
  })
  @IsArray()
  @ValidateNested()
  @Type(() => AllocatePrice)
  @IsNotEmpty()
  allocatePrice: AllocatePrice[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    type: MediaFormat,
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MediaFormat)
  serviceImages: MediaFormat[];
}

export class VendorUpdateServiceDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  serviceId: number;

  @ApiProperty({
    isArray: true,
    type: AllocatePrice,
  })
  @IsArray()
  @ValidateNested()
  @Type(() => AllocatePrice)
  @IsOptional()
  allocatePrice: AllocatePrice[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    type: MediaFormat,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaFormat)
  serviceImages: MediaFormat[];
}
