import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VendorCreateServiceDto, VendorUpdateStatusDto } from './dto';
import { UserType, Vendor } from '@prisma/client';
import { ListingParams, VendorListingParams } from 'src/core/dto';
// import { CategoryCreateDto, CategoryUpdateDto } from './dto';

@Injectable()
export class VendorRepository {
  constructor(private prisma: PrismaService) {}

  async createVendorService(dto: VendorCreateServiceDto, userMasterId) {
    try {
      const vendor = await this.prisma.vendor.findUnique({
        where: {
          userMasterId,
        },
      });

      await this.createCarWashVendorService(dto, vendor);

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

  async getAllVendorService(vendorId: number, listingParams: ListingParams) {
    const { page = 1, take = 10, search } = listingParams;
    try {
      await this.prisma.vendorService.findMany({
        take: +take,
        skip: +take * (+page - 1),
        where: {
          vendorId: vendorId,
          isDeleted: false,
          service: {
            serviceName: {
              contains: search !== null ? search : undefined,
              mode: 'insensitive',
            },
          },
        },
        select: {
          service: {
            select: {
              serviceName: true,
              VendorService: {
                select: {
                  vendorServiceId: true,
                  status: true,
                  description: true,
                  // serviceImage: {
                  //   select: {
                  //     key: true,
                  //     location: true,
                  //     name: true,
                  //   },
                  // },
                  serviceImage: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getVendorServiceById(vendorServiceId: number) {
    try {
      await this.prisma.vendorService.findUnique({
        where: {
          vendorServiceId: vendorServiceId,
        },
        select: {
          service: {
            select: {
              serviceName: true,
              serviceId: true,
              serviceType: true,
            },
          },
          description: true,
          AllocatePrice: {
            where: {
              vendorServiceId,
            },
            select: {
              category: {
                select: {
                  categoryId: true,
                  categoryName: true,
                },
              },
              subcategory: {
                select: {
                  subCategoryName: true,
                  subCategoryId: true,
                },
              },
              price: true,
            },
          },
          serviceImage: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getVendorByIdProfile(id: number) {
    try {
      return await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          profilePicture: {
            select: {
              key: true,
              location: true,
              name: true,
              id: true,
            },
          },
          vendor: {
            select: {
              vendorId: true,
              fullName: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getVendorByIdCompany(id: number) {
    try {
      return await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          userMasterId: true,
          isEmailVerified: true,
          phone: true,
          vendor: {
            select: {
              vendorId: true,
              fullName: true,
              description: true,
              companyEmail: true,
              companyName: true,
              businessLicense: {
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              workspaceImages: {
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              logo: {
                select: {
                  key: true,
                  location: true,
                  name: true,
                  id: true,
                },
              },
              userAddress: {
                select: {
                  city: {
                    select: {
                      cityName: true,
                      cityId: true,
                      State: {
                        select: {
                          stateName: true,
                          stateId: true,
                          country: {
                            select: {
                              countryName: true,
                              countryId: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  fullAddress: true,
                  latitude: true,
                  longitude: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getVendorByIdAccount(id: number) {
    try {
      return await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          userMasterId: true,
          vendor: {
            select: {
              vendorId: true,
              banking: {
                select: {
                  accountNumber: true,
                  accountTitle: true,
                  bankName: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getVendorByIdSchedule(id: number) {
    try {
      return await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          userMasterId: true,
          vendor: {
            select: {
              vendorId: true,
              banking: {
                select: {
                  accountNumber: true,
                  accountTitle: true,
                  bankName: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getVendorById(id: number) {
    try {
      return await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          roleId: true,
          userType: true,
          phone: true,
          createdAt: true,
          vendor: {
            select: {
              vendorId: true,
              businessLicense: {
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              workspaceImages: {
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              companyEmail: true,
              description: true,
              logo: {
                select: {
                  key: true,
                  location: true,
                  name: true,
                  id: true,
                },
              },
              banking: {
                select: {
                  accountNumber: true,
                  accountTitle: true,
                  bankName: true,
                },
              },
              fullName: true,
              companyName: true,
              serviceType: true,
              userAddress: {
                select: {
                  city: {
                    select: {
                      cityName: true,
                      cityId: true,
                      State: {
                        select: {
                          stateName: true,
                          stateId: true,
                          country: {
                            select: {
                              countryName: true,
                              countryId: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  fullAddress: true,
                  latitude: true,
                  longitude: true,
                },
              },
              status: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getAllVendors(listingParams: VendorListingParams) {
    const { page = 1, take = 10, search, status, serviceType } = listingParams;
    try {
      const vendors = await this.prisma.userMaster.findMany({
        take: +take,
        skip: +take * (+page - 1),
        orderBy: {
          createdAt: 'desc',
        },

        where: {
          isDeleted: false,
          isEmailVerified: true,
          userType: UserType.VENDOR,
          vendor: {
            ...(search && {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
              ],
            }),
            status: {
              equals: status !== null ? status : undefined,
            },
            serviceType: {
              equals: serviceType !== null ? serviceType : undefined,
            },
          },
        },
        select: {
          userMasterId: true,
          email: true,
          isEmailVerified: true,
          roleId: true,
          userType: true,
          phone: true,
          createdAt: true,
          vendor: {
            select: {
              vendorId: true,
              businessLicense: {
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              workspaceImages: {
                select: {
                  media: {
                    select: {
                      key: true,
                      location: true,
                      name: true,
                      id: true,
                    },
                  },
                },
              },
              companyEmail: true,
              description: true,
              logo: {
                select: {
                  key: true,
                  location: true,
                  name: true,
                  id: true,
                },
              },
              fullName: true,
              companyName: true,
              serviceType: true,
              userAddress: {
                select: {
                  city: {
                    select: {
                      cityName: true,
                      cityId: true,
                      State: {
                        select: {
                          stateName: true,
                          stateId: true,
                          country: {
                            select: {
                              countryName: true,
                              countryId: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  fullAddress: true,
                  latitude: true,
                  longitude: true,
                },
              },
              status: true,
            },
          },
        },
      });

      const totalCount = await this.prisma.userMaster.count({
        where: {
          isEmailVerified: true,
          isDeleted: false,
          userType: UserType.VENDOR,
        },
      });

      return {
        data: vendors,
        page,
        take,
        totalCount,
      };
    } catch (error) {
      console.log('error: ', error);
      throw error;
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
      const serviceImages = [];

      dto.serviceImages.forEach(async (serviceImage) => {
        const result = await this.prisma.media.create({
          data: serviceImage,
          select: {
            id: true,
          },
        });
        serviceImages.push(result);
      });

      const vendorService = await this.prisma.vendorService.create({
        data: {
          vendorId: vendor.vendorId,
          serviceId: dto.serviceId,
          description: dto.description,
        },
        select: {
          vendorServiceId: true,
        },
      });

      await this.prisma.workspaceImages.createMany({
        data: serviceImages.map((item) => ({
          vendorServiceId: vendorService.vendorServiceId,
          mediaId: item.id,
        })),
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

  async deleteVendor(id: number) {
    try {
      await this.prisma.userMaster.update({
        where: {
          userMasterId: id,
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

  //   async createLaundryVendorService(
  //     dto: VendorCreateServiceDto,
  //     vendor: Vendor,
  //   ) {
  //     return await this.prisma.vendorService.create({
  //       data: {},
  //     });
  //   }
}
