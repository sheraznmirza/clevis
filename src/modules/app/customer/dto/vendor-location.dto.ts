import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ServiceNames {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  serviceId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  serviceName: string;
}
export class VendorLocationDto {
  @ApiProperty({
    isArray: true,
    type: ServiceNames,
  })
  @IsArray()
  @Type(() => ServiceNames)
  @IsOptional()
  services: ServiceNames[];
}
