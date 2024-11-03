import { ServiceType } from '@prisma/client';
import { IsString, IsNotEmpty } from 'class-validator';

export class SubcategoryUpdateDto {
  @IsString()
  @IsNotEmpty()
  subCategoryName?: string;

  @IsString()
  @IsNotEmpty()
  serviceType?: ServiceType;
}
