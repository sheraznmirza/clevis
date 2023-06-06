import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { Authorized } from 'src/core/decorators';
import { UserType } from '@prisma/client';
import { RatingSetupDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { RatingSetupService } from './rating-setup.service';

@ApiTags('Rating')
@Controller('rating')
export class RatingSetupController {
  constructor(private ratingSetup: RatingSetupService) {}

  @Authorized(UserType.ADMIN)
  @Patch('/updateRating')
  updateRating(@Body() data: RatingSetupDto) {
    return this.ratingSetup.updateRating(data);
  }

  @Authorized(UserType.ADMIN)
  @Get()
  getAllRating() {
    return this.ratingSetup.getAllRating();
  }
}
