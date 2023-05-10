import { IsString, IsNotEmpty, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Media } from '@prisma/client';

type allocatePrice = {
  price: number;
  subcategoryId?: number;
  categoryId: number;
  vendorServiceId?: number;
};

export class VendorCreateServiceDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  serviceId: number;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  allocatePrice: allocatePrice[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  serviceImages: Media[];
}
