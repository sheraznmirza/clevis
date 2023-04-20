import { ServiceType } from '@prisma/client';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryUpdateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryName?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceType?: ServiceType;
}
