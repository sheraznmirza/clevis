import { Param, Controller, Get } from '@nestjs/common';
import { AddressService } from './address.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Address')
@Controller('address')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Get('/countries')
  getAllCountries() {
    return this.addressService.getCountries();
  }

  @Get('/states/:countryId')
  getStatesByCountry(@Param('countryId') id: string) {
    return this.addressService.getStates(id);
  }

  @Get('/cities/:stateId')
  getCitiesByState(@Param('stateId') id: string) {
    return this.addressService.getCities(id);
  }
}
