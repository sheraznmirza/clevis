import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { successResponse, unknowError } from 'src/helpers/response.helper';
import {
  AdminGetBookingsDto,
  CreateBookingDto,
  CustomerGetBookingsDto,
  UpdateBookingStatusParam,
  VendorGetBookingsDto,
} from './dto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import { UserAddress } from '@prisma/client';

@Injectable()
export class BookingRepository {
  constructor(private prisma: PrismaService) {}

  async createBooking(customerId, dto: CreateBookingDto) {
    try {
      let pickupLocationId: UserAddress;
      let dropoffLocationId: UserAddress;

      const attachments = [];

      if (dto.attachments && dto.attachments.length > 0) {
        dto.attachments.forEach(async (item) => {
          const result = await this.prisma.media.create({
            data: item,
            select: {
              id: true,
            },
          });
          attachments.push(result);
        });
      }

      if (dto.pickupLocation && !dto.pickupLocation.userAddressId) {
        pickupLocationId = await this.prisma.userAddress.create({
          data: {
            latitude: dto.pickupLocation.latitude,
            longitude: dto.pickupLocation.longitude,
            cityId: dto.pickupLocation.cityId,
            customerId,
            fullAddress: dto.pickupLocation.fullAddress,
          },
        });
        dto.pickupLocation.userAddressId = pickupLocationId.userAddressId;
      }

      if (dto.dropoffLocation && !dto.dropoffLocation.userAddressId) {
        dropoffLocationId = await this.prisma.userAddress.create({
          data: {
            latitude: dto.dropoffLocation.latitude,
            longitude: dto.dropoffLocation.longitude,
            cityId: dto.dropoffLocation.cityId,
            customerId,
            fullAddress: dto.dropoffLocation.fullAddress,
          },
        });
        dto.dropoffLocation.userAddressId = dropoffLocationId.userAddressId;
      }

      const bookingDetailPrice: number[] = [];
      for (let i = 0; i < dto.articles.length; i++) {
        const allocatePricePrice = await this.prisma.allocatePrice.findUnique({
          where: {
            id: dto.articles[i].allocatePriceId,
          },
          select: {
            price: true,
          },
        });

        bookingDetailPrice.push(
          dto.articles[i].quantity * allocatePricePrice.price,
        );
      }

      let totalPrice = 0;
      for (let i = 0; i < dto.articles.length; i++) {
        totalPrice += bookingDetailPrice[i];
      }

      const bookingMaster = await this.prisma.bookingMaster.create({
        data: {
          customerId,
          vendorId: dto.vendorId,
          bookingDate: dto.bookingDate,
          ...(dto.instructions && { instructions: dto.instructions }),
          totalPrice: totalPrice,
          ...(dto.pickupLocation &&
            dto.pickupLocation.timeFrom &&
            dto.dropoffLocation &&
            dto.pickupLocation.timeTill && {
              dropffLocationId: dto.dropoffLocation.userAddressId,
              pickupLocationId: dto.pickupLocation.userAddressId,
              pickupTimeFrom: dayjs(dto.pickupLocation.timeFrom).utc().format(),
              pickupTimeTo: dayjs(dto.pickupLocation.timeTill).utc().format(),
              dropoffTimeFrom: dayjs(dto.dropoffLocation.timeFrom)
                .utc()
                .format(),
              dropoffTimeTo: dayjs(dto.dropoffLocation.timeTill).utc().format(),
            }),
        },
        // select: {

        // }
      });

      // const bookingDetailPrice = dto.articles.map(async (bookingDetail) => {

      // })

      await this.prisma.bookingDetail.createMany({
        data: dto.articles.map((bookingDetail, index) => ({
          bookingMasterId: bookingMaster.bookingMasterId,
          allocatePriceId: bookingDetail.allocatePriceId,
          price:
            bookingDetailPrice && bookingDetailPrice.length > 0
              ? bookingDetailPrice[index]
              : 1,
          quantity: bookingDetail.quantity,
        })),
      });

      if (attachments && attachments.length > 0) {
        await this.prisma.bookingAttachments.createMany({
          data: attachments.map((item) => ({
            bookingMasterId: bookingMaster.bookingMasterId,
            mediaId: item.id,
          })),
        });
      }

      return successResponse(201, 'Booking created successfully.');
    } catch (error) {
      throw error;
    }
  }

  async getCustomerBookings(customerId: number, dto: CustomerGetBookingsDto) {
    const { page = 1, take = 10, search } = dto;
    try {
      const bookings = await this.prisma.bookingMaster.findMany({
        where: {
          customerId: customerId,
          ...(search && {
            vendor: {
              companyName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          }),
        },
        take: +take,
        skip: +take * (+page - 1),
        select: {
          isDeleted: true,
        },
      });

      const totalCount = await this.prisma.bookingMaster.count({
        where: {
          customerId: customerId,
          ...(search && {
            vendor: {
              companyName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          }),
        },
      });

      return { data: bookings, page: +page, take: +take, totalCount };
    } catch (error) {
      return unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
    }
  }

  async getCustomerBookingById(bookingMasterId: number) {
    try {
      return await this.prisma.bookingMaster.findUnique({
        where: {
          bookingMasterId: bookingMasterId,
        },
        select: {
          bookingMasterId: true,
          bookingDetail: {
            select: {
              quantity: true,
              allocatePrice: {
                select: {
                  id: true,
                  category: {
                    select: {
                      categoryName: true,
                    },
                  },
                  subcategory: {
                    select: {
                      subCategoryName: true,
                    },
                  },
                  vendorService: {
                    select: {
                      service: {
                        select: {
                          serviceName: true,
                        },
                      },
                      serviceImage: {
                        select: {
                          media: {
                            select: {
                              name: true,
                              location: true,
                              key: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          pickupLocation: {
            select: {
              fullAddress: true,
            },
          },
          dropoffLocation: {
            select: {
              fullAddress: true,
            },
          },
          pickupTimeFrom: true,
          pickupTimeTo: true,
          dropoffTimeFrom: true,
          dropoffTimeTo: true,
          totalPrice: true,
          instructions: true,

          isDeleted: true,
          bookingDate: true,
          status: true,

          bookingAttachments: {
            select: {
              media: {
                select: {
                  name: true,
                  key: true,
                  location: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException('The following booking does not exist');
      }
      throw error;
    }
  }

  async getVendorBookings(vendorId: number, dto: VendorGetBookingsDto) {
    const { page = 1, take = 10, search } = dto;
    try {
      const bookings = await this.prisma.bookingMaster.findMany({
        where: {
          vendorId: vendorId,

          ...(search && {
            OR: [
              {
                customer: {
                  fullName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                bookingDetail: {
                  every: {
                    allocatePrice: {
                      vendorService: {
                        service: {
                          serviceName: {
                            contains: search,
                            mode: 'insensitive',
                          },
                        },
                      },
                    },
                  },
                },
              },
            ],
          }),

          ...(dto.status && {
            status: dto.status,
          }),
          ...(dto.dateFrom &&
            dto.dateTill && {
              bookingDate: {
                gte: dto.dateFrom,
                lte: dto.dateTill,
              },
            }),
        },
        take: +take,
        skip: +take * (+page - 1),
        select: {
          bookingMasterId: true,
          customer: {
            select: {
              fullName: true,
            },
          },
          bookingDetail: {
            select: {
              allocatePrice: {
                select: {
                  vendorService: {
                    select: {
                      service: {
                        select: {
                          serviceName: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          totalPrice: true,
          isDeleted: true,
          bookingDate: true,
          status: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalCount = await this.prisma.bookingMaster.count({
        where: {
          vendorId: vendorId,

          ...(search && {
            OR: [
              {
                customer: {
                  fullName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                bookingDetail: {
                  every: {
                    allocatePrice: {
                      vendorService: {
                        service: {
                          serviceName: {
                            contains: search,
                            mode: 'insensitive',
                          },
                        },
                      },
                    },
                  },
                },
              },
            ],
          }),

          ...(dto.status && {
            status: dto.status,
          }),
          ...(dto.dateFrom &&
            dto.dateTill && {
              bookingDate: {
                gte: dto.dateFrom,
                lte: dto.dateTill,
              },
            }),
        },
      });

      return { data: bookings, page: +page, take: +take, totalCount };
    } catch (error) {
      return unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
    }
  }

  async getVendorBookingById(bookingMasterId: number) {
    try {
      return await this.prisma.bookingMaster.findUnique({
        where: {
          bookingMasterId: bookingMasterId,
        },
        select: {
          bookingMasterId: true,
          customer: {
            select: {
              fullName: true,
              userMaster: {
                select: {
                  phone: true,
                },
              },
              userAddress: {
                select: {
                  fullAddress: true,
                },
              },
            },
          },
          bookingDetail: {
            select: {
              quantity: true,
              allocatePrice: {
                select: {
                  id: true,
                  category: {
                    select: {
                      categoryName: true,
                    },
                  },
                  subcategory: {
                    select: {
                      subCategoryName: true,
                    },
                  },
                  vendorService: {
                    select: {
                      service: true,
                      serviceImage: {
                        select: {
                          media: {
                            select: {
                              name: true,
                              location: true,
                              key: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          pickupLocation: {
            select: {
              fullAddress: true,
            },
          },
          dropoffLocation: {
            select: {
              fullAddress: true,
            },
          },
          pickupTimeFrom: true,
          pickupTimeTo: true,
          dropoffTimeFrom: true,
          dropoffTimeTo: true,
          totalPrice: true,
          instructions: true,

          isDeleted: true,
          bookingDate: true,
          status: true,
        },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException('The following booking does not exist');
      }
      throw error;
    }
  }

  async updateVendorBookingStatus(
    bookingMasterId: number,
    dto: UpdateBookingStatusParam,
  ) {
    try {
      await this.prisma.bookingMaster.update({
        where: {
          bookingMasterId,
        },
        data: {
          status: dto.bookingStatus,
        },
      });
      return successResponse(
        200,
        `Booking status changed to ${dto.bookingStatus}`,
      );
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException('The following booking does not exist');
      }
      throw error;
    }
  }

  async getAdminBookings(dto: AdminGetBookingsDto) {
    const { page = 1, take = 10, search } = dto;
    try {
      const bookings = await this.prisma.bookingMaster.findMany({
        where: {
          ...(search && {
            OR: [
              {
                customer: {
                  fullName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                vendor: {
                  fullName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }),

          ...(dto.status && {
            status: dto.status,
          }),
          ...(dto.dateFrom &&
            dto.dateTill && {
              bookingDate: {
                gte: dto.dateFrom,
                lte: dto.dateTill,
              },
            }),
        },
        take: +take,
        skip: +take * (+page - 1),
        select: {
          bookingMasterId: true,
          customer: {
            select: {
              fullName: true,
            },
          },
          vendor: {
            select: {
              fullName: true,
              serviceType: true,
            },
          },
          pickupTimeFrom: true,
          totalPrice: true,
          status: true,
          isDeleted: true,
        },
      });

      const totalCount = await this.prisma.bookingMaster.count({
        where: {
          ...(search && {
            OR: [
              {
                customer: {
                  fullName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                vendor: {
                  fullName: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }),

          ...(dto.status && {
            status: dto.status,
          }),
          ...(dto.dateFrom &&
            dto.dateTill && {
              bookingDate: {
                gte: dto.dateFrom,
                lte: dto.dateTill,
              },
            }),
        },
      });

      return { data: bookings, page: +page, take: +take, totalCount };
    } catch (error) {
      return unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
    }
  }

  async getAdminBookingById(bookingMasterId: number) {
    try {
      return await this.prisma.bookingMaster.findUnique({
        where: {
          bookingMasterId: bookingMasterId,
        },
        select: {
          bookingMasterId: true,
          customer: {
            select: {
              fullName: true,
              userMaster: {
                select: {
                  email: true,
                  phone: true,
                },
              },
              userAddress: {
                select: {
                  fullAddress: true,
                },
              },
            },
          },
          vendor: {
            select: {
              fullName: true,
              companyName: true,
              userMaster: {
                select: {
                  email: true,
                  phone: true,
                },
              },
              userAddress: {
                select: {
                  fullAddress: true,
                },
              },
            },
          },
          bookingDetail: {
            select: {
              quantity: true,
              allocatePrice: {
                select: {
                  id: true,
                  price: true,
                  category: {
                    select: {
                      categoryName: true,
                    },
                  },
                  subcategory: {
                    select: {
                      subCategoryName: true,
                    },
                  },
                  vendorService: {
                    select: {
                      service: {
                        select: {
                          serviceName: true,
                        },
                      },
                      serviceImage: {
                        select: {
                          media: {
                            select: {
                              name: true,
                              location: true,
                              key: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          pickupLocation: {
            select: {
              fullAddress: true,
            },
          },
          dropoffLocation: {
            select: {
              fullAddress: true,
            },
          },
          pickupTimeFrom: true,
          pickupTimeTo: true,
          dropoffTimeFrom: true,
          dropoffTimeTo: true,
          totalPrice: true,
          instructions: true,

          isDeleted: true,
          bookingDate: true,
          status: true,
        },
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new BadRequestException('The following booking does not exist');
      }
      throw error;
    }
  }

  async deleteBooking(id: number) {
    try {
      const user = await this.prisma.userMaster.findUnique({
        where: {
          userMasterId: id,
        },
        select: {
          isDeleted: true,
        },
      });
      if (!user.isDeleted) {
        await this.prisma.userMaster.update({
          where: {
            userMasterId: id,
          },
          data: {
            isDeleted: true,
          },
        });
        return successResponse(200, 'Customer deleted successfully.');
      } else {
        return successResponse(200, 'Customer is already deleted .');
      }
    } catch (error) {
      return unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
    }
  }
}
