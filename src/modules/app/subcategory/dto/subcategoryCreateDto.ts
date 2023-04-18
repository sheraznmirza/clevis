import { ServiceType } from '@prisma/client';
import { IsString, IsNotEmpty } from 'class-validator';

export class SubcategoryCreateDto {
  @IsString()
  @IsNotEmpty()
  subCategoryName: string;

  @IsString()
  @IsNotEmpty()
  serviceType: ServiceType;
}
