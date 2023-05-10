import {
  Body,
  Controller,
  Get,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserType } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { RolesGuard } from '../../../core/guards';
import { Authorized } from '../../../core/decorators';
import { ApiTags } from '@nestjs/swagger';
import { RiderUpdateStatusDto } from './dto';
import { VendorListingParams, VendorRiderByIdParams } from 'src/core/dto';
import { RiderService } from './rider.service';

@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Rider')
@Controller('rider')
export class RiderController {
  constructor(private riderService: RiderService) {}
  @Authorized(UserType.RIDER)
  @Get('me')
  getMe(@GetUser() user, @Query() query: VendorRiderByIdParams) {
    return this.riderService.getRiderById(user.userMasterId, query);
  }

  @Authorized(UserType.ADMIN)
  @Get('/:userMasterId')
  getRiderById(@Param('userMasterId') riderId: number) {
    return this.riderService.getRiderById(riderId);
  }

  @Authorized(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch('/approve/:riderId')
  approveVendor(
    @Param('riderId') riderId: number,
    @Query() dto: RiderUpdateStatusDto,
  ) {
    return this.riderService.approveRider(riderId, dto);
  }

  // updateRider(@Param('riderId') riderId: number,
  // @Body() dto: RiderUpdateServiceDto) {

  // }

  @Authorized(UserType.ADMIN)
  @Get()
  getRiders(@Query() listingParams: VendorListingParams) {
    return this.riderService.getAllRiders(listingParams);
  }

  @Authorized(UserType.ADMIN)
  @Delete('/:userMasterId')
  deleteRider(@Param('userMasterId') riderId: number) {
    return this.riderService.deleteRider(riderId);
  }
}
