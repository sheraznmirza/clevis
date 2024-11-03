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
import { ChargeDto, ChargeParams } from './dto/charge.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ChargeEntityTypes } from 'src/core/dto';
import { job } from 'cron';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { UserType } from '@prisma/client';

@Injectable()
export class TapService {
  constructor(
    private httpService: HttpService,
    private prisma: PrismaService,
    private mail: MailService,
    private config: ConfigService,
  ) {}

  async tapAuthorize(dto) {
    try {
      console.log('dto: ', dto);
    } catch (error) {
      throw error;
    }
  }

  async tapCharge(params: ChargeParams, dto: ChargeDto) {
    try {
      if (dto.status === 'CAPTURED') {
        console.log('charge dto: ', dto);
        console.log('charge params: ', params);
        const earning = await this.prisma.earnings.create({
          data: {
            amount: dto.amount,
            userMasterId: +params.userMasterId,
            ...(params.entityType === ChargeEntityTypes.booking && {
              bookingMasterId: +params.entityId,
            }),
            ...(params.entityType === ChargeEntityTypes.job && {
              jobId: +params.entityId,
            }),
            tapChargeId: dto.id,
            tapCustomerId: dto.customer.id,
            tapAuthId: dto.source.id,
          },
          select: {
            createdAt: true,
            bookingMaster: {
              select: {
                pickupLocation: {
                  select: { fullAddress: true },
                },
                dropoffLocation: {
                  select: {
                    fullAddress: true,
                  },
                },
                bookingMasterId: true,
                pickupDeliveryCharges: true,
                dropoffDeliveryCharges: true,
                totalPrice: true,
                bookingPlatformFee: true,
                customer: { select: { fullName: true } },
              },
            },
            job: {
              select: {
                jobType: true,
                id: true,
                vendor: { select: { fullName: true } },
                bookingMaster: {
                  select: {
                    bookingMasterId: true,
                    bookingPlatformFee: true,
                    pickupDeliveryCharges: true,
                    dropoffDeliveryCharges: true,
                    totalPrice: true,
                    customer: { select: { fullName: true } },
                  },
                },
              },
            },
            userMaster: {
              select: {
                userMasterId: true,
                userType: true,
                vendor: { select: { fullName: true } },
                rider: { select: { fullName: true } },
                email: true,
              },
            },
          },
        });

        console.log('EARNING:  ', earning);
        if (earning.userMaster.userType === UserType.VENDOR) {
          const context2 = {
            customer_name: earning.userMaster.vendor.fullName,
            message: `We would like to inform you that a payment has been credited to your Account. Please find below the details of the transaction`,
            list: `<ul>
              <li>Booking ID: ${earning?.bookingMaster?.bookingMasterId}</li>
              <li>Booking Customer Name:${
                earning.bookingMaster.customer.fullName
              } </li>
              <li>Credited Amount: ${dto.amount}</li>
              <li>Date: ${dayjs(earning.createdAt).format('DD-MM-YYYY')}</li>
            </ul>`,
            app_name: this.config.get('APP_NAME'),

            copyright_year: this.config.get('COPYRIGHT_YEAR'),
            // otp: randomOtp,
          };
          await this.mail.sendEmail(
            earning.userMaster.email,
            this.config.get('MAIL_NO_REPLY'),
            `Payment Credited for Booking`,
            'booking', // `.hbs` extension is appended automatically
            context2,
          );
        }

        if (earning.userMaster.userType === UserType.RIDER) {
          const context2 = {
            customer_name: earning.userMaster.rider.fullName,
            message: `Payment of${dto.amount} has been received for ${earning?.job?.id}`,
            list: `<ul><em>Job Detail<em/>
              <li>Job ID: ${earning?.job?.id}</li>
              <li>Booking ID: ${earning?.bookingMaster?.bookingMasterId}</li>
              <li>Job Vendor Name:${earning?.job.vendor.fullName} </li>
              <li>Job Type: ${earning?.job?.jobType}</li>
              <li>Credited Amount: ${dto.amount}</li>
              <li>Date: ${dayjs(earning.createdAt).format('DD-MM-YYYY')}</li>
              <li>Time: ${dayjs(earning?.createdAt).format('HH:mm')}</li>
              <li>Pickup Location: ${
                earning?.bookingMaster?.pickupLocation?.fullAddress
              }</li>
              <li>Dropoff Location: ${
                earning?.bookingMaster?.dropoffLocation?.fullAddress
              }</li>
              <li>Credited Amount: ${dto.amount}</li>
            </ul>`,
            app_name: this.config.get('APP_NAME'),

            copyright_year: this.config.get('COPYRIGHT_YEAR'),
            // otp: randomOtp,
          };
          await this.mail.sendEmail(
            earning.userMaster.email,
            this.config.get('MAIL_NO_REPLY'),
            `Payment Credited for Job`,
            'booking', // `.hbs` extension is appended automatically
            context2,
          );
        }

        if (+params.userMasterId === 1) {
          // const booking = await this.prisma.bookingMaster.findUnique({
          //   where: {
          //     bookingMasterId: +params.entityId,
          //   },
          //   select: {
          //     bookingMasterId: true,
          //     pickupDeliveryCharges: true,
          //     dropoffDeliveryCharges: true,
          //     totalPrice: true,
          //     customer: {
          //       select: {
          //         fullName: true,
          //       },
          //     },
          //   },
          // });

          const context = {
            customer_name: 'Admin',
            message: `We would like to inform you that a payment has been made by the customer for booking ${
              earning.bookingMaster.bookingMasterId ||
              earning.job.bookingMaster.bookingMasterId
            }. Please find below the details of the transaction`,
            list: `<ul>
                    <li> Booking ID: ${
                      earning.bookingMaster.bookingMasterId ||
                      earning.job.bookingMaster.bookingMasterId
                    }</li>
                    <li>Customer Name:${
                      earning.bookingMaster.customer.fullName ||
                      earning.job.bookingMaster.customer.fullName
                    } </li>
                    <li>Service Amount: ${
                      earning.bookingMaster.totalPrice ||
                      earning.job.bookingMaster.totalPrice
                    }</li>
                    <li>Pickup Delivery Charges Amount: ${
                      earning.bookingMaster.pickupDeliveryCharges ||
                      earning.job.bookingMaster.pickupDeliveryCharges
                    }</li>
                    <li>Dropoff Delivery Charges Amount: ${
                      earning.bookingMaster.dropoffDeliveryCharges ||
                      earning.job.bookingMaster.dropoffDeliveryCharges
                    }</li>
                    <li>Platform Fee Amount: ${earning.bookingMaster.bookingPlatformFee || earning.job.bookingMaster.bookingPlatformFee}</li>
                    <li>Date: ${dayjs(earning.createdAt).format(
                      'DD-MM-YYYY',
                    )}</li>  
                  </ul>`,
            app_name: this.config.get('APP_NAME'),

            copyright_year: this.config.get('COPYRIGHT_YEAR'),
            // otp: randomOtp,
          };
          await this.mail.sendEmail(
            this.config.get('MAIL_ADMIN'),
            this.config.get('MAIL_NO_REPLY'),
            `Payment Received for Booking`,
            'booking', // `.hbs` extension is appended automatically
            context,
          );
        }
      }
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
