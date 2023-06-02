import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ServiceType, Status, UserType } from '@prisma/client';
import * as argon from 'argon2';
import { createCipheriv, createDecipheriv } from 'crypto';
import dayjs from 'dayjs';
import { successResponse, unknowError } from '../../../helpers/response.helper';
import { MailService } from '../../../modules/mail/mail.service';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { CreateNotificationDto } from '../notification/dto';
import { NotificationService } from '../notification/notification.service';
import {
  ChangePasswordDto,
  CustomerSignUpDto,
  ForgotPasswordDto,
  LoginDto,
  LogoutDto,
  RefreshDto,
  ResetPasswordDataDto,
  RiderSignUpDto,
  VendorSignUpDto,
  VerifyOtpDto,
} from './dto';
import { dynamicUrl } from 'src/helpers/dynamic-url.helper';
import { companySchedule } from 'src/core/constants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
    private notification: NotificationService,
  ) {}

  async signupAsCustomer(dto: CustomerSignUpDto) {
    //  generate the password hash
    const password = await argon.hash(dto.password);

    try {
      const userCount = await this.prisma.userMaster.count({
        where: { email: dto.email, userType: UserType.CUSTOMER },
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
          customer: {
            create: {
              email: dto.email,
              fullName: dto.fullName,
              userAddress: {
                create: {
                  cityId: dto.cityId,
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
      const response = await this.signToken(
        user.userMasterId,
        user.email,
        user.userType,
        user.customer.customerId,
      );
      await this.updateRt(user.userMasterId, response.refreshToken);
      this.sendEncryptedDataToMail(user, UserType.CUSTOMER);
      return {
        tokens: response,
        ...user,
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
        where: { email: dto.email, userType: UserType.VENDOR },
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
          // profilePicture: {
          //   create: {
          //     location: dto.logo.location,
          //     key: dto.logo.key,
          //     name: dto.logo.name,
          //   },
          // },
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
            },
          },
        },
        select: {
          userMasterId: true,
          // profileImage: true,
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
      this.sendEncryptedDataToMail(user, UserType.VENDOR);
      const payload: CreateNotificationDto = {
        toUser: 1,
        fromUser: user.userMasterId,
        message: 'message',
        type: 'VendorCreated',
      };
      await this.notification.createNotification(payload);
      return successResponse(
        201,
        'Vendor successfully created, you will receive an email when the admin reviews and approves your profile.',
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
        where: { email: dto.email, userType: UserType.RIDER },
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
        'Rider successfully created, you will receive an email when the admin reviews and approves your profile.',
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
        email: dto.email,
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
        email: dto.email,
        userType: UserType.CUSTOMER,
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
        phone: true,
        userType: true,
        password: true,
        customer: {
          select: {
            userAddress: {
              select: {
                userAddressId: true,
                fullAddress: true,
                isActive: true,
                city: {
                  select: {
                    cityId: true,
                    cityName: true,
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

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    const response = await this.signToken(
      user.userMasterId,
      user.email,
      user.userType,
      user.customer.customerId,
    );
    await this.updateRt(user.userMasterId, response.refreshToken);
    delete user.password;
    return { tokens: response, ...user };
  }

  async signinVendor(dto: LoginDto) {
    const user = await this.prisma.userMaster.findFirst({
      where: {
        email: dto.email,
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
        email: dto.email,
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
          vendor: true,
          admin: true,
          customer: true,
          rider: true,
          userType: true,
        },
      });

      const tokens = await this.signToken(
        previousRefreshToken.userMasterId,
        user.email,
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
          email: data.email,
          userType: data.userType,
        },
      });

      if (
        user.userType === data.userType &&
        !user.isEmailVerified &&
        user[data.userType.toLowerCase()].status !== Status.APPROVED
      ) {
        throw new BadRequestException(
          'Your account has either not been verified or the admin has not yet approved your account.',
        );
      }

      let randomOtp = Math.floor(Math.random() * 10000).toString();
      for (let i = 0; i < 4 - randomOtp.length; i++) {
        randomOtp = '0' + randomOtp;
      }

      if (!user) throw new NotFoundException('Email does not exist.');

      await this.expireOtp(user.userMasterId);

      await this.prisma.otp.create({
        data: {
          userMasterId: user.userMasterId,
          otp: randomOtp,
        },
      });

      // await this.mail.sendResetPasswordEmail(data, randomOtp); umair

      const context = {
        pp_name: this.config.get('APP_NAME'),
        app_url: this.config.get(dynamicUrl(user.userType)),
        copyright_year: this.config.get('COPYRIGHT_YEAR'),
        randomOtp,
      };
      await this.mail.sendEmail(
        data.email,
        this.config.get('MAIL_ADMIN'),
        `${this.config.get('APP_NAME')} - Reset Your Password`,
        'resetPassword', // `.hbs` extension is appended automatically
        context,
      );

      return successResponse(200, 'OTP sent to your email');
    } catch (error) {
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

      const id = this.encryptData(otp.userMasterId.toString());

      return {
        ...successResponse(200, 'OTP verified'),
        userId: id,
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(id: string) {
    const masterId: number = parseInt(this.decryptData(id));
    try {
      const user = await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: masterId,
        },
        select: {
          email: true,
          rider: true,
          vendor: true,
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
        if (user.userType === UserType.RIDER || UserType.VENDOR) {
          const context = {
            app_name: this.config.get('APP_NAME'),
            app_url: `${this.config.get(dynamicUrl(user.userType))}`,
            first_name: user[user.userType.toLowerCase()].fullName,
            message: `${`${
              user[user.userType.toLowerCase()].fullName
            } has signed up and waiting for approval.`}`,
            copyright_year: this.config.get('COPYRIGHT_YEAR'),
          };
          await this.mail.sendEmail(
            this.config.get('MAIL_ADMIN'),
            this.config.get('MAIL_NO_REPLY'),
            this.config.get('APP_NAME'),
            'vendorApprovedRejected',
            context,
          );
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
      const id = parseInt(this.decryptData(data.userId));

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

      if (!pwMatches) throw new BadRequestException('Incorrect password.');

      await this.updatePassword(user.userMasterId, dto.newPassword);

      return successResponse(200, 'Password successfully changed.');
    } catch (error) {
      throw error;
    }
  }

  async logout(dto: LogoutDto) {
    try {
      await this.prisma.refreshToken.update({
        where: {
          refreshToken: dto.refreshToken,
        },
        data: {
          deleted: true,
        },
      });
      return successResponse(200, 'Logged out successfully.');
    } catch (error) {
      throw new BadRequestException(error.meta.cause);
    }
  }

  async signToken(
    userId: number,
    email: string,
    userType: UserType,
    userTypeId: number,
    serviceType?: ServiceType,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: userId,
      email,
      userType,
      userTypeId,
      ...(serviceType && { serviceType }),
    };
    const jwtSecret = this.config.get('JWT_SECRET');
    const jwtRefreshSecret = this.config.get('JWT_REFRESH_SECRET');

    const [at, rt] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: '365 days',
        secret: jwtSecret,
      }),
      this.jwt.signAsync(payload, {
        expiresIn: '7 days',
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

  encryptData(data: string) {
    const cipher = createCipheriv(
      this.config.get('ALGORITHM'),
      Buffer.from(this.config.get('KEY').slice(0, 32)),
      this.config.get('IV'),
    );
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
  }

  decryptData(data: string) {
    const ivString: string = this.config.get('IV');
    const encryptedText = Buffer.from(data, 'hex');

    const decipher = createDecipheriv(
      this.config.get('ALGORITHM'),
      Buffer.from(this.config.get('KEY').slice(0, 32)),
      ivString,
    );

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  }

  async sendEncryptedDataToMail(user: any, userType: UserType) {
    const encrypted = this.encryptData(user.userMasterId.toString());

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
      this.config.get('MAIL_ADMIN'),
      this.config.get('APP_NAME'),
      'userRegistration',
      context,
    );
  }
}
