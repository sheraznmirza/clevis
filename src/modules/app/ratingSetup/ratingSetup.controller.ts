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
import { RatingSetupService } from './ratingsetup.service';

@ApiTags('Rating')
@Controller('rating')
export class RatingSetupController {
  constructor(private ratingSetup: RatingSetupService) {}

  @Authorized([UserType.ADMIN])
  @Get('/:ratingId')
  getRatingById(@Param('ratingId') id: number) {
    return this.ratingSetup.getRatingById(id);
  }

  @Authorized(UserType.ADMIN)
  @Post()
  createRating(@Body() data: RatingSetupDto) {
    return this.ratingSetup.createRating(data);
  }

  @Authorized(UserType.ADMIN)
  @Patch('/:ratingId')
  updateRating(@Param('ratingId') id: number, @Body() data: RatingSetupDto) {
    return this.ratingSetup.updateRating(id, data);
  }

  @Delete('/:ratingId')
  deleteRating(@Param('ratingId') id: number) {
    return this.ratingSetup.deleteRating(id);
  }

  @Authorized(UserType.ADMIN)
  @Get()
  getAllRating() {
    return this.ratingSetup.getAllRating();
  }
}
