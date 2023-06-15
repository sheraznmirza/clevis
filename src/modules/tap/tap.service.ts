import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import {
  createAuthorizedRequestInterface,
  createBusinessRequestInterface,
  createBusinessRequestResponseInterface,
  createChargeRequestInterface,
  createCustomerRequestInterface,
  createCustomerResponse,
  createMerchantRequestInterface,
  createMerchantRequestResponse,
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

  async tapAuthorize(dto) {
    try {
      console.log('dto: ', dto);
    } catch (error) {
      throw error;
    }
  }

  async tapCharge(dto) {
    try {
      console.log('dto: ', dto);
    } catch (error) {
      throw error;
    }
  }

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

  async retrieveAuthorize(authorizeId: string) {
    const result = await this.tapGetPaymentApi(
      'authorize/'.concat(authorizeId),
    );
    return result;
  }

  async createBusniess(
    business: createBusinessRequestInterface,
  ): Promise<createBusinessRequestResponseInterface> {
    const result = await this.tapPaymentApi(business, 'business', true);
    return result;
  }

  async createMerchant(
    merchant: createMerchantRequestInterface,
  ): Promise<createMerchantRequestResponse> {
    const result = await this.tapPaymentApi(merchant, 'merchant');
    return result;
  }

  async createCharge(charge: createChargeRequestInterface) {
    const result = await this.tapPaymentApi(charge, 'charges');
    return result;
  }

  tapPaymentApi(payload: any, url: string, isMarket = false): Promise<any> {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  tapGetPaymentApi(url: string, isMarket = false): Promise<any> {
    try {
      return this.httpService
        .get(
          AppConfig.TAP.BASE_URL.concat(url),
          isMarket
            ? AppConfig.TAP.AUTH_TOKEN_MARKETPLACE
            : AppConfig.TAP.AUTH_TOKEN,
        )
        .pipe(map((response: AxiosResponse<any>) => response.data))
        .toPromise();
    } catch (error) {
      throw error;
    }
  }
}
