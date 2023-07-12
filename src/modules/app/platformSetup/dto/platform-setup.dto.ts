import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlatFormSetupDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Max(10000)
  @Min(1)
  fee: number;
}
