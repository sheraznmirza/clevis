import { ServiceType } from '@prisma/client';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubcategoryCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subCategoryName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceType: ServiceType;
}
