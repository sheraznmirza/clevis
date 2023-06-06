import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class addressCreateDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullAddress?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  cityId?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  latitude?: number;
}
