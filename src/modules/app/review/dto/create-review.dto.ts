import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.5)
  @Max(5)
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
