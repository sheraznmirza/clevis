// import { ApiProperty } from "@nestjs/swagger";
import { MediaType } from '@prisma/client';
import { IsNotEmpty, IsEnum, IsString, IsNumber } from 'class-validator';

export class CreateMediaDto {
  // @ApiProperty()
  @IsNotEmpty()
  @IsEnum(MediaType)
  type: MediaType;

  // @ApiProperty()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsNotEmpty()
  originalName: string;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  encoding: string;

  @IsNumber()
  @IsNotEmpty()
  size: number;
}
