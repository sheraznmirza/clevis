import { ServiceType } from '@prisma/client';
import { IsString, IsNotEmpty, IsArray } from 'class-validator';

type SubCategoryType = {
  subCategoryName: string;
};

export class ServiceCreateDto {
  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @IsString()
  @IsNotEmpty()
  serviceType: ServiceType;

  @IsString()
  @IsNotEmpty()
  categoryName: string;

  @IsArray()
  @IsNotEmpty()
  subCategory?: SubCategoryType[];
}
