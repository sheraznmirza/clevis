import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import {
  createAuthorizedRequestInterface,
  createBusinessRequestInterface,
  createCustomerRequestInterface,
  createMerchantRequestInterface,
  createNewCardResponseInterface,
  createNewCardTokenInterface,
  createTokenForSavedCardInterface,
} from './dto/card.dto';
import { Observable, map } from 'rxjs';
import AppConfig from 'src/configs/app.config';

@Injectable()
export class TapService {
  constructor(private httpService: HttpService) {}

  async getFreshTokenForCardSave(card: createNewCardTokenInterface) {
    const result = this.httpService
      .post(
        AppConfig.TAP.BASE_URL.concat('tokens'),
        card,
        AppConfig.TAP.AUTH_TOKEN,
      )
      .pipe(map((response) => response.data));
    return result;
  }

  async getTokenForSavedCard(card: createTokenForSavedCardInterface) {
    const result = this.httpService
      .post(
        AppConfig.TAP.BASE_URL.concat('tokens'),
        card,
        AppConfig.TAP.AUTH_TOKEN,
      )
      .pipe(map((response) => response.data));
    return result;
  }

  async createCustomer(card: createCustomerRequestInterface) {
    const result = this.httpService
      .post(
        AppConfig.TAP.BASE_URL.concat('customers'),
        card,
        AppConfig.TAP.AUTH_TOKEN,
      )
      .pipe(map((response) => response.data));
    return result;
  }
  ///////////////

  async createAuthorizeForCustomer(card: createAuthorizedRequestInterface) {
    const result = this.httpService
      .post(
        AppConfig.TAP.BASE_URL.concat('authorize'),
        card,
        AppConfig.TAP.AUTH_TOKEN,
      )
      .pipe(map((response) => response.data));
    return result;
  }

  async createAuthorizeForBusniess(card: createBusinessRequestInterface) {
    const result = this.httpService
      .post(
        AppConfig.TAP.BASE_URL.concat('busniess'),
        card,
        AppConfig.TAP.AUTH_TOKEN,
      )
      .pipe(map((response) => response.data));
    return result;
  }

  async createAuthorizeForMerchant(card: createMerchantRequestInterface) {
    const result = this.httpService
      .post(
        AppConfig.TAP.BASE_URL.concat('merchant'),
        card,
        AppConfig.TAP.AUTH_TOKEN,
      )
      .pipe(map((response) => response.data));
    return result;
  }
}
