import { Module } from '@nestjs/common';
import { OnesignalController } from './onesignal.controller';
import { OnesignalService } from './onesignal.service';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { UsersRepository } from 'src/users/users.repository';
// import { NotificationModule } from 'src/notification/notification.module';
// import { UserRelationRepository } from 'src/users/user-relation.repository';
// import { ClassEnrolledRepository } from 'src/enrolled-course/class-enrolled/class-enrolled.respository';
// import { EnrolledCourseRepository } from 'src/enrolled-course/enrolled-course.respository';
import { NotificationModule } from '../app/notification/notification.module';
@Module({
  imports: [
    // TypeOrmModule.forFeature([
    //     UsersRepository,
    //     UserRelationRepository,
    //     ClassEnrolledRepository,
    //     EnrolledCourseRepository,
    //   ]),
    NotificationModule,
  ],
  controllers: [OnesignalController],
  providers: [OnesignalService],
  exports: [OnesignalService],
})
export class OnesignalModule {}
