import { ServiceType } from '@prisma/client';
import { IsString, IsNotEmpty, IsArray } from 'class-validator';

type SubCategoryType = {
  subCategoryName: string;
};

type CategoryType = {
  categoryName: string;
  subCategories?: SubCategoryType[];
};

export class ServiceCreateDto {
  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @IsString()
  @IsNotEmpty()
  serviceType: ServiceType;

  @IsArray()
  @IsNotEmpty()
  category: CategoryType[];
}
