import { IsNotEmpty, IsEmail } from 'class-validator';

export class ResetPasswordDataDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
