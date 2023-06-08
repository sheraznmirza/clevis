import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import {
  createAuthorizedRequestInterface,
  createBusinessRequestInterface,
  createChargeRequestInterface,
  createCustomerRequestInterface,
  createCustomerResponse,
  createMerchantRequestInterface,
  createNewCardResponse,
  createNewCardTokenInterface,
  createTokenForSavedCardInterface,
  createTokenForSavedCardResponse,
} from './dto/card.dto';
import { map } from 'rxjs';
import AppConfig from 'src/configs/app.config';
import { AxiosResponse } from 'axios';

@Injectable()
export class TapService {
  constructor(private httpService: HttpService) {}

  async getFreshTokenForCardSave(
    card: createNewCardTokenInterface,
  ): Promise<createNewCardResponse> {
    const result = await this.tapPaymentApi(card, 'tokens');
    return result;
  }

  async getTokenForSavedCard(
    card: createTokenForSavedCardInterface,
  ): Promise<createTokenForSavedCardResponse> {
    const result = await this.tapPaymentApi(card, 'tokens');
    return result;
  }

  async createCustomer(
    customer: createCustomerRequestInterface,
  ): Promise<createCustomerResponse> {
    const result = await this.tapPaymentApi(customer, 'customers');
    return result;
  }

  async createAuthorize(authorize: createAuthorizedRequestInterface) {
    const result = await this.tapPaymentApi(authorize, 'authorize');
    return result;
  }

  async createBusniess(business: createBusinessRequestInterface) {
    const result = await this.tapPaymentApi(business, 'busniess', true);
    return result;
  }

  async createMerchant(merchant: createMerchantRequestInterface) {
    const result = await this.tapPaymentApi(merchant, 'merchant');
    return result;
  }

  async createCharge(charge: createChargeRequestInterface) {
    const result = await this.tapPaymentApi(charge, 'charges');
    return result;
  }

  tapPaymentApi(payload: any, url: string, isMarket = false): Promise<any> {
    return this.httpService
      .post(
        AppConfig.TAP.BASE_URL.concat(url),
        payload,
        isMarket
          ? AppConfig.TAP.AUTH_TOKEN_MARKETPLACE
          : AppConfig.TAP.AUTH_TOKEN,
      )
      .pipe(map((response: AxiosResponse<any>) => response.data))
      .toPromise();
  }
}
