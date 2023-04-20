import { ServiceType } from '@prisma/client';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceType: ServiceType;
}
