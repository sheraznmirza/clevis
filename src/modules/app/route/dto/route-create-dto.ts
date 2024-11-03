import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RouteCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  routeName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  linkTo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  selectedOptionKey: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  icon: string;
}
