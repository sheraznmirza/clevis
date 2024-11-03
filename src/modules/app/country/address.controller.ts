import {
  Param,
  Controller,
  Get,
  Query,
  Body,
  Patch,
  Post,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { ApiTags } from '@nestjs/swagger';
import { GetUserType, ListingParams } from 'src/core/dto';
import { Authorized } from 'src/core/decorators';
import { UserType } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { addressUpdateDto } from './dto/addressUpdateDto';
import { addressCreateDto } from './dto/addressCreateDto';
import { JwtGuard } from '../auth/guard';
import { RolesGuard } from 'src/core/guards';
import { GetCityStateDto } from './dto/cityDetailDto';
import { userInfo } from 'os';

@ApiTags('Address')
@Controller('address')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Get('/countries')
  getAllCountries(@Query() listingParams: ListingParams) {
    return this.addressService.getCountries(listingParams);
  }

  @Get('/states/:countryId')
  getStatesByCountry(
    @Param('countryId') id: string,
    @Query() listingParams: ListingParams,
  ) {
    return this.addressService.getStates(id, listingParams);
  }

  @Get('/city/byName')
  getCityDetails(@Query() dto: GetCityStateDto) {
    return this.addressService.getCityDetails(dto);
  }

  @Get('/cities/:stateId')
  getCitiesByState(
    @Param('stateId') id: string,
    @Query() listingParams: ListingParams,
  ) {
    return this.addressService.getCities(id, listingParams);
  }

  // @Get('/city/byName/:cityName')
  // getCityDetails(@Param('cityName') cityName: string) {
  //   return this.addressService.getCityDetails(cityName);
  // }

  @Get('/customer/:customerId')
  getAddressByCustomer(@Param('customerId') id: number) {
    return this.addressService.getAddressByCustomer(id);
  }

  @Get('/vendor/:vendorId')
  getAddressByVendor(@Param('vendorId') id: number) {
    return this.addressService.getAddressByVendor(id);
  }

  @Get('/rider/:riderId')
  getAddressByRider(@Param('riderId') id: number) {
    return this.addressService.getAddressByRider(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Authorized([
    UserType.ADMIN,
    UserType.CUSTOMER,
    UserType.VENDOR,
    UserType.RIDER,
  ])
  @Post('userAddress')
  createAddress(@GetUser() user: GetUserType, @Body() data: addressCreateDto) {
    return this.addressService.createAddress(data, user);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Authorized([
    UserType.ADMIN,
    UserType.CUSTOMER,
    UserType.VENDOR,
    UserType.RIDER,
  ])
  @Patch('/:addressId')
  updateAddressByCustomer(
    @GetUser() user: GetUserType,
    @Param('addressId') id: number,
    @Body() data: addressUpdateDto,
  ) {
    return this.addressService.updateAddressByCustomer(
      data,
      id,
      user.userMasterId,
    );
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Authorized(UserType.CUSTOMER)
  @Patch('activeAddress/:addressId')
  updateIsActive(@GetUser() user: GetUserType, @Param('addressId') id: number) {
    return this.addressService.updateIsActive(user, id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Authorized([
    UserType.ADMIN,
    UserType.CUSTOMER,
    UserType.VENDOR,
    UserType.RIDER,
  ])
  @Delete('/:addressId')
  deleteAddress(@GetUser() user: GetUserType, @Param('addressId') id: number) {
    return this.addressService.deleteaddress(id, user);
  }
}
