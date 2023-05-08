import { UserType } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
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
  @IsNumber()
  @Min(1000)
  @Max(9999)
  otp: number;
}
