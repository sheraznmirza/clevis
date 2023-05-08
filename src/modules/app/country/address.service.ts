import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async getCountries(search?: string) {
    try {
      const countries = await this.prisma.country.findMany({
        orderBy: {
          countryName: 'asc',
        },
      });

      if (!countries) {
        throw new NotFoundException('Countries not found');
      }
      return countries;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getStates(countryId: string, search?: string) {
    try {
      const states = await this.prisma.state.findMany({
        where: {
          countryId,
          //   ...(search.length && {
          //     stateName: {
          //       contains: search,
          //     },
          //   }),
        },
        orderBy: {
          stateName: 'asc',
        },
      });

      if (!states) {
        throw new NotFoundException('States not found');
      }
      return states;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCities(stateId: string, search?: string) {
    try {
      const cities = await this.prisma.city.findMany({
        where: {
          stateId,
        },
        orderBy: {
          cityName: 'asc',
        },
      });

      if (!cities) {
        throw new NotFoundException('Cities not found');
      }
      return cities;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
