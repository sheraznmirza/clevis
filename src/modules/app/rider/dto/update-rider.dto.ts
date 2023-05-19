import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Days } from '@prisma/client';
import { MediaFormat } from 'src/core/globalTypes';

export class RiderUpdateDto {
  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(50)
  password: string;

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
  @IsString()
  @IsOptional()
  companyName: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  companyEmail: string;

  @ApiProperty()
  @IsOptional()
  logo: MediaFormat;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  workspaceImages: MediaFormat[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  businessLicense: MediaFormat[];

  @ApiProperty({})
  @IsOptional()
  profilePicture: MediaFormat;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  accountTitle: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  accountNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  bankName: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  cityId: number;

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
  @IsNumber()
  @IsOptional()
  bankingId: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}

export class RiderSchedule {
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

export class UpdateRiderScheduleDto {
  @ApiProperty({
    isArray: true,
    type: RiderSchedule,
  })
  @IsArray()
  @IsOptional()
  @Type(() => RiderSchedule)
  companySchedule: RiderSchedule[];

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  alwaysOpen?: boolean;
}
