import { Injectable, BadRequestException } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CategoryCreateDto, CategoryUpdateDto } from './dto';
import {
  ListingParams,
  ServiceCategorySubCategoryListingParams,
} from '../../../core/dto';

@Injectable()
export class CategoryService {
  constructor(private repository: CategoryRepository) {}

  async createCategory(data: CategoryCreateDto) {
    try {
      const category = await this.repository.createCategory(data);
      if (!category) {
        throw new BadRequestException('Unable to create this category');
      }
      return { statusCode: 201, message: 'Category Successfully Created' };
    } catch (error) {
      throw error;
    }
  }

  async updateCategory(id: number, data: CategoryUpdateDto) {
    try {
      return await this.repository.updateCategory(id, data);
    } catch (error) {
      throw error;
    }
  }

  async getCategory(id: number) {
    try {
      return await this.repository.getCategory(id);
    } catch (error) {
      throw error;
    }
  }

  async getAllCategory(listingParams: ServiceCategorySubCategoryListingParams) {
    try {
      return await this.repository.getAllCategory(listingParams);
    } catch (error) {
      throw error;
    }
  }

  async deleteCategory(id: number) {
    try {
      return await this.repository.deleteCategory(id);
    } catch (error) {
      throw error;
    }
  }
}
