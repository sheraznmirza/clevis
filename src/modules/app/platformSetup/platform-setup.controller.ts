import {
  Controller,
  Post,
  Get,
  UseGuards,
  Query,
  Param,
  Patch,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Authorized } from 'src/core/decorators';
` `;
import { UserType } from '@prisma/client';
import { PlatFormSetupDto } from './dto/platform-setup.dto';
import { PlatformSetupService } from './platform-setup.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Platform')
@Controller('platform')
export class PlatformSetupController {
  constructor(private platformService: PlatformSetupService) {}

  @Authorized([UserType.ADMIN])
  @Get('/:platformId')
  getPlatformById(@Param('platformId') id: number) {
    return this.platformService.getPlatormById(id);
  }

  @Authorized(UserType.ADMIN)
  @Post()
  createPlatform(@Body() data: PlatFormSetupDto) {
    return this.platformService.createPlatform(data);
  }

  @Authorized(UserType.ADMIN)
  @Patch('/:platformId')
  updatePlatform(
    @Param('platformId') id: number,
    @Body() data: PlatFormSetupDto,
  ) {
    return this.platformService.updatePlatform(id, data);
  }

  // @Delete('/:platformId')
  // deletePlatform(@Param('platformId') id: number) {
  //   return this.platformService.deletePlatform(id);
  // }

  @Authorized(UserType.ADMIN)
  @Get()
  getAllPlatform() {
    return this.platformService.getAllPlatform();
  }
}
