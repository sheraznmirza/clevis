import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendMobileNotificationDto } from './dto/send-notification-mobile.dto';

@Injectable()
export class OnesignalService {
  private ONESIGNALBASEURL: string;
  private ONESIGNALAPPID: string;
  private ONESIGNALAPIKEY: string;

  constructor(
    // @InjectRepository(UsersRepository)
    // private readonly usersRepository: UsersRepository,
    // @InjectRepository(ClassEnrolledRepository)
    // private readonly classEnrolledRepository: ClassEnrolledRepository,
    // @InjectRepository(EnrolledCourseRepository)
    // private readonly enrolledCourseRepository: EnrolledCourseRepository,
    // @InjectRepository(UserRelationRepository)
    // private readonly userRelationRepository: UserRelationRepository,
    // @Inject(NotificationService)
    // private readonly notificationService: NotificationService,
    private configService: ConfigService, // private roomService: RoomService,
  ) {
    this.ONESIGNALBASEURL = this.configService.get('ONE_SIGNAL_BASE_URL');
    this.ONESIGNALAPPID = this.configService.get('ONESIGNAL_APP_ID');
    this.ONESIGNALAPIKEY = this.configService.get('ONESIGNAL_Rest_API_Key');
  }

  async sendNotification(
    sendMobileNotificationDto: SendMobileNotificationDto,
    // user: User,
  ) {
    // const { message, course_id, class_id, subject, user_ids } =
    //   sendMobileNotificationDto;
    // let defaultNotificationObject: INotificationData = {
    //   body: message,
    //   subject: subject,
    //   type: 'latest Updates',
    //   from_user: user.id,
    //   to_user: user.id,
    //   message_updated_at: new Date(),
    //   notificationType: NotificationTypeEnum.MOBILE,
    //   ...(class_id && { class_id: class_id }),
    //   ...(course_id && { course_id: course_id }),
    // };
    // let defaultRoomObject: RoomI = {
    //   name: subject,
    //   // type:ChatType.SINGLE,
    //   notificationMessage: message,
    //   //...(class_id && { class_id: class_id }),
    // };
    // let userData: User[],
    //   notificationsArray: INotificationData[] = [];
    // const playerIds = new Set([]);
    // const roomIds = new Set([]);
    // if (class_id) {
    //   let classAnsUsersData =
    //     await this.classEnrolledRepository.findAllClassEnrolledStudents({
    //       class_id: class_id,
    //     });
    //   userData = classAnsUsersData.map((singleRecord): User => {
    //     return (
    //       singleRecord.student_id !== (null || undefined) &&
    //       singleRecord.student_id
    //     );
    //   }) as User[];
    // } else if (course_id) {
    //   let courseAnsUsersData =
    //     await this.enrolledCourseRepository.findAllEnrolledCourseStudents({
    //       course_id: course_id,
    //       course_request: courseRequest.Approved,
    //     });
    //   defaultRoomObject.course_id = courseAnsUsersData[0]?.course_id;
    //   userData = courseAnsUsersData.map((singleRecord): User => {
    //     return (
    //       singleRecord.student_id !== (null || undefined) &&
    //       singleRecord.student_id
    //     );
    //   }) as User[];
    //   // console.log("Course record I am getting",userData)
    // } else if (user_ids) {
    //   userData = await this.usersRepository.getUserForMobileNotifications({
    //     user_ids: sendMobileNotificationDto.user_ids,
    //   });
    // }
    // // let parentNotidication: ListingApiWrapperDto =
    // //   await this.notificationService.insertNotification(
    // //     defaultNotificationObject,
    // //     false,
    // //   );
    // // defaultNotificationObject.parentNotfication_id = parentNotidication.data.id;
    // for (let i = 0; i < userData.length; i++) {
    //   if (userData[i]?.player_id) {
    //     playerIds.add(userData[i]?.player_id);
    //   }
    //   console.log('userData[i]?.id',userData[i]?.id);
    //   if (userData[i]?.id) {
    //     defaultRoomObject.users = [userData[i]];
    //     let roomData = await this.roomService.createSingleRoom(
    //       { ...defaultRoomObject },
    //       user,
    //     );
    //     defaultNotificationObject.to_user = userData[i]?.id;
    //     defaultNotificationObject.room_id = roomData.id;
    //     notificationsArray.push({ ...defaultNotificationObject });
    //   }
    //   let { parentData } = await this.userRelationRepository.getUserRelations({
    //     student_id: userData[i]?.id,
    //   });
    //   for (let j = 0; j < parentData.length; j++) {
    //     if (parentData[j]?.player_id) {
    //       playerIds.add(parentData[j].player_id);
    //     }
    //     if (parentData[j]?.id) {
    //       defaultRoomObject.users = [parentData[j]];
    //       let roomData = await this.roomService.createSingleRoom(
    //         { ...defaultRoomObject },
    //         user,
    //       );
    //       defaultNotificationObject.to_user = parentData[j]?.id;
    //       defaultNotificationObject.room_id = roomData.id;
    //       notificationsArray.push({ ...defaultNotificationObject });
    //       roomIds.add(roomData.id);
    //     }
    //   }
    // }
    // notificationsArray.length !== 0 &&
    //   (await this.notificationService.createNotifications(notificationsArray));
    // // console.log("users Data",userData,"players ids",playerIds)
    // playerIds.size !== 0 &&
    //   (await this.oneSignalSendNotification(
    //     [...playerIds],
    //     [...roomIds],
    //     subject,
    //     sendMobileNotificationDto.message,
    //   ));
  }

  // async sendNotification(sendMobileNotificationDto: SendMobileNotificationDto) {
  //   try {
  //     const user: any = {};
  //     // UserDocument = await this.usersRepository.findById(userId);
  //     var headers = {
  //       'Content-Type': 'application/json; charset=utf-8',
  //       Authorization: `Basic ${
  //         this.configService.get('ONESIGNAL').ONE_SIGNAL_API_KEY
  //       }`,
  //     };

  //     var options = {
  //       host: 'onesignal.com',
  //       port: 443,
  //       path: '/api/v1/notifications',
  //       method: 'POST',
  //       headers: headers,
  //     };

  //     if (!user) {
  //       return {
  //         statusCode: 404,
  //         success: false,
  //         message: 'User not found',
  //         data: null,
  //       };
  //     }
  //     const config = this.configService.get('ONESIGNAL');
  //     if (
  //       user.notificationIds &&
  //       user.notificationIds !== undefined &&
  //       user.notificationIds !== null &&
  //       user.notificationIds.length > 0 &&
  //       user.notificationStatus === true
  //     ) {
  //       const data = {
  //         app_id: config.ONE_SIGNAL_APP_ID,
  //         contents: { en: content },
  //         include_player_ids: !user.notificationIds ? [] : user.notificationIds,
  //         ios_attachments: {
  //           id1: `${join(process.cwd(), 'src', 'public', 'upload')}${image}`,
  //         },
  //         // large_icon: `${this.configService.get('APP_URL')}/static/${image}`,
  //         large_icon: `http://172.16.202.38:3001/static/${image}`,
  //         // large_icon: `https://cdn-icons-png.flaticon.com/512/603/603197.png`,
  //         big_picture: `${join(
  //           process.cwd(),
  //           'src',
  //           'public',
  //           'upload',
  //         )}${image}`,
  //         redirectTo: redirectTo,
  //         ...other,
  //         // include_player_ids: ['004abf6d-b6d4-4c62-a3a8-16513aaa8ad6'],
  //       };
  //       var https = require('https');
  //       var req = https.request(options, function (res) {
  //         res.on('data', function (data) {});
  //       });

  //       req.on('error', function (e) {
  //         // loggers.info('error........... ', e);
  //       });

  //       req.write(JSON.stringify(data));
  //       req.end();
  //     }
  //     user.haveNewNotification = true;
  //     await user.save();
  //     return {
  //       success: true,
  //       message: 'Notification sent',
  //       statusCode: 200,
  //     };
  //   } catch (err) {
  //     return {
  //       success: false,
  //       message: err,
  //       data: err,
  //       statusCode: 500,
  //     };
  //   }
  // }

  async oneSignalSendNotification(
    usePlayerIds: string[],
    roomIds: string[],
    subject: string,
    message: string,
    imageToSend?: string,
  ) {
    // const redirectTo='';
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Basic ${this.ONESIGNALAPIKEY}`,
    };
    // const data = {
    //   app_id: this.ONESIGNALAPPID,
    //   contents: { en: message },
    //   include_player_ids: usePlayerIds,
    //   ios_attachments: {
    //     id1: imageToSend,
    //   },
    //   large_icon: imageToSend,
    //   big_picture: imageToSend,
    //   data:{
    //     room_id : 1
    //   }
    // redirectTo: redirectTo,
    // include_player_ids: ['004abf6d-b6d4-4c62-a3a8-16513aaa8ad6']/\,
    // };
    try {
      for (let i = 0; i < usePlayerIds.length; i++) {
        const element = usePlayerIds[i];
        const data = {
          app_id: this.ONESIGNALAPPID,
          contents: { en: message },
          include_player_ids: [element],
          ios_attachments: {
            id1: imageToSend,
          },
          large_icon: imageToSend,
          big_picture: imageToSend,
          data: {
            room_id: roomIds[i],
            subject: subject,
          },
          // redirectTo: redirectTo,
          // include_player_ids: ['004abf6d-b6d4-4c62-a3a8-16513aaa8ad6'],
        };
        // await PostRequest(
        //   `${this.ONESIGNALBASEURL}/notifications`,
        //   data,
        //   headers,
        // );
      }

      return true;
    } catch (error) {
      console.log('error getting ', error.message);
      throw new UnprocessableEntityException(
        'Error occured while sending the Mobile Notifications',
      );
    }
  }
}
