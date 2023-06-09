import {
  Body,
  Controller,
  Get,
  Post,
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
import {
  RiderUpdateDto,
  RiderUpdateStatusDto,
  UpdateRequestDto,
  UpdateRiderScheduleDto,
} from './dto';
import {
  GetUserType,
  RiderListingParams,
  VendorRiderByIdParams,
} from 'src/core/dto';
import { RiderService } from './rider.service';

@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Rider')
@Controller('rider')
export class RiderController {
  constructor(private riderService: RiderService) {}
  @Authorized(UserType.RIDER)
  @Get('me')
  getMe(@GetUser() user: GetUserType, @Query() query: VendorRiderByIdParams) {
    return this.riderService.getRiderById(user.userMasterId, query);
  }

  @Authorized(UserType.ADMIN)
  @Get('/:userMasterId')
  getRiderById(@Param('userMasterId') riderId: number) {
    return this.riderService.getRiderById(riderId);
  }

  @Authorized(UserType.VENDOR)
  @Post('/request-update')
  requestUpdate(@Body() dto: UpdateRequestDto, @GetUser() user: GetUserType) {
    return this.riderService.requestUpdate(dto, user.userTypeId);
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

  @Authorized(UserType.RIDER)
  @HttpCode(HttpStatus.OK)
  @Patch('/me')
  updateMe(@GetUser() user: GetUserType, @Body() dto: RiderUpdateDto) {
    return this.riderService.updateRider(user.userMasterId, dto);
  }

  @Authorized(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch('/byId/:userMasterId')
  updateRider(
    @Param('userMasterId') userMasterId: number,
    @Body() dto: RiderUpdateDto,
  ) {
    return this.riderService.updateRider(userMasterId, dto);
  }

  @Authorized(UserType.RIDER)
  @HttpCode(HttpStatus.OK)
  @Patch('/schedule')
  updateRiderSchedule(
    @GetUser() user: GetUserType,
    @Body() dto: UpdateRiderScheduleDto,
  ) {
    return this.riderService.updateRiderSchedule(user.userTypeId, dto);
  }

  @Authorized(UserType.ADMIN)
  @Get()
  getRiders(@Query() listingParams: RiderListingParams) {
    return this.riderService.getAllRiders(listingParams);
  }

  @Authorized(UserType.ADMIN)
  @Delete('/:userMasterId')
  deleteRider(@Param('userMasterId') riderId: number) {
    return this.riderService.deleteRider(riderId);
  }
}
