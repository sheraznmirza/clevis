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
import { SubcategoryService } from './subcategory.service';
import { SubcategoryCreateDto, SubcategoryUpdateDto } from './dto';
import { JwtGuard } from '../auth/guard';
import { UserType } from '@prisma/client';
import { Roles } from 'src/core/decorators';
import { RolesGuard } from 'src/core/guards';

@Controller('service')
@UseGuards(JwtGuard, RolesGuard)
export class SubcategoryController {
  constructor(private subcategoryService: SubcategoryService) {}

  @Roles(UserType.ADMIN)
  @Post()
  createService(@Body() data: SubcategoryCreateDto) {
    return this.subcategoryService.createSubcategory(data);
  }

  @Roles(UserType.ADMIN)
  @Patch('/:id')
  updateService(@Param('id') id: number, @Body() data: SubcategoryUpdateDto) {
    return this.subcategoryService.updateSubcategory(id, data);
  }

  @Roles(UserType.ADMIN, UserType.VENDOR)
  @Get('/:id')
  getService(@Param('id') id: number) {
    return this.subcategoryService.getSubcategory(id);
  }

  @Roles(UserType.ADMIN, UserType.VENDOR)
  @Get()
  getAllService(
    @Query('page') page: number,
    @Query('take') take: number,
    @Query('search') search?: string,
  ) {
    return this.subcategoryService.getAllSubcategory(page, take, search);
  }

  @Roles(UserType.ADMIN)
  @Delete('/:id')
  deleteService(@Param('id') id: number) {
    return this.subcategoryService.deleteSubcategory(id);
  }
}
