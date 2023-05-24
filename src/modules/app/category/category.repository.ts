import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { CategoryCreateDto, CategoryUpdateDto } from './dto';
import {
  ListingParams,
  ServiceCategorySubCategoryListingParams,
} from '../../../core/dto';
import { successResponse, unknowError } from 'src/helpers/response.helper';

@Injectable()
export class CategoryRepository {
  constructor(private prisma: PrismaService) {}

  async createCategory(data: CategoryCreateDto) {
    try {
      await this.prisma.category.create({
        data: {
          categoryName: data.categoryName,
          serviceType: data.serviceType,
        },
      });

      return true;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Category is already created');
      }
      return false;
    }
  }

  async updateCategory(id: number, data: CategoryUpdateDto) {
    try {
      const category = await this.prisma.category.update({
        where: {
          categoryId: id,
        },

        data: {
          ...(data.categoryName && { categoryName: data.categoryName }),
          ...(data.serviceType && { serviceType: data.serviceType }),
        },
      });
      return {
        ...successResponse(200, 'Category updated successfully'),
        ...category,
      };
    } catch (error) {
      return unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
    }
  }

  async getCategory(id: number) {
    try {
      return await this.prisma.category.findUnique({
        where: {
          categoryId: id,
        },
      });
    } catch (error) {
      return false;
    }
  }

  async getAllCategory(listingParams: ServiceCategorySubCategoryListingParams) {
    const { page = 1, take = 10, search, serviceType } = listingParams;
    try {
      const category = await this.prisma.category.findMany({
        take: +take,
        skip: +take * (+page - 1),
        orderBy: {
          createdAt: 'desc',
        },
        ...(search && {
          where: {
            isDeleted: false,
            categoryName: {
              contains: search,
            },
          },
        }),
      });

      const totalCount = await this.prisma.category.count({
        where: {
          isDeleted: false,
          ...(serviceType && {
            serviceType: serviceType,
          }),
        },
      });

      return {
        data: category,
        page,
        take,
        totalCount,
      };
    } catch (error) {
      throw error;
    }
  }

  // async getAllCategory() {
  //   try {
  //     return await this.prisma.category.findMany();
  //   } catch (error) {
  //     return false;
  //   }
  // }

  async deleteCategory(id: number) {
    try {
      await this.prisma.category.update({
        where: {
          categoryId: id,
        },
        data: {
          isDeleted: true,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
