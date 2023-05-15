import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class addressUpdateDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  userAddressId?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fullAddress?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  latitude?: number;
}
