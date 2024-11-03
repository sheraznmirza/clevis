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
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Days } from '@prisma/client';
import { MediaFormat } from 'src/core/globalTypes';

export class RiderUpdateDto {
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
  @IsEmail()
  @IsOptional()
  companyEmail: string;

  @ApiProperty({
    required: false,
    type: MediaFormat,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaFormat)
  logo: MediaFormat;

  @ApiProperty({
    required: false,
    isArray: true,
    type: MediaFormat,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaFormat)
  workspaceImages: MediaFormat[];

  @ApiProperty({
    required: false,
    isArray: true,
    type: MediaFormat,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaFormat)
  businessLicense: MediaFormat[];

  @ApiProperty({
    required: false,
    type: MediaFormat,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaFormat)
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
  @Min(1)
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
  @ValidateNested()
  @Type(() => RiderSchedule)
  companySchedule: RiderSchedule[];

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  alwaysOpen?: boolean;
}
