import { PartialType } from '@nestjs/mapped-types';
import { VendorCreateServiceDto } from './create-rider-service.dto';

export class VendorUpdateServiceDto extends PartialType(
  VendorCreateServiceDto,
) {}
