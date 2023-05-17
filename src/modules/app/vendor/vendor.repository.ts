import {
  ForbiddenException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UpdateVendorDto,
  UpdateVendorScheduleDto,
  VendorCreateServiceDto,
  VendorUpdateStatusDto,
} from './dto';
import { Media, UserType, Vendor } from '@prisma/client';
import { ListingParams, VendorListingParams } from 'src/core/dto';
import { successResponse } from 'src/helpers/response.helper';
// import { CategoryCreateDto, CategoryUpdateDto } from './dto';

@Injectable()
export class VendorRepository {
  constructor(private prisma: PrismaService) {}

  async createVendorService(dto: VendorCreateServiceDto, userMasterId) {
    try {
      debugger;
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
      const vendor = await this.prisma.vendor.update({
        where: {
          vendorId: id,
        },
        data: {
          status: dto.status,
        },
      });
      const user = await this.prisma.userMaster.findFirst({
        where: { vendor: { vendorId: vendor.vendorId } },
        select: { userType: true },
      });
      return { ...user, ...vendor };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new BadRequestException(
          'The vendor with this vendorId does not exist',
        );
      } else {
        throw error;
      }
    }
  }

  async updateVendorSchedule(vendorId: number, dto: UpdateVendorScheduleDto) {
    try {
      console.log('dto: ', dto.companySchedule);
      dto.companySchedule.forEach(async (element) => {
        await this.prisma.companySchedule.update({
          where: {
            id: element.id,
          },
          data: {
            startTime: element.startTime,
            endTime: element.endTime,
            isActive: element.isActive,
          },
        });
      });

      const scheduleArray = await this.prisma.companySchedule.findMany({
        where: {
          vendorId: vendorId,
        },
        orderBy: {
          id: 'asc',
        },
        select: {
          id: true,
          day: true,
          startTime: true,
          endTime: true,
          isActive: true,
        },
      });
      return {
        ...successResponse(200, 'Schedule updated successfully!'),
        data: scheduleArray,
        alwaysOpen: dto.alwaysOpen,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateVendor(userMasterId: number, dto: UpdateVendorDto) {
    try {
      let profilePicture: Media;

      if (dto.profilePicture) {
        profilePicture = await this.prisma.media.create({
          data: {
            name: dto.profilePicture.name,
            key: dto.profilePicture.key,
            location: dto.profilePicture.location,
          },
        });
      }

      if (dto.bankingId) {
        await this.prisma.banking.update({
          where: {
            id: dto.bankingId,
          },
          data: {
            isDeleted: true,
          },
        });
      }

      if (dto.userAddressId) {
        await this.prisma.userAddress.update({
          where: {
            userAddressId: dto.userAddressId,
          },
          data: {
            isDeleted: true,
          },
        });
      }

      const vendor = await this.prisma.userMaster.update({
        where: {
          userMasterId: userMasterId,
        },
        data: {
          phone: dto.phone !== null ? dto.phone : undefined,
          profilePictureId: profilePicture ? profilePicture.id : undefined,
          isActive: dto.isActive !== null ? dto.isActive : undefined,
          vendor: {
            update: {
              fullName: dto.fullName !== null ? dto.fullName : undefined,
              companyName:
                dto.companyName !== null ? dto.companyName : undefined,
              companyEmail:
                dto.companyEmail !== null ? dto.companyEmail : undefined,

              ...(dto.fullAddress &&
                dto.cityId &&
                dto.longitude &&
                dto.latitude && {
                  userAddress: {
                    create: {
                      fullAddress: dto.fullAddress,
                      cityId: dto.cityId,
                      latitude: dto.latitude,
                      longitude: dto.longitude,
                    },
                  },
                }),

              ...(dto.accountNumber &&
                dto.accountTitle &&
                dto.bankName && {
                  banking: {
                    create: {
                      accountTitle:
                        dto.accountTitle !== null
                          ? dto.accountTitle
                          : undefined,
                      accountNumber:
                        dto.accountNumber !== null
                          ? dto.accountNumber
                          : undefined,
                      bankName:
                        dto.bankName !== null ? dto.bankName : undefined,
                    },
                  },
                }),
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
          isActive: true,

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
              vendorService: {
                select: {
                  vendorServiceId: true,
                  service: {
                    select: {
                      serviceName: true,
                    },
                  },
                },
              },
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
                where: {
                  isDeleted: false,
                },
                select: {
                  id: true,
                  accountNumber: true,
                  accountTitle: true,
                  bankName: true,
                  isDeleted: true,
                },
              },
              fullName: true,
              companyName: true,
              serviceType: true,
              userAddress: {
                where: {
                  isDeleted: false,
                },
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
          earnings: {
            select: {
              id: true,
              jobType: true,
              serviceType: true,
              status: true,
            },
          },
        },
      });

      return {
        ...successResponse(200, 'Vendor updated successfully.'),
        ...vendor,
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllVendorService(vendorId: number, listingParams: ListingParams) {
    const { page = 1, take = 10, search } = listingParams;
    try {
      debugger;
      return await this.prisma.vendorService.findMany({
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
              vendorService: {
                select: {
                  vendorServiceId: true,
                  status: true,
                  description: true,
                  vendorId: true,
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
                where: {
                  isDeleted: false,
                },
                select: {
                  id: true,
                  accountNumber: true,
                  accountTitle: true,
                  bankName: true,
                  isDeleted: true,
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
              companySchedule: {
                select: {
                  id: true,
                  day: true,
                  startTime: true,
                  endTime: true,
                  isActive: true,
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
          isActive: true,
          vendor: {
            select: {
              vendorId: true,
              vendorService: {
                select: {
                  vendorServiceId: true,
                  service: {
                    select: {
                      serviceName: true,
                    },
                  },
                },
              },
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
                  id: true,
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
          earnings: {
            select: {
              id: true,
              jobType: true,
              serviceType: true,
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
          isActive: true,
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
          vendor: {
            status:
              listingParams.status !== null ? listingParams.status : undefined,
          },
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
      debugger;
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
