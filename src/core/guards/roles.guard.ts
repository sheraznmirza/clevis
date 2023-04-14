import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    console.log('reflector: ', roles);

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    console.log('request: ', request);

    const validateRequest = (d: unknown) => {
      console.log('request inside validate: ', d);
      return true;
    };

    return validateRequest(request);
  }
}
