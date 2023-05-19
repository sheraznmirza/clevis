import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlatFormSetupDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  fee: number;
}
