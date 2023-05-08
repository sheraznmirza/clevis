import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    if (request) {
      const getUserRole = await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: request.user.userMasterId,
        },
        select: {
          userType: true,
        },
      });

      return roles.indexOf(getUserRole.userType) > -1;
    }

    return false;
  }
}
