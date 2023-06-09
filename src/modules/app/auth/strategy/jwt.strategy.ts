import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ServiceType, UserType } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../../modules/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
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
