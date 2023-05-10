import { Param, Controller, Get, Query } from '@nestjs/common';
import { AddressService } from './address.service';
import { ApiTags } from '@nestjs/swagger';
import { ListingParams } from 'src/core/dto';

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
}
