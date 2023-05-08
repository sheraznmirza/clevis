import {
  UseGuards,
  Body,
  Param,
  Controller,
  Post,
  Patch,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryCreateDto, CategoryUpdateDto } from './dto';
import { JwtGuard } from '../auth/guard';
import { UserType } from '@prisma/client';
import { Authorized } from '../../../core/decorators';
import { RolesGuard } from '../../../core/guards';
import { ApiTags } from '@nestjs/swagger';
import { ListingParams } from '../../../core/dto';

@ApiTags('Category')
@Controller('category')
// @UseGuards(JwtGuard, RolesGuard)
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  // @Authorized(UserType.ADMIN)
  @Post()
  createCategory(@Body() data: CategoryCreateDto) {
    return this.categoryService.createCategory(data);
  }

  @Authorized(UserType.ADMIN)
  @Patch('/:id')
  updateCategory(@Param('id') id: number, @Body() data: CategoryUpdateDto) {
    return this.categoryService.updateCategory(id, data);
  }

  @Authorized([UserType.ADMIN, UserType.VENDOR])
  @Get('/:id')
  getCategory(@Param('id') id: number) {
    return this.categoryService.getCategory(id);
  }

  @Authorized([UserType.ADMIN, UserType.VENDOR])
  @Get()
  getAllCategory(@Query() listingParams: ListingParams) {
    return this.categoryService.getAllCategory(listingParams);
  }

  // @Authorized([UserType.ADMIN, UserType.VENDOR])
  // @Get()
  // getAllCategory() {
  //   return this.categoryService.getAllCategory();
  // }

  @Authorized(UserType.ADMIN)
  @Delete('/:id')
  deleteCategory(@Param('id') id: number) {
    return this.categoryService.deleteCategory(id);
  }
}
