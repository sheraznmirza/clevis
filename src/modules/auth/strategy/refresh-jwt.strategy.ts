import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: number; email: string }) {
    const refreshToken = req.get('authorization').replace('Bearer', '').trim();

    // const user = await this.prisma.userMaster.findUnique({
    //   where: {
    //     userMasterId: payload.sub,
    //   },
    //   select: {
    //     userMasterId: true,
    //     createdAt: true,
    //     updatedAt: true,
    //     email: true,
    //     // firstName: true,
    //     // lastName: true,
    //     // bookmarks: true,
    //     // _count: true,
    //   },
    // });

    return {
      ...payload,
      refreshToken,
    };
  }
}
