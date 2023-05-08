import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDataDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;
}
