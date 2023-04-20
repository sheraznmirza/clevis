import { ServiceType } from '@prisma/client';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class PaginationQueryDto {
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @IsNotEmpty()
  take: number;

  @IsString()
  search?: string;
}
