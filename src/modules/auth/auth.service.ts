import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CustomerSignUpDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UserMaster, UserType } from '@prisma/client';
import { VendorSignUpDto } from './dto/vendor-signup.dto';
import { LoginDto } from './dto/login.dto';
import { RiderSignUpDto } from './dto/rider-signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
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
                  // cityId: dto.cityId,
                },
              },
            },
          },
        },
        include: {
          customer: {
            select: {
              userAddress: true,
              fullName: true,
              customerId: true,
            },
          },
        },
      });
      const response = await this.signToken(user.userMasterId, user.email);
      await this.updateRtHash(user.userMasterId, response.refreshToken);
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
        include: {
          customer: {
            select: {
              userAddress: true,
              fullName: true,
              customerId: true,
            },
          },
        },
      });
      const response = await this.signToken(user.userMasterId, user.email);
      await this.updateRtHash(user.userMasterId, response.refreshToken);
      return response;
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
        include: {
          customer: {
            select: {
              userAddress: true,
              fullName: true,
              customerId: true,
            },
          },
        },
      });
      const response = await this.signToken(user.userMasterId, user.email);
      await this.updateRtHash(user.userMasterId, response.refreshToken);
      return response;
    } catch (error) {
      console.log('error: ', error);
      if (error.code === 'P2002') {
        throw new ForbiddenException('Credentials taken');
      }
      throw error;
    }
  }

  async signinCustomer(dto: LoginDto) {
    const user: UserMaster = await this.prisma.userMaster.findFirst({
      where: {
        email: dto.email,
        userType: UserType.CUSTOMER,
      },
    });
    if (!user) throw new ForbiddenException('Credentials incorrect');

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    const response = await this.signToken(user.userMasterId, user.email);
    await this.updateRtHash(user.userMasterId, response.refreshToken);
    return { ...response, ...user };
  }

  async signinVendor(dto: LoginDto) {
    const user: UserMaster = await this.prisma.userMaster.findFirst({
      where: {
        email: dto.email,
        userType: UserType.VENDOR,
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    const response = await this.signToken(user.userMasterId, user.email);
    await this.updateRtHash(user.userMasterId, response.refreshToken);
    const vendor = await this.prisma.vendor.findUnique({
      where: {
        userMasterId: user.userMasterId,
      },
    });
    return { ...response, ...vendor };
  }

  async signinRider(dto: LoginDto) {
    const user: UserMaster = await this.prisma.userMaster.findFirst({
      where: {
        email: dto.email,
        userType: UserType.RIDER,
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    const response = await this.signToken(user.userMasterId, user.email);
    await this.updateRtHash(user.userMasterId, response.refreshToken);
    const rider = await this.prisma.rider.findUnique({
      where: {
        userMasterId: user.userMasterId,
      },
    });
    return { ...response, ...rider };
  }

  // async forgotPassword(dto: { email: string }) {}

  // async refreshTokens(rt: string) {

  // }

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

  // async saveUserType(dto: CustomerSignUpDto, user: UserMaster) {
  //   switch (dto.userType) {
  //     case 'CUSTOMER':
  //       const customer = await this.prisma.customer.create({
  //         data: {
  //           fullName: dto.fullName,
  //           userMasterId: user.userMasterId,
  //         },
  //       });
  //       return customer;
  //       break;

  //     case 'VENDOR':
  //       // const vendor = await this.prisma.vendor.create({
  //       //   data: {
  //       //     fullName: dto.fullName,
  //       //     userMasterId: user.userMasterId,
  //       //   },
  //       // });
  //       // return vendor;
  //       break;

  //     case 'RIDER':
  //       break;

  //     default:
  //       break;
  //   }
  // }

  async updateRtHash(userId: number, rt: string) {
    const hash = await argon.hash(rt);

    await this.prisma.refreshToken.create({
      // where: {
      //   userMasterId: userId,
      // },
      data: {
        refreshToken: hash,
        userMasterId: userId,
      },
    });
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
}
