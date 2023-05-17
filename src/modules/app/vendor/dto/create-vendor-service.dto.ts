import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Media } from '@prisma/client';

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

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  vendorServiceId?: number;
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
  @Type(() => AllocatePrice)
  @IsNotEmpty()
  allocatePrice: AllocatePrice[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  serviceImages: Media[];
}
