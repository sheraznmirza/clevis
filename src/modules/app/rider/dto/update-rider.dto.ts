import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  IsNumber,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Media } from '../../../../core/globalTypes';

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
  logo: Media;

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
  cityId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  latitude: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  longitude: number;
}
