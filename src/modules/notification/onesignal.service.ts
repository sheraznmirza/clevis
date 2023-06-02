// import { HttpService } from "@nestjs/axios";
// import { Injectable } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import { join } from "path";
// import { UsersService } from "src/users/users.service";
// import { User } from "../users/entities/user.entity";

// @Injectable()
// export class OnesignalService {
//   constructor(private usersService: UsersService) {}

//   async sendNotification(
//     content: string,
//     userId: number,
//     image: string,
//     redirectTo: string = ""
//   ) {
//     try {
//       const user: User = await this.usersService.getUserById(userId);
//       var headers = {
//         "Content-Type": "application/json; charset=utf-8",
//         Authorization: `Basic ${process.env.REST_API_KEY}`,
//       };
//       var options = {
//         host: "onesignal.com",
//         port: 443,
//         path: "/api/v1/notifications",
//         method: "POST",
//         headers: headers,
//       };

//       if (!user) {
//         return {
//           statusCode: 404,
//           success: false,
//           message: "User not found",
//           data: null,
//         };
//       }
//       if (user.push_ids.length > 0) {
//         const data = {
//           app_id: process.env.ONE_SIGNAL_APP_ID,
//           contents: { en: content },
//           include_player_ids:
//             user.push_ids && user.push_ids.length > 0
//               ? user.push_ids.map((push) => {
//                   return [push.push_id];
//                 })
//               : [],
//           ios_attachments: {
//             id1: `${join(
//               __dirname,
//               "..",
//               "..",
//               "..",
//               "public",
//               "storage"
//             )}${image}`,
//           },
//           big_picture: `${join(
//             __dirname,
//             "..",
//             "..",
//             "..",
//             "public",
//             "storage"
//           )}${image}`,
//           redirectTo: redirectTo,
//           // include_player_ids: ['3bc8b871-6aa6-4421-9ddf-4dbb7c0df975'],
//         };
//         var https = require("https");
//         var req = https.request(options, function (res) {
//           res.on("data", function (data) {
//             console.log("Response:");
//             console.log(JSON.parse(data));
//           });
//         });

//         req.on("error", function (e) {
//           console.log("ERROR:");
//           console.log(e);
//         });

//         req.write(JSON.stringify(data));
//         req.end();
//       }
//       return {
//         success: true,
//         message: "Notification sent",
//         statusCode: 200,
//       };
//     } catch (err) {
//       // console.log(err);
//       return {
//         success: false,
//         message: err,
//         data: err,
//         statusCode: 500,
//       };
//     }
//   }

//   async addUserToNotificationList(userId: number, playerId: string) {
//     try {
//       const user: User = await this.usersService.getUserById(userId);

//       if (!user) {
//         return {
//           statusCode: 404,
//           success: false,
//           message: "User not found",
//           data: null,
//         };
//       }
//       if (
//         !playerId ||
//         playerId === undefined ||
//         playerId === null ||
//         playerId === "" ||
//         playerId === "undefined" ||
//         playerId === "null" ||
//         playerId === "NULL"
//       ) {
//         return {
//           statusCode: 400,
//           success: false,
//           message: "Player id is invalid",
//           data: null,
//         };
//       }
//       const result = await this.usersService.addUserPushId(userId, playerId);

//       return {
//         statusCode: 200,
//         success: true,
//         message: "User added to notification list",
//         data: "result",
//       };
//     } catch (err) {
//       return {
//         success: false,
//         message: err.message,
//         data: err,
//         statusCode: 500,
//       };
//     }
//   }

//   async removeUserFromNotificationList(userId: number, playerId: string) {
//     try {
//       const user: User = await this.usersService.getUserById(userId);
//       if (!user) {
//         return {
//           statusCode: 404,
//           success: false,
//           message: "User not found",
//           data: null,
//         };
//       }
//       await this.usersService.removeUserPushId(userId, playerId);
//       return {
//         statusCode: 200,
//         success: true,
//         message: "User removed from notification list",
//         data: "result",
//       };
//     } catch (err) {
//       return {
//         success: false,
//         message: err.message,
//         data: err,
//         statusCode: 500,
//       };
//     }
//   }
// }
