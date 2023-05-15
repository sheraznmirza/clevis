import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Media } from '@prisma/client';

export class UpdateVendorDto {
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

  @ApiProperty()
  @IsArray()
  @IsOptional()
  workspaceImages: Media[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  businessLicense: Media[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  bankingId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  bankName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  accountTitle: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  accountNumber: string;

  @ApiProperty()
  @IsOptional()
  logo: Media;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  companyName: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  companyEmail: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
