import { ServiceType } from '@prisma/client';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsNumber,
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

  @IsString()
  @IsNotEmpty()
  companyEmail: string;

  @IsString()
  @IsNotEmpty()
  logo: string;

  @IsString()
  @IsNotEmpty()
  workspaceImages: string[];

  @IsString()
  @IsNotEmpty()
  businessLicense: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  description: string;

  @IsNumber()
  cityId: number;
}
