import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Days, Media } from '@prisma/client';
import { Type } from 'class-transformer';

class MediaFormat {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location: string;
}

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

  @ApiProperty({
    type: MediaFormat,
    required: false,
  })
  @IsOptional()
  @Type(() => MediaFormat)
  profilePicture: MediaFormat;

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

  @ApiProperty({
    isArray: true,
    type: MediaFormat,
    required: false,
  })
  @IsArray()
  @IsOptional()
  @Type(() => MediaFormat)
  workspaceImages: MediaFormat[];

  @ApiProperty({
    isArray: true,
    type: MediaFormat,
    required: false,
  })
  @IsArray()
  @IsOptional()
  @Type(() => MediaFormat)
  businessLicense: MediaFormat[];

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

export class VendorSchedule {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    required: true,
    description: 'Day of the week',
    enum: Days,
  })
  @IsNotEmpty()
  @IsEnum(Days)
  day: Days;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  endTime: string;
}

export class UpdateVendorScheduleDto {
  @ApiProperty({
    isArray: true,
    type: VendorSchedule,
  })
  @IsArray()
  @IsOptional()
  @Type(() => VendorSchedule)
  companySchedule: VendorSchedule[];

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  alwaysOpen?: boolean;
}
