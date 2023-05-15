import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Media } from '@prisma/client';

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
  cityId: number;

  @ApiProperty({})
  @IsOptional()
  profilePicture: Media;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  latitude: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  longitude: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  userAddressId: number;
}
