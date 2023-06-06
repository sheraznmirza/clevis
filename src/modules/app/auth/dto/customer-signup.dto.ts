import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsNumber,
  Min,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceType } from '@prisma/client';

export class CustomerSignUpDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  cityId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  playerId: string;

  @ApiProperty({
    required: true,
    description: 'Pick your respective device type',
    enum: DeviceType,
  })
  @IsOptional()
  @IsEnum(DeviceType)
  deviceType: DeviceType;
}
