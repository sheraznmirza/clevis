import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { SubcategoryCreateDto, SubcategoryUpdateDto } from './dto';
import { ListingParams } from 'src/core/dto';

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
      await this.prisma.subCategory.update({
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

  async getAllSubcategory(listingParams: ListingParams) {
    const { page = 1, take = 10, search } = listingParams;

    try {
      const subCategories = await this.prisma.subCategory.findMany({
        take: take,
        skip: take * (page - 1),
        orderBy: {
          subCategoryName: 'asc',
        },
        ...(search.length && {
          where: {
            isDeleted: false,
            subCategoryName: {
              contains: search,
            },
          },
        }),
      });

      return {
        ...subCategories,
        page,
        take,
        totalCount: await this.prisma.subCategory.count(),
      };
    } catch (error) {
      return false;
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
