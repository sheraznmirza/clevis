import {
  IsNotEmpty,
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class ResetPasswordDataDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @IsNumber()
  @Min(10000000)
  @Max(99999999)
  otp: number;
}
