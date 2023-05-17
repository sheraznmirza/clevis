import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ServiceType, UserType } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../../modules/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
    userType: UserType;
    userTypeId: number;
    serviceType?: ServiceType;
  }) {
    const user = await this.prisma.userMaster.findUnique({
      where: {
        userMasterId: payload.sub,
      },
      select: {
        userMasterId: true,
        userType: true,
        email: true,
      },
    });
    return {
      ...user,
      userTypeId: payload.userTypeId,
      ...(payload.serviceType && { serviceType: payload.serviceType }),
    };
  }
}
