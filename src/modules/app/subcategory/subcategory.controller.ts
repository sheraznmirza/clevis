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
import { Authorized, Roles } from '../../../core/decorators';
import { RolesGuard } from '../../../core/guards';
import { ApiTags } from '@nestjs/swagger';
import { ServiceCategorySubCategoryListingParams } from '../../../core/dto';

@ApiTags('Subcategory')
@Controller('subcategory')
@UseGuards(JwtGuard, RolesGuard)
export class SubcategoryController {
  constructor(private subcategoryService: SubcategoryService) {}

  @Authorized(UserType.ADMIN)
  @Post()
  createSubcategory(@Body() data: SubcategoryCreateDto) {
    return this.subcategoryService.createSubcategory(data);
  }

  @Authorized(UserType.ADMIN)
  @Patch('/:id')
  updateService(@Param('id') id: number, @Body() data: SubcategoryUpdateDto) {
    return this.subcategoryService.updateSubcategory(id, data);
  }

  @Authorized([UserType.ADMIN, UserType.VENDOR])
  @Get('/:id')
  getService(@Param('id') id: number) {
    return this.subcategoryService.getSubcategory(id);
  }

  @Authorized([UserType.ADMIN, UserType.VENDOR])
  @Get()
  getAllSubcategory(
    @Query() listingParams: ServiceCategorySubCategoryListingParams,
  ) {
    return this.subcategoryService.getAllSubcategory(listingParams);
  }

  @Authorized(UserType.ADMIN)
  @Delete('/:id')
  deleteService(@Param('id') id: number) {
    return this.subcategoryService.deleteSubcategory(id);
  }
}
