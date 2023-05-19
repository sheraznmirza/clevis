import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsNumber,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MediaFormat } from 'src/core/globalTypes';

export class RiderSignUpDto {
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
  companyName: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  companyEmail: string;

  @ApiProperty()
  @IsNotEmpty()
  logo: MediaFormat;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  workspaceImages: MediaFormat[];

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  businessLicense: MediaFormat[];

  @ApiProperty()
  @IsString()
  @IsOptional()
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
