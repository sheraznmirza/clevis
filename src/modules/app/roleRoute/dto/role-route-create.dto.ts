import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RoleRouteCreateDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  routeId: number;
}
