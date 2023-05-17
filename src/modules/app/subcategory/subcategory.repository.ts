import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { SubcategoryCreateDto, SubcategoryUpdateDto } from './dto';
import {
  ListingParams,
  ServiceCategorySubCategoryListingParams,
} from '../../../core/dto';

@Injectable()
export class SubcategoryRepository {
  constructor(private prisma: PrismaService) {}

  async createSubcategory(data: SubcategoryCreateDto) {
    try {
      await this.prisma.subCategory.create({
        data: {
          subCategoryName: data.subCategoryName,
          serviceType: data.serviceType,
        },
      });

      return true;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Subcategory is already created');
      }
      return false;
    }
  }

  async updateSubcategory(id: number, data: SubcategoryUpdateDto) {
    try {
      return await this.prisma.subCategory.update({
        where: {
          subCategoryId: id,
        },
        data: {
          ...(data.subCategoryName && {
            subCategoryName: data.subCategoryName,
          }),
          ...(data.serviceType && { serviceType: data.serviceType }),
        },
      });
    } catch (error) {
      return false;
    }
  }

  async getSubcategory(id: number) {
    try {
      return await this.prisma.subCategory.findUnique({
        where: {
          subCategoryId: id,
        },
      });
    } catch (error) {
      return false;
    }
  }

  async getAllSubcategory(
    listingParams: ServiceCategorySubCategoryListingParams,
  ) {
    const { page = 1, take = 10, search, serviceType } = listingParams;

    try {
      const subCategories = await this.prisma.subCategory.findMany({
        take: +take,
        skip: +take * (+page - 1),
        orderBy: {
          subCategoryName: 'asc',
        },
        where: {
          isDeleted: false,
          ...(search && {
            subCategoryName: {
              contains: search,
            },
          }),
          serviceType: serviceType,
        },
      });
      const totalCount = await this.prisma.subCategory.count({
        where: {
          isDeleted: false,
          ...(serviceType && {
            serviceType: serviceType,
          }),
        },
      });

      return {
        data: subCategories,
        page,
        take,
        totalCount,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteSubcategory(id: number) {
    try {
      await this.prisma.subCategory.update({
        where: {
          subCategoryId: id,
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
