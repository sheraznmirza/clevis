import { UserType } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
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
  @IsEnum(UserType)
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
