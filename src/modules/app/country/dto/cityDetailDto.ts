import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetCityStateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cityName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  countryName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  stateName: string;
}
