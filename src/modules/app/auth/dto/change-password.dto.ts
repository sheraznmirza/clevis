import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  newPassword: string;
}
