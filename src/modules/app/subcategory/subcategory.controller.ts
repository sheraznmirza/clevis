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
import { Roles } from '../../../core/decorators';
import { RolesGuard } from '../../../core/guards';
import { ApiTags } from '@nestjs/swagger';
import { ListingParams } from '../../../core/dto';

@ApiTags('Subcategory')
@Controller('subcategory')
// @UseGuards(JwtGuard, RolesGuard)
export class SubcategoryController {
  constructor(private subcategoryService: SubcategoryService) {}

  // @Roles(UserType.ADMIN)
  @Post()
  createSubcategory(@Body() data: SubcategoryCreateDto) {
    return this.subcategoryService.createSubcategory(data);
  }

  // @Roles(UserType.ADMIN)
  @Patch('/:id')
  updateService(@Param('id') id: number, @Body() data: SubcategoryUpdateDto) {
    return this.subcategoryService.updateSubcategory(id, data);
  }

  @Roles(UserType.ADMIN, UserType.VENDOR)
  @Get('/:id')
  getService(@Param('id') id: number) {
    return this.subcategoryService.getSubcategory(id);
  }

  // @Roles(UserType.ADMIN, UserType.VENDOR)
  @Get()
  getAllSubcategory(@Query() listingParams: ListingParams) {
    return this.subcategoryService.getAllSubcategory(listingParams);
  }

  @Roles(UserType.ADMIN)
  @Delete('/:id')
  deleteService(@Param('id') id: number) {
    return this.subcategoryService.deleteSubcategory(id);
  }
}
