import { UserType } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userType: UserType;
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsString()
  @MaxLength(4)
  @MinLength(4)
  otp: string;
}
