import { IsNotEmpty, IsNumber } from 'class-validator';

export class VerifyEmailDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
