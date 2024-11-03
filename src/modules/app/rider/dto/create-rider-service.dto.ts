import { IsString, IsNotEmpty, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

type AllocatePrice = {
  price: number;
  subcategoryId?: number;
  categoryId: number;
  vendorServiceId?: number;
};

export class RiderCreateServiceDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  serviceId: number;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  allocatePrice: AllocatePrice[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  serviceImages: number[];
}
