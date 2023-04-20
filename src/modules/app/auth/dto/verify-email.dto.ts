import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: string;
}
