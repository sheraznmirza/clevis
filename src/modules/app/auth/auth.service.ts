import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
  RequestTimeoutException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  CustomerSignUpDto,
  VendorSignUpDto,
  LoginDto,
  RiderSignUpDto,
  RefreshDto,
  ForgotPasswordDto,
  ResetPasswordDataDto,
} from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UserType } from '@prisma/client';
import { MailService } from 'src/modules/mail/mail.service';
import { createCipheriv, createDecipheriv } from 'crypto';
import * as dayjs from 'dayjs';
import { successResponse } from 'src/helpers/response.helper';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async signupAsCustomer(dto: CustomerSignUpDto) {
    //  generate the password hash
    const password = await argon.hash(dto.password);

    try {
      const user = await this.prisma.userMaster.create({
        data: {
          email: dto.email,
          password,
          phone: dto.phone,
          location: dto.location,
          customer: {
            create: {
              email: dto.email,
              fullName: dto.fullName,
              userAddress: {
                create: {
                  fullAddress: dto.userAddress,
                },
              },
            },
          },
        },
        select: {
          userMasterId: true,
          profileImage: true,
          email: true,
          isEmailVerified: true,
          phone: true,
          userType: true,
          location: true,
          customer: {
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
              customerId: true,
            },
          },
        },
      });
      const response = await this.signToken(user.userMasterId, user.email);
      await this.updateRt(user.userMasterId, response.refreshToken);
      await this.sendEncryptedDataToMail(user, UserType.CUSTOMER);
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
      const user = await this.prisma.userMaster.create({
        data: {
          email: dto.email,
          password,
          phone: dto.phone,
          location: dto.location,
          userType: UserType.VENDOR,
          vendor: {
            create: {
              fullName: dto.fullName,
              companyEmail: dto.companyEmail,
              companyName: dto.companyName,
              logo: dto.logo,
              workspaceImages: dto.workspaceImages,
              businessLicense: dto.businessLicense,
              description: dto.businessLicense,
              serviceType: dto.serviceType,
              userAddress: {
                create: {
                  fullAddress: dto.userAddress,
                  cityId: dto.cityId,
                },
              },
            },
          },
        },
        select: {
          userMasterId: true,
          profileImage: true,
          email: true,
          isEmailVerified: true,
          phone: true,
          userType: true,
          location: true,
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
              workspaceImages: true,
              businessLicense: true,
              description: true,
              serviceType: true,
            },
          },
        },
      });
      const response = await this.signToken(user.userMasterId, user.email);
      await this.updateRt(user.userMasterId, response.refreshToken);
      await this.sendEncryptedDataToMail(user, UserType.VENDOR);
      return {
        tokens: response,
        ...user,
      };
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
      const user = await this.prisma.userMaster.create({
        data: {
          email: dto.email,
          password,
          phone: dto.phone,
          location: dto.location,
          userType: UserType.RIDER,
          rider: {
            create: {
              fullName: dto.fullName,
              companyEmail: dto.companyEmail,
              companyName: dto.companyName,
              logo: dto.logo,
              workspaceImages: dto.workspaceImages,
              businessLicense: dto.businessLicense,
              description: dto.businessLicense,
              serviceType: dto.serviceType,
              userAddress: {
                create: {
                  fullAddress: dto.userAddress,
                  cityId: dto.cityId,
                },
              },
            },
          },
        },
        select: {
          userMasterId: true,
          profileImage: true,
          email: true,
          isEmailVerified: true,
          phone: true,
          userType: true,
          location: true,
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
            },
          },
        },
      });
      const response = await this.signToken(user.userMasterId, user.email);
      await this.updateRt(user.userMasterId, response.refreshToken);
      await this.sendEncryptedDataToMail(user, UserType.RIDER);
      // await this.mail.sendUserVerificationEmail(user, UserType.RIDER);
      return {
        tokens: response,
        ...user,
      };
    } catch (error) {
      console.log('error: ', error);
      if (error.code === 'P2002') {
        throw new ForbiddenException('Credentials taken');
      }
      throw error;
    }
  }

  async signinCustomer(dto: LoginDto) {
    const user = await this.prisma.userMaster.findFirst({
      where: {
        email: dto.email,
        userType: UserType.CUSTOMER,
      },
      select: {
        userMasterId: true,
        profileImage: true,
        email: true,
        isEmailVerified: true,
        phone: true,
        userType: true,
        location: true,
        password: true,
        customer: {
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
            customerId: true,
          },
        },
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    const response = await this.signToken(user.userMasterId, user.email);
    await this.updateRt(user.userMasterId, response.refreshToken);
    delete user.password;
    return { tokens: response, ...user };
  }

  async signinVendor(dto: LoginDto) {
    const user = await this.prisma.userMaster.findFirst({
      where: {
        email: dto.email,
        userType: UserType.VENDOR,
      },
      select: {
        userMasterId: true,
        profileImage: true,
        email: true,
        isEmailVerified: true,
        phone: true,
        userType: true,
        location: true,
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
                cityId: true,
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

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    const response = await this.signToken(user.userMasterId, user.email);
    await this.updateRt(user.userMasterId, response.refreshToken);
    const vendor = await this.prisma.vendor.findUnique({
      where: {
        userMasterId: user.userMasterId,
      },
    });
    delete user.password;
    return {
      tokens: response,
      ...user,
      ...vendor,
    };
  }

  async signinRider(dto: LoginDto) {
    const user = await this.prisma.userMaster.findFirst({
      where: {
        email: dto.email,
        userType: UserType.RIDER,
      },
      select: {
        userMasterId: true,
        profileImage: true,
        email: true,
        isEmailVerified: true,
        phone: true,
        userType: true,
        location: true,
        password: true,
        rider: {
          select: {
            riderId: true,
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
                cityId: true,
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

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    const response = await this.signToken(user.userMasterId, user.email);
    await this.updateRt(user.userMasterId, response.refreshToken);
    const rider = await this.prisma.rider.findUnique({
      where: {
        userMasterId: user.userMasterId,
      },
    });
    delete user.password;
    return {
      tokens: response,
      ...user,
      ...rider,
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
        },
      });

      const tokens = await this.signToken(
        previousRefreshToken.userMasterId,
        user.email,
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
      const randomOtp = Math.floor(Math.random() * 100000000);
      const user = await this.prisma.userMaster.findFirst({
        where: {
          email: data.email,
          userType: data.userType,
        },
      });

      if (!user) throw new NotFoundException('Email does not exist.');

      await this.expireOtp(user.userMasterId);

      await this.prisma.otp.create({
        data: {
          userMasterId: user.userMasterId,
          otp: randomOtp,
        },
      });

      await this.mail.sendResetPasswordEmail(data, randomOtp);
      return successResponse(200, 'OTP sent to your email');
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
          isEmailVerified: true,
        },
      });

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
      const otp = await this.prisma.otp.findUnique({
        where: {
          otp: data.otp,
        },
        select: {
          expired: true,
          createdAt: true,
          userMasterId: true,
        },
      });

      if (!otp) {
        throw new NotFoundException('OTP does not exist');
      }

      if (otp.expired) {
        throw new RequestTimeoutException('OTP has already expired');
      }

      if (dayjs().diff(otp.createdAt, 'minute') > 9) {
        await this.prisma.otp.update({
          where: {
            otp: data.otp,
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

  // async logout() {}

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const jwtSecret = this.config.get('JWT_SECRET');
    const jwtRefreshSecret = this.config.get('JWT_REFRESH_SECRET');

    const [at, rt] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: '15m',
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

    await this.mail.sendUserVerificationEmail(user, userType, encrypted);
  }
}
