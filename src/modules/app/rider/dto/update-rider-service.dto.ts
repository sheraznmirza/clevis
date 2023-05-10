import { PartialType } from '@nestjs/mapped-types';
import { RiderCreateServiceDto } from './create-rider-service.dto';

export class RiderUpdateServiceDto extends PartialType(RiderCreateServiceDto) {}
