import { ServiceType } from '@prisma/client';
import { IsString, IsNotEmpty } from 'class-validator';

export class CategoryUpdateDto {
  @IsString()
  @IsNotEmpty()
  categoryName?: string;

  @IsString()
  @IsNotEmpty()
  serviceType?: ServiceType;
}
