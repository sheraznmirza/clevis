import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { ListingParams } from 'src/core/dto';

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
        page,
        take,
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
        page,
        take,
        totalCount,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
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
        page,
        take,
        totalCount,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
