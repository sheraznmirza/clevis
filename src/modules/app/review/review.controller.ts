import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard';
import { RolesGuard } from 'src/core/guards';
import { UserType } from '@prisma/client';
import { Authorized } from 'src/core/decorators';
import { GetUserType } from 'src/core/dto';
import { GetUser } from '../auth/decorator';

@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Authorized(UserType.CUSTOMER)
  @Post()
  create(
    @GetUser() user: GetUserType,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.create(user, createReviewDto);
  }

  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(+id);
  }

  @Patch(':reviewId')
  update(
    @Param('reviewId') id: string,
    @GetUser() user: GetUserType,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewService.update(id, updateReviewDto, user);
  }

  @Delete(':reviewId')
  remove(@Param('reviewId') id: string, @GetUser() user: GetUserType) {
    return this.reviewService.remove(id, user);
  }
}
