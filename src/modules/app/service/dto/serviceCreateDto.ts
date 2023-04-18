import { ServiceType } from '@prisma/client';
import { IsString, IsNotEmpty } from 'class-validator';

export class ServiceCreateDto {
  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @IsString()
  @IsNotEmpty()
  serviceType: ServiceType;
}
