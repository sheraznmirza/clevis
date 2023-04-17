import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CategoryCreateDto, CategoryUpdateDto } from './dto';

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

  async getAllCategory(page: number, take: number, search: string) {
    try {
      return await this.prisma.category.findMany({
        take,
        skip: take * page,
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
