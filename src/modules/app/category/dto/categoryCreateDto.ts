import { ServiceType } from '@prisma/client';
import { IsString, IsNotEmpty } from 'class-validator';

export class CategoryCreateDto {
  @IsString()
  @IsNotEmpty()
  categoryName: string;

  @IsString()
  @IsNotEmpty()
  serviceType: ServiceType;
}
