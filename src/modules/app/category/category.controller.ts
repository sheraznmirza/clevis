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
import { Authorized } from 'src/core/decorators';
import { RolesGuard } from 'src/core/guards';
import { ApiTags } from '@nestjs/swagger';

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

  // @Authorized([UserType.ADMIN, UserType.VENDOR])
  // @Get()
  // getAllCategory(
  //   @Query('page') page: number,
  //   @Query('take') take: number,
  //   @Query('search') search?: string,
  // ) {
  //   return this.categoryService.getAllCategory(page, take, search);
  // }

  // @Authorized([UserType.ADMIN, UserType.VENDOR])
  @Get()
  getAllCategory() {
    return this.categoryService.getAllCategory();
  }

  @Authorized(UserType.ADMIN)
  @Delete('/:id')
  deleteCategory(@Param('id') id: number) {
    return this.categoryService.deleteCategory(id);
  }
}
