import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { GetUserType, ListingParams } from 'src/core/dto';
import { addressUpdateDto } from './dto/addressUpdateDto';
import { addressCreateDto } from './dto/addressCreateDto';
import { successResponse, unknowError } from 'src/helpers/response.helper';
import { GetCityStateDto } from './dto/cityDetailDto';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async getCountries(listingParams: ListingParams) {
    const { page = 1, take = 10, search } = listingParams;
    try {
      const countries = await this.prisma.country.findMany({
        take: +take,
        skip: +take * (+page - 1),
        where: {
          countryName: {
            contains: search !== null ? search : undefined,
            mode: 'insensitive',
          },
        },
        orderBy: {
          countryName: 'asc',
        },
      });

      if (!countries) {
        throw new NotFoundException('Countries not found');
      }

      const totalCount = await this.prisma.country.count();

      return {
        data: countries,
        page: +page,
        take: +take,
        totalCount,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getStates(countryId: string, listingParams: ListingParams) {
    const { page = 1, take = 10, search } = listingParams;
    try {
      const states = await this.prisma.state.findMany({
        take: +take,
        skip: +take * (+page - 1),
        where: {
          countryId,
          stateName: {
            contains: search !== null ? search : undefined,
            mode: 'insensitive',
          },
        },
        orderBy: {
          stateName: 'asc',
        },
      });

      if (!states) {
        throw new NotFoundException('States not found');
      }

      const totalCount = await this.prisma.state.count({
        where: { countryId: countryId },
      });
      return {
        data: states,
        page: +page,
        totalCount,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCityDetails(dto: GetCityStateDto) {
    try {
      const cities = await this.prisma.city.findMany({
        where: {
          cityName: {
            contains: dto.cityName,
            mode: 'insensitive',
          },
          State: {
            stateName: {
              contains: dto.stateName,
              mode: 'insensitive',
            },
            country: {
              countryName: {
                contains: dto.countryName,
                mode: 'insensitive',
              },
            },
          },
        },
        select: {
          cityId: true,
          cityName: true,
          State: {
            select: {
              stateId: true,
              stateName: true,
              country: {
                select: {
                  countryId: true,
                  countryName: true,
                },
              },
            },
          },
        },
      });

      const allStates = await this.prisma.state.findMany({
        where: {
          countryId: cities && cities[0].State.country.countryId,
        },
        select: {
          stateId: true,
          stateName: true,
        },
      });

      const filteredCities = cities.map((c) => {
        return {
          cityId: c.cityId,
          cityName: c.cityName,
        };
      });
      return {
        countryId: (cities && cities[0].State.country.countryId) || null,
        allStates,
        filteredCities,
        filteredState: {
          stateId: (cities && cities[0].State.stateId) || null,
          stateName: (cities && cities[0].State.stateName) || null,
        },
      };
    } catch (error) {
      unknowError(417, error, 'Invalid');
    }
  }
  async getCities(stateId: string, listingParams: ListingParams) {
    const { page = 1, take = 10, search } = listingParams;
    try {
      const cities = await this.prisma.city.findMany({
        take: +take,
        skip: +take * (+page - 1),
        where: {
          stateId,
          cityName: {
            contains: search !== null ? search : undefined,
            mode: 'insensitive',
          },
        },
        orderBy: {
          cityName: 'asc',
        },
      });

      if (!cities) {
        throw new NotFoundException('Cities not found');
      }

      const totalCount = await this.prisma.state.count({
        where: { stateId: stateId },
      });

      return {
        data: cities,
        take: +take,
        totalCount,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // async getCityDetails(id: number) {
  //   try {
  //     const countryStateCity = await this.prisma.city.findFirst({
  //       where: { cityId: id },
  //       select: {
  //         cityId: true,
  //         cityName: true,
  //         State: {
  //           select: {
  //             stateId: true,
  //             stateName: true,
  //             country: {
  //               select: {
  //                 countryId: true,
  //                 countryName: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     if (!countryStateCity) {
  //       throw new NotFoundException('City not found');
  //     }
  //     return countryStateCity;
  //   } catch (error) {
  //     if (error.code === 'P2025') {
  //       throw new BadRequestException('City does not exist');
  //     } else {
  //       throw new InternalServerErrorException(error.message);
  //     }
  //   }
  // }

  async getAddressByCustomer(id: number) {
    try {
      const address = await this.prisma.userAddress.findMany({
        where: { customerId: id },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }
      return address;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAddressByVendor(id: number) {
    try {
      const address = await this.prisma.userAddress.findMany({
        where: { vendorId: id },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }
      return address;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAddressByRider(id: number) {
    try {
      const address = await this.prisma.userAddress.findMany({
        where: { riderId: id },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }
      return address;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateAddressByCustomer(
    data: addressUpdateDto,
    id: number,
    userMasterId: number,
  ) {
    try {
      const userAdd = await this.prisma.userAddress.findUnique({
        where: {
          userAddressId: id,
        },
        select: {
          customer: {
            select: {
              userMasterId: true,
            },
          },
        },
      });
      if (userMasterId !== userAdd.customer.userMasterId) {
        throw new ForbiddenException(
          'You are not authorized to update this address',
        );
      }
      const address = await this.prisma.userAddress.update({
        where: { userAddressId: id },
        data: {
          ...(data.fullAddress && { fullAddress: data.fullAddress }),
          ...(data.longitude && { longitude: data.longitude }),
          ...(data.latitude && { latitude: data.latitude }),
        },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }
      return address;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createAddress(data: addressCreateDto, user: GetUserType) {
    try {
      const usertap = user.userType.toLowerCase() + 'Id';
      const userId = {};
      userId[usertap] = user.userTypeId;
      const service = await this.prisma.userAddress.create({
        data: {
          fullAddress: data.fullAddress,
          cityId: data.cityId,
          latitude: data.latitude,
          longitude: data.longitude,
          ...userId,
        },
      });
      return {
        ...successResponse(201, 'Address Successfully Created'),
        ...service,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteaddress(id: number, user: GetUserType) {
    await this.prisma.userAddress.update({
      where: { userAddressId: id },
      data: { isDeleted: true },
    });
    return successResponse(200, 'Address Successfully deleted');
  }
}
