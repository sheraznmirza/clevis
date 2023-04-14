import { ServiceType } from '@prisma/client';
import { IsString, IsNotEmpty, IsArray, IsNumber } from 'class-validator';

type SubCategoryType = {
  subCategoryId: number;
  subCategoryName: string;
};

type CategoryType = {
  categoryName: string;
  categoryId: number;
  subCategories?: SubCategoryType[];
};

export class ServiceUpdateDto {
  @IsNumber()
  @IsNotEmpty()
  serviceId: number;

  @IsString()
  @IsNotEmpty()
  serviceName?: string;

  @IsString()
  @IsNotEmpty()
  serviceType?: ServiceType;

  @IsString()
  @IsNotEmpty()
  categoryName?: string;

  @IsArray()
  @IsNotEmpty()
  subCategory?: SubCategoryType[];
}
