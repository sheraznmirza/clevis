import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VendorCreateServiceDto, VendorUpdateStatusDto } from './dto';
import { ServiceType, UserType, Vendor } from '@prisma/client';
import { VendorListingParams } from 'src/core/dto';
// import { CategoryCreateDto, CategoryUpdateDto } from './dto';

@Injectable()
export class RiderRepository {
  constructor(private prisma: PrismaService) {}

  async createVendorService(dto: VendorCreateServiceDto, userMasterId) {
    try {
      const vendor = await this.prisma.vendor.findUnique({
        where: {
          userMasterId,
        },
      });

      const response = await this.createCarWashVendorService(dto, vendor);

      console.log('response: ', response);
      console.log('vendor: ', vendor);
      //   await this.prisma.category.create({
      //     data: {
      //       categoryName: dto.categoryName,
      //       serviceType: dto.serviceType,
      //     },
      //   });

      return true;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('VendorService is already created');
      }
      throw new error();
    }
  }

  async approveVendor(id: number, dto: VendorUpdateStatusDto) {
    try {
      return await this.prisma.vendor.update({
        where: {
          vendorId: id,
        },
        data: {
          status: dto.status,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateCategory(id: number, data) {
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

  async getAllVendors(listingParams: VendorListingParams) {
    const { page = 1, take = 10, search } = listingParams;
    try {
      const vendors = await this.prisma.userMaster.findMany({
        take: take,
        skip: take * (page - 1),
        orderBy: {
          createdAt: 'desc',
        },

        where: {
          isDeleted: false,
          isEmailVerified: true,
          userType: UserType.VENDOR,
          ...(search.length && {
            vendor: {
              fullName: {
                contains: search,
              },
            },
          }),
        },
      });

      return {
        ...vendors,
        page,
        take,
        totalCount: await this.prisma.category.count(),
      };
    } catch (error) {
      return false;
    }
  }

  async deleteVendorService(id: number) {
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

  async createCarWashVendorService(
    dto: VendorCreateServiceDto,
    vendor: Vendor,
  ) {
    try {
      const vendorService = await this.prisma.vendorService.create({
        data: {
          vendorId: vendor.vendorId,
          serviceId: dto.serviceId,
          description: dto.description,
          serviceImages: dto.serviceImages,
        },
        select: {
          vendorServiceId: true,
        },
      });

      await this.prisma.allocatePrice.createMany({
        data: dto.allocatePrice.map((item) => ({
          ...item,
          vendorServiceId: vendorService.vendorServiceId,
        })),
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  //   async createLaundryVendorService(
  //     dto: VendorCreateServiceDto,
  //     vendor: Vendor,
  //   ) {
  //     return await this.prisma.vendorService.create({
  //       data: {},
  //     });
  //   }
}
