import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { unknowError } from 'src/helpers/response.helper';
import { ListingParams } from 'src/core/dto';

@Injectable()
export class AdminRepository {
  constructor(private prisma: PrismaService) {}

  async getUpdateRequests(dto: ListingParams) {
    const { page = 1, take = 10, search } = dto;
    try {
      const requests = await this.prisma.updateApproval.findMany({
        // where: {
        //   ...(search && {
        //     vendor: {
        //       companyName: {
        //         contains: search,
        //         mode: 'insensitive',
        //       },
        //     },
        //   }),
        // },
        take: +take,
        skip: +take * (+page - 1),
        select: {
          companyEmail: true,
          companyName: true,
          status: true,
        },
      });

      const totalCount = await this.prisma.updateApproval.count({
        // where: {
        //   ...(search && {
        //     vendor: {
        //       companyName: {
        //         contains: search,
        //         mode: 'insensitive',
        //       },
        //     },
        //   }),
        // },
      });

      return { data: requests, page: +page, take: +take, totalCount };
    } catch (error) {
      return unknowError(
        417,
        error,
        'The request was well-formed but was unable to be followed due to semantic errors',
      );
    }
  }
}
