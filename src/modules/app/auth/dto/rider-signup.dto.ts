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
  location: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userAddress: string;

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
  @IsNumber()
  @IsNotEmpty()
  logo: number;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  workspaceImages: number[];

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  businessLicense: number[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  description: string;

  @ApiProperty()
  @IsNumber()
  cityId: string;
}
