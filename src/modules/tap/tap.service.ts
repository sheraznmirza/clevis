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
    card: createCustomerRequestInterface,
  ): Promise<createCustomerResponse> {
    const result = await this.tapPaymentApi(card, 'customers');
    return result;
  }

  async createAuthorize(card: createAuthorizedRequestInterface) {
    const result = await this.tapPaymentApi(card, 'authorize');
    return result;
  }

  async createBusniess(card: createBusinessRequestInterface) {
    const result = await this.tapPaymentApi(card, 'busniess', true);
    return result;
  }

  async createMerchant(card: createMerchantRequestInterface) {
    const result = await this.tapPaymentApi(card, 'merchant');
    return result;
  }

  async createCharge(card: createChargeRequestInterface) {
    const result = await this.tapPaymentApi(card, 'charges');
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
