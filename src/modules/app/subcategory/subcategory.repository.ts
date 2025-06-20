import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { SubcategoryCreateDto, SubcategoryUpdateDto } from './dto';
import { ServiceCategorySubCategoryListingParams } from '../../../core/dto';
import { successResponse, unknowError } from 'src/helpers/response.helper';
import { ERROR_MESSAGE } from 'src/core/constants';

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
      const subcat = await this.prisma.subCategory.findUnique({
        where: {
          subCategoryId: id,
        },
      });
      if (subcat) {
        return subcat;
      } else {
        return unknowError(417, {}, 'Subcategory does not exist');
      }
    } catch (error) {
      throw unknowError(417, error, ERROR_MESSAGE.MSG_417);
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
          ...(serviceType && {
            serviceType: serviceType,
          }),
        },
      });
      const totalCount = await this.prisma.subCategory.count({
        where: {
          isDeleted: false,
          ...(serviceType && {
            serviceType: serviceType,
          }),

          ...(search && {
            subCategoryName: {
              contains: search,
            },
          }),
        },
      });

      return {
        data: subCategories,
        page: +page,
        take: +take,
        totalCount,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteSubcategory(id: number) {
    try {
      const result = await this.prisma.subCategory.update({
        where: {
          subCategoryId: id,
        },
        data: {
          isDeleted: true,
        },
      });
      if (!result) {
        return unknowError(404, {}, 'Subcategory does not exist');
      } else {
        return successResponse(200, '  successfully deleted');
      }
    } catch (error) {
      throw unknowError(417, error, ERROR_MESSAGE.MSG_417);
    }
  }
}
