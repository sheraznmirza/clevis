import { Controller, Get } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { Authorized } from 'src/core/decorators';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { GetUser } from '../auth/decorator';
import { GetUserType } from 'src/core/dto';

@Controller('earning')
export class EarningController {
  constructor(private readonly prisma: PrismaService) {}

  @Authorized(UserType.ADMIN)
  @Get()
  getAllEarnings(@GetUser() user: GetUserType) {}
}
