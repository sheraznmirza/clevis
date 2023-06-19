import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  vendorId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  bookingMasterId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  body?: string;
}
