import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
  IsEnum,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Media, VendorServiceStatus } from '@prisma/client';
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
  @Max(100000)
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

class UpdateAllocatePrice {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  allocatePriceId: number;

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
    isArray: true,
    required: true,
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
    type: UpdateAllocatePrice,
  })
  @IsArray()
  @ValidateNested()
  @Type(() => AllocatePrice)
  @IsOptional()
  allocatePrice: UpdateAllocatePrice[];

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

  @ApiProperty({
    required: false,
    description: 'vendor status',
    enum: VendorServiceStatus,
  })
  @IsOptional()
  @IsEnum(VendorServiceStatus)
  status: VendorServiceStatus;
}
