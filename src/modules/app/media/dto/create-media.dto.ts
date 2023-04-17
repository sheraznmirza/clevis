// import { ApiProperty } from "@nestjs/swagger";
import { MediaType } from '@prisma/client';
import { IsNotEmpty, MaxLength, IsEnum } from 'class-validator';

export class CreateMediaDto {
  // @ApiProperty()
  @IsNotEmpty()
  @IsEnum(MediaType)
  type: MediaType;

  // @ApiProperty()
  @IsNotEmpty()
  path: string;
}
