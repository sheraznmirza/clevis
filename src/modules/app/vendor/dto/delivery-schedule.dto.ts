import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max } from 'class-validator';

export class CreateAndUpdateDeliverySchedule {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  deliveryDurationMin: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  deliveryDurationMax: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  serviceDurationMin: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  serviceDurationMax: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  deliveryItemMin: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  deliveryItemMax: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Max(100)
  kilometerFare: number;
}
