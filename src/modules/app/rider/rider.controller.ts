import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserType } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { RolesGuard } from '../../../core/guards';
import { Authorized } from '../../../core/decorators';
import { ApiTags } from '@nestjs/swagger';
import { VendorCreateServiceDto, VendorUpdateStatusDto } from './dto';
import { VendorListingParams } from 'src/core/dto';
import { RiderService } from './rider.service';

@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Rider')
@Controller('rider')
export class RiderController {
  constructor(private riderService: RiderService) {}
  @Authorized(UserType.VENDOR)
  @Get('me')
  getMe(@GetUser() user) {
    console.log('user: ', user);
    return user;
  }

  @Authorized(UserType.VENDOR)
  @Post('/service')
  createVendorService(@Body() dto: VendorCreateServiceDto, @Req() req) {
    console.log('req: ', req.user?.userMasterId);
    console.log('dto: ', dto);
    return this.riderService.createVendorService(dto, req.user?.userMasterId);
  }

  @Authorized(UserType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch('/approve/:riderId')
  approveVendor(
    @Param('riderId') riderId: number,
    @Body() dto: VendorUpdateStatusDto,
  ) {
    return this.riderService.approveVendor(riderId, dto);
  }

  @Authorized([UserType.ADMIN])
  @Get()
  getVendors(@Query() listingParams: VendorListingParams) {
    return this.riderService.getAllVendors(listingParams);
  }
}
