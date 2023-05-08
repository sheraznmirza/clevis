import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { CategoryCreateDto, CategoryUpdateDto } from './dto';
import { ListingParams } from '../../../core/dto';

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
      await this.prisma.category.update({
        where: {
          categoryId: id,
        },
        data: {
          ...(data.categoryName && { categoryName: data.categoryName }),
          ...(data.serviceType && { serviceType: data.serviceType }),
        },
      });
    } catch (error) {
      return false;
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

  async getAllCategory(listingParams: ListingParams) {
    const { page = 1, take = 10, search } = listingParams;
    try {
      return await this.prisma.category.findMany({
        take: take,
        skip: take * (page - 1),
        orderBy: {
          createdAt: 'desc',
        },
        ...(search.length && {
          where: {
            isDeleted: false,
            categoryName: {
              contains: search,
            },
          },
        }),
      });
    } catch (error) {
      return false;
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
