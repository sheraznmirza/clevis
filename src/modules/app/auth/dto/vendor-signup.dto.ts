import { ServiceType } from '@prisma/client';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MediaFormat } from 'src/core/globalTypes';
import { Type } from 'class-transformer';

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

  @ApiProperty({
    required: true,
    type: MediaFormat,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MediaFormat)
  logo: MediaFormat;

  @ApiProperty({
    required: true,
    isArray: true,
    type: MediaFormat,
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MediaFormat)
  workspaceImages: MediaFormat[];

  @ApiProperty({
    required: true,
    isArray: true,
    type: MediaFormat,
  })
  @ValidateNested()
  @Type(() => MediaFormat)
  @IsArray()
  @IsNotEmpty()
  businessLicense: MediaFormat[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  cityId: number;

  @ApiProperty()
  @IsNumber()
  latitude: number;

  @ApiProperty()
  @IsNumber()
  longitude: number;
}
