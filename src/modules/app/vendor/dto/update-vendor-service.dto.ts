import { PartialType } from '@nestjs/mapped-types';
import { VendorCreateServiceDto } from './create-vendor-service.dto';

export class VendorUpdateServiceDto extends PartialType(
  VendorCreateServiceDto,
) {}
