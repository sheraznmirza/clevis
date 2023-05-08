import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../modules/prisma/prisma.service';
// import { RouteCreateDto } from './dto';
import { successResponse } from '../../../helpers/response.helper';
import { CreateNotificationDto } from './dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createNotification(dto: CreateNotificationDto) {
    try {
      const route = await this.prisma.notification.create({
        data: dto,
      });
      if (!route) {
        throw new BadRequestException('Unable to create this notification');
      }
      return successResponse(201, 'Notification created successfully');
    } catch (error) {
      throw error;
    }
  }

  // async updateService(id: number, data: ServiceUpdateDto) {
  //   try {
  //     return await this.prisma.updateService(id, data);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async getService(id: number) {
  //   try {
  //     return await this.prisma.getService(id);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async getAllNotifications(id: number) {
    try {
      return await this.prisma.notification.findMany({
        where: {
          toUser: id,
        },
      });
    } catch (error) {}
  }

  // async deleteService(id: number) {
  //   try {
  //     return await this.prisma.deleteService(id);
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
