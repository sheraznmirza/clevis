import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RiderUpdateStatusDto } from './dto';
import { ServiceType, UserType, Vendor } from '@prisma/client';
import { RiderListingParams, VendorListingParams } from 'src/core/dto';
// import { CategoryCreateDto, CategoryUpdateDto } from './dto';

@Injectable()
export class RiderRepository {
  constructor(private prisma: PrismaService) {}

  async approveRider(id: number, dto: RiderUpdateStatusDto) {
    try {
      return await this.prisma.rider.update({
        where: {
          riderId: id,
        },
        data: {
          status: dto.status,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getRiderByIdProfile(id: number) {
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
          rider: {
            select: {
              riderId: true,
              fullName: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getRiderByIdAccount(id: number) {
    try {
      return await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          userMasterId: true,
          rider: {
            select: {
              riderId: true,
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

  async getRiderByIdCompany(id: number) {
    try {
      return await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          userMasterId: true,
          isEmailVerified: true,
          phone: true,
          rider: {
            select: {
              riderId: true,
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

  async getRiderByIdSchedule(id: number) {
    try {
      return await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          userMasterId: true,
          rider: {
            select: {
              riderId: true,
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

  async getRiderById(id: number) {
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
          rider: {
            select: {
              riderId: true,
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

  async getAllRiders(listingParams: RiderListingParams) {
    const { page = 1, take = 10, search, status } = listingParams;
    try {
      const riders = await this.prisma.userMaster.findMany({
        take: +take,
        skip: +take * (+page - 1),
        orderBy: {
          createdAt: 'desc',
        },

        where: {
          isDeleted: false,
          isEmailVerified: true,
          userType: UserType.RIDER,
          rider: {
            ...(search && {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
              ],
            }),
            status: {
              equals: status !== null ? status : undefined,
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
          rider: {
            select: {
              riderId: true,
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
          userType: UserType.RIDER,
        },
      });

      return {
        data: riders,
        page,
        take,
        totalCount,
      };
    } catch (error) {
      console.log('error: ', error);
      throw error;
    }
  }

  async deleteRider(id: number) {
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
