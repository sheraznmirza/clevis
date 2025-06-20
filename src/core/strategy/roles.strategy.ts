import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'roles') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const user = await this.prisma.userMaster.findUnique({
      where: {
        userMasterId: payload.sub,
      },
      select: {
        userMasterId: true,
        createdAt: true,
        updatedAt: true,
        email: true,
        // firstName: true,
        // lastName: true,
        // bookmarks: true,
        // _count: true,
      },
    });
    return user;
  }
}
