import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { SubcategoryCreateDto, SubcategoryUpdateDto } from './dto';

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

  async getAllSubcategory(page: number, take: number, search?: string) {
    try {
      return await this.prisma.subCategory.findMany({
        take,
        skip: take * page,
        orderBy: {
          createdAt: 'desc',
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
