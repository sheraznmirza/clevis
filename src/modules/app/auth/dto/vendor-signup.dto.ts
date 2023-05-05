import { ServiceType } from '@prisma/client';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsNumber,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Media } from 'src/core/globalTypes';

export class VendorSignUpDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceType: ServiceType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  companyName: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  companyEmail: string;

  @ApiProperty()
  @IsNotEmpty()
  logo: Media;

  @ApiProperty()
  @IsNotEmpty()
  profilePicture: Media;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  workspaceImages: Media[];

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  businessLicense: Media[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  description: string;

  @ApiProperty()
  @IsNumber()
  cityId: number;

  @ApiProperty()
  @IsNumber()
  latitude: number;

  @ApiProperty()
  @IsNumber()
  longitude: number;
}
