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
import { Roles } from 'src/core/decorators';
import { RolesGuard } from 'src/core/guards';

@Controller('category')
@UseGuards(JwtGuard, RolesGuard)
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Roles(UserType.ADMIN)
  @Post()
  createCategory(@Body() data: CategoryCreateDto) {
    return this.categoryService.createCategory(data);
  }

  @Roles(UserType.ADMIN)
  @Patch('/:id')
  updateCategory(@Param('id') id: number, @Body() data: CategoryUpdateDto) {
    return this.categoryService.updateCategory(id, data);
  }

  @Roles(UserType.ADMIN, UserType.VENDOR)
  @Get('/:id')
  getCategory(@Param('id') id: number) {
    return this.categoryService.getCategory(id);
  }

  @Roles(UserType.ADMIN, UserType.VENDOR)
  @Get()
  getAllCategory(
    @Query('page') page: number,
    @Query('take') take: number,
    @Query('search') search?: string,
  ) {
    return this.categoryService.getAllCategory(page, take, search);
  }

  @Roles(UserType.ADMIN)
  @Delete('/:id')
  deleteCategory(@Param('id') id: number) {
    return this.categoryService.deleteCategory(id);
  }
}
