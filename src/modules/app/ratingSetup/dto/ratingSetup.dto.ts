import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RatingSetupDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  carWashRating: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  laundryRating: number;
}
