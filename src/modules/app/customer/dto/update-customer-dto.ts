import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MediaFormat } from 'src/core/globalTypes';
import { Type } from 'class-transformer';

export class UpdateCustomerDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fullName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fullAddress: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Min(1)
  cityId: number;

  @ApiProperty({
    required: true,
    type: MediaFormat,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaFormat)
  profilePicture: MediaFormat;

  // @ApiProperty()
  // @IsNumber()
  // @IsOptional()
  // latitude: number;

  // @ApiProperty()
  // @IsNumber()
  // @IsOptional()
  // longitude: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  userAddressId: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
