import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ServiceType, UserType } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { HttpStatusCode } from 'axios';

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

    if (!user || user.isDeleted)
      throw new HttpException(
        'User does not exist',
        HttpStatusCode.FailedDependency,
      );
    else if (!user.isActive)
      throw new HttpException(
        'Your account has been deactivated',
        HttpStatusCode.FailedDependency,
      );
    else {
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
