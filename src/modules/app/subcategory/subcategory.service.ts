import { Injectable, BadRequestException } from '@nestjs/common';
import { SubcategoryRepository } from './subcategory.repository';
import { SubcategoryCreateDto, SubcategoryUpdateDto } from './dto';
import {
  ListingParams,
  ServiceCategorySubCategoryListingParams,
} from '../../../core/dto';

@Injectable()
export class SubcategoryService {
  constructor(private repository: SubcategoryRepository) {}

  async createSubcategory(data: SubcategoryCreateDto) {
    try {
      const subcategory = await this.repository.createSubcategory(data);
      if (!subcategory) {
        throw new BadRequestException('Unable to create this subcategory');
      }
      return { statusCode: 201, message: 'Subcategory Successfully Created' };
    } catch (error) {
      throw error;
    }
  }

  async updateSubcategory(id: number, data: SubcategoryUpdateDto) {
    try {
      return await this.repository.updateSubcategory(id, data);
    } catch (error) {
      throw error;
    }
  }

  async getSubcategory(id: number) {
    try {
      return await this.repository.getSubcategory(id);
    } catch (error) {
      throw error;
    }
  }

  async getAllSubcategory(
    listingParams: ServiceCategorySubCategoryListingParams,
  ) {
    try {
      return await this.repository.getAllSubcategory(listingParams);
    } catch (error) {}
  }

  // async getAllSubcategory() {
  //   try {
  //     return await this.repository.getAllSubcategory();
  //   } catch (error) {}
  // }

  async deleteSubcategory(id: number) {
    try {
      return await this.repository.deleteSubcategory(id);
    } catch (error) {
      throw error;
    }
  }
}
