import { ServiceType } from '@prisma/client';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryUpdateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryName?: string;

  @ApiProperty()
  @IsString()
  @IsEnum(ServiceType)
  @IsNotEmpty()
  serviceType?: ServiceType;
}
