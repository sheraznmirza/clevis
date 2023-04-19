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

export class RiderSignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  userAddress: string;

  @IsString()
  @IsNotEmpty()
  serviceType: ServiceType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  companyName: string;

  @IsEmail()
  @IsNotEmpty()
  companyEmail: string;

  @IsNumber()
  @IsNotEmpty()
  logo: number;

  @IsArray()
  @IsNotEmpty()
  workspaceImages: number[];

  @IsArray()
  @IsNotEmpty()
  businessLicense: number[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  description: string;

  @IsNumber()
  cityId: number;
}
