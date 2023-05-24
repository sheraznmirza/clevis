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
import { ListingParams } from 'src/core/dto';
import { Authorized } from 'src/core/decorators';
import { UserType } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { addressUpdateDto } from './dto/addressUpdateDto';
import { addressCreateDto } from './dto/addressCreateDto';
import { JwtGuard } from '../auth/guard';
import { RolesGuard } from 'src/core/guards';

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
  createAddress(@GetUser() user, @Body() data: addressCreateDto) {
    return this.addressService.createAddress(data, user);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Authorized(UserType.CUSTOMER)
  @Patch('/:addressId')
  updateAddressByCustomer(
    @GetUser() user,
    @Param('addressId') id: number,
    @Body() data: addressUpdateDto,
  ) {
    console.log('User: 123: ', user);
    return this.addressService.updateAddressByCustomer(data, id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Authorized([
    UserType.ADMIN,
    UserType.CUSTOMER,
    UserType.VENDOR,
    UserType.RIDER,
  ])
  @Delete('/:addressId')
  deleteAddress(@GetUser() user, @Param('addressId') id: number) {
    return this.addressService.deleteaddress(id, user);
  }
}
