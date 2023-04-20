import { ServiceType } from '@prisma/client';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ServiceCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceType: ServiceType;
}
