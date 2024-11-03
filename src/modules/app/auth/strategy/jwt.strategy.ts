import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ServiceType, UserType } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../../modules/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
    fullName: string;
    userType: UserType;
    userTypeId: number;
    serviceType?: ServiceType;
  }) {
    const user = await this.prisma.userMaster.findFirst({
      where: {
        userMasterId: payload.sub,
      },
      select: {
        isActive: true,
        isDeleted: true,
      },
    });

    if (!user) {
      throw new ForbiddenException('User does not exist');
    } else if (!user.isActive || user.isDeleted) {
      if (payload.userType === UserType.CUSTOMER) {
        await this.prisma.device.updateMany({
          where: {
            userMasterId: payload.sub,
            isDeleted: false,
          },
          data: {
            isDeleted: true,
          },
        });
      }

      await this.prisma.refreshToken.updateMany({
        where: {
          userMasterId: payload.sub,
          deleted: false,
        },
        data: {
          deleted: true,
        },
      });

      if (user.isDeleted) {
        throw new ForbiddenException('User does not exist');
      }

      if (!user.isActive) {
        throw new ForbiddenException('Your account has been deactivated');
      }
    } else {
      return {
        userMasterId: payload.sub,
        email: payload.email,
        fullName: payload.fullName,
        userType: payload.userType,
        userTypeId: payload.userTypeId,
        ...(payload.serviceType && { serviceType: payload.serviceType }),
      };
    }
  }
}
