import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  DeviceType,
  EntityType,
  NotificationType,
  ServiceType,
  Status,
  UserType,
} from '@prisma/client';
import * as argon from 'argon2';
import dayjs from 'dayjs';
import { successResponse, unknowError } from '../../../helpers/response.helper';
import { MailService } from '../../../modules/mail/mail.service';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import {
  ChangePasswordDto,
  CustomerSignUpDto,
  ForgotPasswordDto,
  LoginDto,
  LogoutDto,
  RefreshDto,
  ResetPasswordDataDto,
  RiderSignUpDto,
  ValidateEmailDto,
  VendorSignUpDto,
  VerifyOtpDto,
} from './dto';
import { dynamicUrl } from 'src/helpers/dynamic-url.helper';
import { companySchedule } from 'src/core/constants';
import { decryptData, encryptData } from 'src/helpers/util.helper';
import { TapService } from 'src/modules/tap/tap.service';
import { BullQueueService } from 'src/modules/queue/bull-queue.service';
import { createCustomerRequestInterface } from 'src/modules/tap/dto/card.dto';
import { SQSSendNotificationArgs } from 'src/modules/queue-aws/types';
import { NotificationData } from 'src/modules/notification-socket/types';
import { NotificationBody, NotificationTitle } from 'src/constants';
import { NotificationService } from 'src/modules/notification-socket/notification.service';
import { GetUserType } from 'src/core/dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
    private tapService: TapService,
    private queue: BullQueueService,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
  ) {}

  async signupAsCustomer(dto: CustomerSignUpDto) {
    //  generate the password hash
    const password = await argon.hash(dto.password);

    try {
      const userCount = await this.prisma.userMaster.count({
        where: {
          email: {
            equals: dto.email,
            mode: 'insensitive',
          },
          userType: UserType.CUSTOMER,
          isDeleted: false,
        },
      });
      const cityCount = await this.prisma.city.count({
        where: { cityId: dto.cityId },
      });

      if (userCount > 0) {
        throw new ForbiddenException('Credentials taken');
      }

      if (cityCount === 0) {
        throw new ForbiddenException('City not found');
      }

      const roleId = await this.getRoleByType(UserType.CUSTOMER);

      const user = await this.prisma.userMaster.create({
        data: {
          email: dto.email,
          password,
          phone: dto.phone,
          roleId: roleId,

          ...(dto.playerId && {
            device: {
              create: {
                playerId: dto.playerId,
                type: dto.deviceType,
              },
            },
          }),
          customer: {
            create: {
              email: dto.email,
              fullName: dto.fullName,
              userAddress: {
                create: {
                  cityId: dto.cityId,
                },
              },
              status: Status.APPROVED,
            },
          },
        },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          phone: true,
          userType: true,
          isActive: true,
          notificationEnabled: true,
          profilePicture: {
            select: {
              id: true,
              name: true,
              key: true,
              location: true,
            },
          },
          customer: {
            select: {
              email: true,
              userAddress: {
                where: {
                  isDeleted: false,
                },
                take: 1,
                orderBy: {
                  createdAt: 'desc',
                },
                select: {
                  userAddressId: true,
                  fullAddress: true,
                  city: {
                    select: {
                      cityName: true,
                      cityId: true,
                      State: {
                        select: {
                          stateId: true,
                          stateName: true,
                          country: {
                            select: {
                              countryId: true,
                              countryName: true,
                              currency: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              fullName: true,
              customerId: true,
            },
          },
        },
      });
      const response = await this.signToken(
        user.userMasterId,
        user.email,
        user.customer.fullName,
        user.userType,
        user.customer.customerId,
      );

      this.queue.createCustomerTapAndMail(response, user);

      return {
        tokens: response,
        ...user,
        activeAddress: null,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Credentials taken');
      }
      throw error;
    }
  }

  async signupAsVendor(dto: VendorSignUpDto) {
    //  generate the password hash
    const password = await argon.hash(dto.password);

    try {
      const userCount = await this.prisma.userMaster.count({
        where: {
          email: {
            equals: dto.email,
            mode: 'insensitive',
          },
          userType: UserType.VENDOR,
          isDeleted: false,
        },
      });

      if (userCount > 0) {
        throw new ForbiddenException('Credentials taken');
      }
      const roleId = await this.getRoleByType(UserType.VENDOR);
      const businesess = [];
      const workspaces = [];

      dto.businessLicense.forEach(async (business) => {
        const result = await this.prisma.media.create({
          data: business,
          select: {
            id: true,
          },
        });
        businesess.push(result);
      });

      dto.workspaceImages.forEach(async (business) => {
        const result = await this.prisma.media.create({
          data: business,
          select: {
            id: true,
          },
        });
        workspaces.push(result);
      });

      const user = await this.prisma.userMaster.create({
        data: {
          email: dto.email,
          password,
          phone: dto.phone,
          userType: UserType.VENDOR,
          roleId: roleId,
          vendor: {
            create: {
              fullName: dto.fullName,
              companyEmail: dto.companyEmail,
              companyName: dto.companyName,
              logo: {
                create: {
                  location: dto.logo.location,
                  key: dto.logo.key,
                  name: dto.logo.name,
                },
              },
              description: dto.description,
              serviceType: dto.serviceType,
              userAddress: {
                create: {
                  fullAddress: dto.fullAddress,
                  cityId: dto.cityId,
                  latitude: dto.latitude,
                  longitude: dto.longitude,
                },
              },
              companySchedule: {
                createMany: {
                  data: companySchedule(),
                },
              },
              ...(dto.serviceType === ServiceType.LAUNDRY && {
                deliverySchedule: {
                  create: {
                    deliveryItemMin: 1,
                    deliveryItemMax: 5,
                    kilometerFare: 8.5,
                  },
                },
              }),
            },
          },
        },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          phone: true,
          userType: true,
          vendor: {
            select: {
              userAddress: {
                select: {
                  userAddressId: true,
                  fullAddress: true,
                  cityId: true,
                  longitude: true,
                  latitude: true,
                  city: {
                    select: {
                      cityName: true,
                      State: {
                        select: {
                          stateName: true,
                          country: {
                            select: {
                              countryCode: true,
                              countryName: true,
                              currency: true,
                              shortName: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              fullName: true,
              vendorId: true,
              companyEmail: true,
              companyName: true,
              logo: true,
              // workspaceImages: true,
              // businessLicense: true,
              description: true,
              serviceType: true,
            },
          },
        },
      });

      await this.prisma.businessLicense.createMany({
        data: businesess.map((item) => ({
          vendorVendorId: user.vendor.vendorId,
          mediaId: item.id,
        })),
      });

      await this.prisma.workspaceImages.createMany({
        data: workspaces.map((item) => ({
          vendorVendorId: user.vendor.vendorId,
          mediaId: item.id,
        })),
      });

      this.queue.sendVerificationEmail(user, UserType.VENDOR);
      return successResponse(
        201,
        'Account successfully created, you will receive a verification email.',
      );
    } catch (error) {
      console.log('error: ', error);
      if (error.code === 'P2002') {
        throw new ForbiddenException('Credentials taken');
      }
      throw error;
    }
  }

  async signupAsRider(dto: RiderSignUpDto) {
    //  generate the password hash
    const password = await argon.hash(dto.password);

    try {
      const userCount = await this.prisma.userMaster.count({
        where: {
          email: {
            equals: dto.email,
            mode: 'insensitive',
          },
          userType: UserType.RIDER,
          isDeleted: false,
        },
      });

      if (userCount > 0) {
        throw new ForbiddenException('Credentials taken');
      }

      const roleId = await this.getRoleByType(UserType.RIDER);
      const businesess = [];
      const workspaces = [];
      dto.businessLicense.forEach(async (business) => {
        const result = await this.prisma.media.create({
          data: business,
          select: {
            id: true,
          },
        });
        businesess.push(result);
      });

      dto.workspaceImages.forEach(async (business) => {
        const result = await this.prisma.media.create({
          data: business,
          select: {
            id: true,
          },
        });
        workspaces.push(result);
      });
      const user = await this.prisma.userMaster.create({
        data: {
          email: dto.email,
          password,
          phone: dto.phone,
          userType: UserType.RIDER,
          roleId: roleId,
          // ...(dto.playerId && {
          //   device: {
          //     create: {
          //       playerId: dto.playerId,
          //     },
          //   },
          // }),
          rider: {
            create: {
              fullName: dto.fullName,
              companyEmail: dto.companyEmail,
              companyName: dto.companyName,
              logo: {
                create: {
                  location: dto.logo.location,
                  key: dto.logo.key,
                  name: dto.logo.name,
                },
              },
              // workspaceImages: dto.workspaceImages,
              // businessLicense: dto.businessLicense,
              description: dto.description,
              userAddress: {
                create: {
                  fullAddress: dto.fullAddress,
                  cityId: dto.cityId,
                  latitude: dto.latitude,
                  longitude: dto.longitude,
                },
              },
              companySchedule: {
                createMany: {
                  data: companySchedule(),
                },
              },
            },
          },
        },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          phone: true,
          userType: true,
          rider: {
            select: {
              userAddress: {
                select: {
                  userAddressId: true,
                  fullAddress: true,
                  cityId: true,
                  longitude: true,
                  latitude: true,
                },
              },
              fullName: true,
              riderId: true,
              logo: {
                select: {
                  id: true,
                  location: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      await this.prisma.businessLicense.createMany({
        data: businesess.map((item) => ({
          riderRiderId: user.rider.riderId,
          mediaId: item.id,
        })),
      });

      await this.prisma.workspaceImages.createMany({
        data: workspaces.map((item) => ({
          riderRiderId: user.rider.riderId,
          mediaId: item.id,
        })),
      });
      this.sendEncryptedDataToMail(user, UserType.RIDER);
      return successResponse(
        201,
        'Account successfully created, you will receive a verification email.',
      );
    } catch (error) {
      console.log('error: ', error);
      if (error.code === 'P2002') {
        throw new ForbiddenException('Credentials taken');
      }
      throw error;
    }
  }

  async signinAdmin(dto: LoginDto) {
    const user = await this.prisma.userMaster.findFirst({
      where: {
        email: {
          equals: dto.email,
          mode: 'insensitive',
        },
        userType: UserType.ADMIN,
      },
      select: {
        userMasterId: true,
        profilePicture: {
          select: {
            key: true,
            name: true,
            id: true,
          },
        },
        email: true,
        isEmailVerified: true,
        phone: true,
        userType: true,
        password: true,
        device: {
          select: {
            playerId: true,
          },
        },
        admin: {
          select: {
            // userAddress: {
            //   select: {
            //     userAddressId: true,
            //     fullAddress: true,
            //     cityId: true,
            //     longitude: true,
            //     latitude: true,
            //   },
            // },
            fullName: true,
            id: true,
          },
        },
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    const response = await this.signToken(
      user.userMasterId,
      user.email,
      user.admin.fullName,
      user.userType,
      user.admin.id,
    );
    await this.updateRt(user.userMasterId, response.refreshToken);
    // const profileImage = await this.getImages(user.profileImage);
    delete user.password;
    return { tokens: response, ...user };
  }

  async signinCustomer(dto: LoginDto) {
    const user = await this.prisma.userMaster.findFirst({
      where: {
        email: {
          equals: dto.email,
          mode: 'insensitive',
        },
        userType: UserType.CUSTOMER,
        isDeleted: false,
      },
      select: {
        userMasterId: true,
        email: true,
        isEmailVerified: true,
        phone: true,
        userType: true,
        isActive: true,
        notificationEnabled: true,
        password: true,
        profilePicture: {
          select: {
            id: true,
            name: true,
            key: true,
            location: true,
          },
        },
        customer: {
          select: {
            userAddress: {
              select: {
                userAddressId: true,
                fullAddress: true,
                city: {
                  select: {
                    cityName: true,
                    cityId: true,
                    State: {
                      select: {
                        stateId: true,
                        stateName: true,
                        country: {
                          select: {
                            countryId: true,
                            countryName: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            fullName: true,
            customerId: true,
          },
        },
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    if (!user.isActive)
      throw new ForbiddenException('Your account has been deactivated');

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    const activeAddress = await this.prisma.userAddress.findFirst({
      where: {
        customerId: user.customer.customerId,
        isActive: true,
        fullAddress: {
          not: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const response = await this.signToken(
      user.userMasterId,
      user.email,
      user.customer.fullName,
      user.userType,
      user.customer.customerId,
    );
    console.log('Customer SignIn DTO: ', dto);
    if (dto?.playerId) {
      await this.prisma.device.create({
        data: {
          customerId: user.customer.customerId,
          userMasterId: user.userMasterId,
          playerId: dto.playerId,
          type: DeviceType.ANDROID,
        },
      });
    }
    await this.updateRt(user.userMasterId, response.refreshToken);
    delete user.password;
    return { tokens: response, ...user, activeAddress };
  }

  async signinVendor(dto: LoginDto) {
    const user = await this.prisma.userMaster.findFirst({
      where: {
        email: {
          equals: dto.email,
          mode: 'insensitive',
        },
        userType: UserType.VENDOR,
        isDeleted: false,
      },
      select: {
        userMasterId: true,
        profilePicture: {
          select: {
            key: true,
            name: true,
            id: true,
          },
        },
        email: true,
        isEmailVerified: true,
        isActive: true,
        phone: true,
        userType: true,
        password: true,
        vendor: {
          select: {
            vendorId: true,
            fullName: true,
            serviceType: true,
            companyName: true,
            companyEmail: true,
            logo: true,
            workspaceImages: true,
            businessLicense: true,
            description: true,
            userAddress: {
              where: {
                isDeleted: false,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
              select: {
                userAddressId: true,
                fullAddress: true,
                city: {
                  select: {
                    cityName: true,
                    cityId: true,
                    State: {
                      select: {
                        stateName: true,
                        stateId: true,
                        country: {
                          select: {
                            countryName: true,
                            countryId: true,
                          },
                        },
                      },
                    },
                  },
                },
                longitude: true,
                latitude: true,
              },
            },
            status: true,
          },
        },
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    if (!user.isActive)
      throw new ForbiddenException('Your account has been deactivated');

    if (user.vendor.status !== Status.APPROVED)
      throw new ForbiddenException(
        `Vendor has ${
          user.vendor.status === Status.PENDING
            ? 'not yet been approved'
            : 'been rejected'
        } by the admin.`,
      );

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    const response = await this.signToken(
      user.userMasterId,
      user.email,
      user.vendor.fullName,
      user.userType,
      user.vendor.vendorId,
      user.vendor.serviceType,
    );
    await this.updateRt(user.userMasterId, response.refreshToken);

    delete user.password;
    return {
      tokens: response,
      ...user,
      vendor: {
        ...user.vendor,
      },
    };
  }

  async signinRider(dto: LoginDto) {
    const user = await this.prisma.userMaster.findFirst({
      where: {
        email: {
          equals: dto.email,
          mode: 'insensitive',
        },
        userType: UserType.RIDER,
        isDeleted: false,
      },
      select: {
        userMasterId: true,
        profilePicture: {
          select: {
            key: true,
            name: true,
            id: true,
          },
        },
        email: true,
        isEmailVerified: true,
        isActive: true,
        phone: true,
        userType: true,
        password: true,
        rider: {
          select: {
            riderId: true,
            fullName: true,
            companyName: true,
            companyEmail: true,
            logo: true,
            workspaceImages: true,
            businessLicense: true,
            description: true,
            userAddress: {
              where: {
                isDeleted: false,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
              select: {
                userAddressId: true,
                fullAddress: true,
                city: {
                  select: {
                    cityName: true,
                    cityId: true,
                    State: {
                      select: {
                        stateName: true,
                        stateId: true,
                        country: {
                          select: {
                            countryName: true,
                            countryId: true,
                          },
                        },
                      },
                    },
                  },
                },
                longitude: true,
                latitude: true,
              },
            },
            status: true,
          },
        },
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    if (!user.isActive)
      throw new ForbiddenException('Your account has been deactivated');

    if (user.rider.status !== Status.APPROVED)
      throw new ForbiddenException(
        `Rider has ${
          user.rider.status === Status.PENDING
            ? 'not yet been approved'
            : 'been rejected'
        } by the admin.`,
      );

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    const response = await this.signToken(
      user.userMasterId,
      user.email,
      user.rider.fullName,
      user.userType,
      user.rider.riderId,
    );
    await this.updateRt(user.userMasterId, response.refreshToken);
    // const profileImage = await this.getImages(user.profileImage);
    // const businessLicense = await this.getImages(user.rider.businessLicense);
    // const workspaceImages = await this.getImages(user.rider.workspaceImages);
    delete user.password;

    return {
      tokens: response,
      ...user,
      // profileImage,
      rider: {
        ...user.rider,
        // businessLicense,
        // workspaceImages,
      },
    };
  }

  async refreshTokens({ refreshToken }: RefreshDto) {
    try {
      const previousRefreshToken = await this.prisma.refreshToken.findFirst({
        where: {
          refreshToken,
          deleted: false,
        },
      });
      if (!previousRefreshToken)
        throw new UnauthorizedException('Refresh token invalid');

      const user = await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: previousRefreshToken.userMasterId,
        },
        select: {
          email: true,
          isDeleted: true,
          vendor: true,
          admin: true,
          customer: true,
          rider: true,
          userType: true,
        },
      });

      if (user.isDeleted) throw new NotFoundException('User does not exist.');

      const tokens = await this.signToken(
        previousRefreshToken.userMasterId,
        user.email,
        (user && user.vendor && user.vendor.fullName) ||
          (user && user.admin && user.admin.fullName) ||
          (user && user.customer && user.customer.fullName) ||
          (user && user.rider && user.rider.fullName),
        user.userType,
        (user && user.vendor && user.vendor.vendorId) ||
          (user && user.admin && user.admin.id) ||
          (user && user.customer && user.customer.customerId) ||
          (user && user.rider && user.rider.riderId),
        (user && user.vendor && user.vendor.serviceType) || null,
      );
      await this.updateRt(
        previousRefreshToken.userMasterId,
        tokens.refreshToken,
        previousRefreshToken.refreshToken,
      );
      return {
        tokens,
      };
    } catch (error) {
      console.log('error: ', error);
      throw error;
    }
  }

  async forgotPassword(data: ForgotPasswordDto) {
    try {
      const user = await this.prisma.userMaster.findFirst({
        where: {
          email: {
            equals: data.email,
            mode: 'insensitive',
          },
          userType: data.userType,
          isDeleted: false,
        },
        select: {
          createdAt: true,
          email: true,
          isActive: true,
          isDeleted: true,
          isEmailVerified: true,
          password: true,
          phone: true,
          profilePictureId: true,
          roleId: true,
          updatedAt: true,
          userMasterId: true,
          userType: true,
          vendor: true,
          rider: true,
          admin: true,
          customer: true,
        },
      });

      if (!user) throw new NotFoundException('Email does not exist.');
      if (
        !(
          data.userType === UserType.ADMIN ||
          data.userType === UserType.CUSTOMER
        ) &&
        (user.userType !== data.userType ||
          !user.isEmailVerified ||
          user[data.userType.toLowerCase()]?.status !== Status.APPROVED)
      ) {
        throw new BadRequestException(
          'Your account has either not been verified or the admin has not yet approved your account.',
        );
      }

      const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
      await this.expireOtp(user.userMasterId);

      await this.prisma.otp.create({
        data: {
          userMasterId: user.userMasterId,
          otp: randomOtp,
        },
      });

      // await this.mail.sendResetPasswordEmail(data, randomOtp); umair

      const context = {
        first_name: user[user.userType.toLowerCase()].fullName,
        app_name: this.config.get('APP_NAME'),
        app_url: this.config.get(dynamicUrl(user.userType)),
        copyright_year: this.config.get('COPYRIGHT_YEAR'),
        otp: randomOtp,
      };
      await this.mail.sendEmail(
        data.email,
        this.config.get('MAIL_ADMIN'),
        `Reset Your Password`,
        'resetPassword', // `.hbs` extension is appended automatically
        context,
      );

      return successResponse(200, 'OTP sent to your email');
    } catch (error) {
      console.log('error: ', error);
      if (error?.response?.statusCode === 404) {
        throw error;
      }
      return unknowError(
        417,
        error,
        `The ${data.userType.toLowerCase()} has not been approved by admin yet`,
      );
    }
  }

  async verifyOtp(dto: VerifyOtpDto) {
    try {
      const otp = await this.prisma.otp.findFirst({
        where: {
          otp: dto.otp,
          expired: false,
        },
        select: {
          expired: true,
          createdAt: true,
          userMasterId: true,
          otpId: true,
        },
      });
      console.log('otp: ', otp);

      if (!otp) {
        throw new BadRequestException('Invalid OTP');
      }

      if (dayjs().diff(otp?.createdAt, 'minute') > 9) {
        await this.prisma.otp.update({
          where: {
            otpId: otp.otpId,
          },
          data: {
            expired: true,
          },
        });

        throw new RequestTimeoutException('OTP has already expired');
      }

      const id = encryptData(otp.userMasterId.toString());

      return {
        ...successResponse(200, 'OTP verified'),
        userId: id,
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(id: string) {
    const masterId: number = parseInt(decryptData(id));
    try {
      const user = await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: masterId,
        },
        select: {
          updatedAt: true,
          userMasterId: true,
          email: true,
          rider: true,
          vendor: {
            select: {
              fullName: true,
              companyName: true,
              serviceType: true,
            },
          },
          userType: true,
          isEmailVerified: true,
        },
      });

      if (!user) throw new NotFoundException('User does not exist.');

      if (user.isEmailVerified) {
        throw new ConflictException('Email is already verified');
      } else {
        await this.prisma.userMaster.update({
          where: {
            userMasterId: masterId,
          },
          data: {
            isEmailVerified: true,
          },
        });
        if (
          user.userType === UserType.RIDER ||
          user.userType === UserType.VENDOR
        ) {
          console.log(
            'user[user.userType.toLowerCase()].fullName: ',
            user[user.userType.toLowerCase()].fullName,
          );
          const context = {
            app_name: this.config.get('APP_NAME'),
            app_url: `${this.config.get(dynamicUrl(user.userType))}`,
            first_name: 'Admin',
            message: `This is to inform you that a vendor has submitted an account approval request. Please review the request and take appropriate actions. The details of the vendor are as follows:`,
            list: `<ul>
<li>Name: ${
              user.userType === UserType.RIDER
                ? user.rider.fullName
                : user.vendor.fullName
            } </li>
<li> Vendor Email: ${
              user.userType === UserType.RIDER ? user.email : user.email
            }</li>
<li>Vendor Company: ${
              user.userType === UserType.RIDER
                ? user.rider.companyName
                : user.vendor.companyName
            } </li>
Approval Date: ${dayjs(user.updatedAt).format()}


            </ul>`,
            copyright_year: this.config.get('COPYRIGHT_YEAR'),
          };

          await this.mail.sendEmail(
            this.config.get('MAIL_ADMIN'),
            this.config.get('MAIL_NO_REPLY'),
            `${user.userType.toLowerCase()} approval request`,
            'vendorApprovedRejected',
            context,
          );

          // const context2 = {
          //   app_name: this.config.get('APP_NAME'),
          //   app_url: `${this.config.get(dynamicUrl(user.userType))}`,
          //   first_name: user[user.userType.toLowerCase()].fullName,
          //   message: `${`${
          //     user[user.userType.toLowerCase()].fullName
          //   } has signed up and waiting for approval.`}`,
          //   copyright_year: this.config.get('COPYRIGHT_YEAR'),
          // };
          // await this.mail.sendEmail(
          //   this.config.get(user.email),
          //   this.config.get('MAIL_NO_REPLY'),
          //   this.config.get('APP_NAME'),
          //   'vendorApprovedRejected',
          //   context,
          // );
        }

        if (user.userType === UserType.RIDER || UserType.VENDOR) {
          const payload: SQSSendNotificationArgs<NotificationData> = {
            type:
              user.userType === UserType.RIDER
                ? NotificationType.RiderCreated
                : NotificationType.VendorCreated,
            userId: [1],
            data: {
              title:
                user.userType === UserType.RIDER
                  ? NotificationTitle.RIDER_CREATED
                  : NotificationTitle.VENDOR_CREATED,

              body:
                user.userType === UserType.RIDER
                  ? NotificationBody.RIDER_CREATED
                  : NotificationBody.VENDOR_CREATED,
              type:
                user.userType === UserType.RIDER
                  ? NotificationType.RiderCreated
                  : NotificationType.VendorCreated,
              entityType: EntityType.USERMASTER,
              entityId: user.userMasterId,
            },
          };
          await this.notificationService.HandleNotifications(payload);
        }

        return {
          statusCode: 202,
          message: 'Email successfully verified!',
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordDataDto) {
    try {
      const id = parseInt(decryptData(data.userId));

      const otp = await this.prisma.otp.findFirst({
        where: {
          userMasterId: id,
          expired: false,
        },
        select: {
          expired: true,
          createdAt: true,
          userMasterId: true,
          otpId: true,
        },
      });

      if (!otp) {
        throw new NotFoundException('OTP does not exist or has expired');
      }

      if (dayjs().diff(otp.createdAt, 'minute') > 9) {
        await this.prisma.otp.update({
          where: {
            otpId: otp.otpId,
          },
          data: {
            expired: true,
          },
        });

        throw new RequestTimeoutException('OTP has already expired');
      }

      await this.updatePassword(otp.userMasterId, data.password);

      return successResponse(200, 'Password successfully reset.');
    } catch (error) {
      throw error;
    }
  }

  async changePassword(dto: ChangePasswordDto, id: number) {
    try {
      const user = await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
      });

      const pwMatches = await argon.verify(user.password, dto.oldPassword);

      if (!pwMatches) throw new BadRequestException('Incorrect old password.');

      await this.updatePassword(user.userMasterId, dto.newPassword);

      const payloads: SQSSendNotificationArgs<NotificationData> = {
        type: NotificationType.ChangePassword,
        userId: [user.userMasterId],
        data: {
          title: NotificationTitle.CHANGE_PASSWORD,

          body: NotificationBody.CHANGE_PASSWORD,

          type: NotificationType.ChangePassword,
          entityType: EntityType.CUSTOMER,
          entityId: user.userMasterId,
        },
      };
      await this.notificationService.HandleNotifications(
        payloads,
        UserType.CUSTOMER,
      );
      return successResponse(200, 'Password successfully changed.');
    } catch (error) {
      throw error;
    }
  }

  async logout(user: GetUserType, dto: LogoutDto) {
    try {
      await this.prisma.refreshToken.update({
        where: {
          refreshToken: dto.refreshToken,
        },
        data: {
          deleted: true,
        },
      });

      if (user.userType === UserType.CUSTOMER && dto?.playerId) {
        await this.prisma.device.updateMany({
          where: {
            playerId: dto.playerId,
            isDeleted: false,
            customerId: user.userTypeId,
            userMasterId: user.userMasterId,
          },
          data: {
            isDeleted: true,
          },
        });
      }

      return successResponse(200, 'Logged out successfully.');
    } catch (error) {
      throw new BadRequestException(error.meta.cause);
    }
  }

  async validateEmail(dto: ValidateEmailDto) {
    try {
      const user = await this.prisma.userMaster.findFirst({
        where: {
          email: {
            equals: dto.email,
            mode: 'insensitive',
          },
          userType: UserType.CUSTOMER,
          isDeleted: false,
        },
      });

      if (user) {
        return true;
      }

      return false;
    } catch (error) {
      throw error;
    }
  }

  async verify(token: string) {
    return await this.jwt.verify(token, {
      secret: this.config.get('JWT_SECRET'),
    });
  }

  async signToken(
    userId: number,
    email: string,
    fullName: string,
    userType: UserType,
    userTypeId: number,
    serviceType?: ServiceType,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: userId,
      email,
      fullName,
      userType,
      userTypeId,
      ...(serviceType && { serviceType }),
    };
    const jwtSecret = this.config.get('JWT_SECRET');
    const jwtRefreshSecret = this.config.get('JWT_REFRESH_SECRET');

    const [at, rt] = await Promise.all([
      this.jwt.signAsync(payload, {
        ...(userType !== UserType.CUSTOMER && {
          expiresIn: '2 days',
        }),
        secret: jwtSecret,
      }),
      this.jwt.signAsync(payload, {
        ...(userType !== UserType.CUSTOMER && {
          expiresIn: '7 days',
        }),

        secret: jwtRefreshSecret,
      }),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async updateRt(userId: number, currentRt: string, previousRt?: string) {
    await this.prisma.refreshToken.create({
      data: {
        refreshToken: currentRt,
        userMasterId: userId,
      },
    });
    if (previousRt) {
      await this.prisma.refreshToken.update({
        where: {
          refreshToken: previousRt,
        },
        data: {
          deleted: true,
        },
      });
    }
  }

  async updatePassword(userId: number, password: string) {
    const hash = await argon.hash(password);

    await this.prisma.userMaster.update({
      where: {
        userMasterId: userId,
      },
      data: {
        password: hash,
      },
    });

    return null;
  }

  async expireOtp(userId: number) {
    await this.prisma.otp.updateMany({
      where: {
        userMasterId: userId,
        expired: false,
      },
      data: {
        expired: true,
      },
    });
  }

  async getRoleByType(userType: UserType) {
    const userId = await this.prisma.role.findFirst({
      where: {
        userType: userType,
        isDeleted: false,
        isActive: true,
      },
      select: {
        id: true,
        isActive: true,
        name: true,
      },
    });

    if (!userId)
      throw new UnauthorizedException(
        `All ${name} users are momentarily disabled`,
      );

    return userId.id;
  }

  // async getImages(imageId: number[] | number) {
  //   try {
  //     if (!imageId) return null;

  //     const image = Array.isArray(imageId)
  //       ? await this.prisma.media.findMany({
  //           where: {
  //             id: {
  //               in: imageId,
  //             },
  //           },
  //           select: {
  //             id: true,
  //             originalName: true,
  //             fileName: true,
  //             path: true,
  //             type: true,
  //             size: true,
  //           },
  //         })
  //       : await this.prisma.media.findUnique({
  //           where: {
  //             id: imageId,
  //           },
  //           select: {
  //             id: true,
  //             originalName: true,
  //             fileName: true,
  //             path: true,
  //             type: true,
  //             size: true,
  //           },
  //         });

  //     return image || null;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // encryptData(data: string) {
  //   const cipher = createCipheriv(
  //     this.config.get('ALGORITHM'),
  //     Buffer.from(this.config.get('KEY')),
  //     this.config.get('IV'),
  //   );
  //   let encrypted = cipher.update(data);
  //   encrypted = Buffer.concat([encrypted, cipher.final()]);
  //   return encrypted.toString('hex');
  // }

  // decryptData(data: string) {
  //   const ivString: string = this.config.get('IV');
  //   const encryptedText = Buffer.from(data, 'hex');

  //   const decipher = createDecipheriv(
  //     this.config.get('ALGORITHM'),
  //     Buffer.from(this.config.get('KEY')),
  //     ivString,
  //   );

  //   let decrypted = decipher.update(encryptedText);
  //   decrypted = Buffer.concat([decrypted, decipher.final()]);

  //   return decrypted.toString();
  // }

  async sendEncryptedDataToMail(user: any, userType: UserType) {
    const encrypted = encryptData(user.userMasterId.toString());

    const context = {
      app_name: this.config.get('APP_NAME'),
      app_url: `${this.config.get(
        dynamicUrl(userType),
      )}/auth/verify-email/${encrypted}`,
      first_name: user[userType.toLowerCase()].fullName,
      copyright_year: this.config.get('COPYRIGHT_YEAR'),
    };

    this.mail.sendEmail(
      user.email,
      this.config.get('MAIL_NO_REPLY'),
      'Verify email',
      'userRegistration',
      context,
    );
  }

  async _createTapCustomerAndMail(response, user, userType: UserType) {
    try {
      const payloads: SQSSendNotificationArgs<NotificationData> = {
        type: NotificationType.CustomerCreate,
        userId: [user.userMasterId],
        data: {
          title: NotificationTitle.CUSTOMER_CREATE_ACCOUNT,
          body: NotificationBody.CUSTOMER_CREATE_ACCOUNT,

          type: NotificationType.CustomerCreate,
          entityType: EntityType.CUSTOMER,
          entityId: user.customer.customerId,
        },
      };
      await this.notificationService.HandleNotifications(
        payloads,
        UserType.CUSTOMER,
      );

      await this.updateRt(user.userMasterId, response.refreshToken);

      const payload: createCustomerRequestInterface = {
        email: user.email,
        first_name: user.customer.fullName,
        currency: 'SAR', // user.customer.userAddress[0].city.state.country.currency,
      };
      const tapCustomer = await this.tapService.createCustomer(payload);

      this.sendEncryptedDataToMail(user, userType);
      await this.prisma.customer.update({
        where: {
          customerId: user.customer.customerId,
        },
        data: {
          tapCustomerId: tapCustomer.id,
        },
      });

      const context = {
        app_name: this.config.get('APP_NAME'),
        message:
          'We are happy to have you on board! Now you can book Laundry & Car Wash service from the comfort of your home.',
        name: user.customer.fullName,
        copyright_year: this.config.get('COPYRIGHT_YEAR'),
      };

      this.mail.sendEmail(
        user.customer.email,
        this.config.get('MAIL_NO_REPLY'),
        'Welcome to Clevis',
        'inactive',
        context,
      );
    } catch (error) {
      throw error;
    }
  }
}
