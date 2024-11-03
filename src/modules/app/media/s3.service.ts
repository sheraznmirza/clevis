// import {
//   GetObjectCommand,
//   HeadObjectCommand,
//   PutObjectAclCommand,
//   DeleteObjectCommand,
//   S3Client,
// } from '@aws-sdk/client-s3';
// import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { Injectable } from '@nestjs/common';
// // import { MediaType } from '@prisma/client';
// import AppConfig from 'src/configs/app.config';
// import { v4 as uuid } from 'uuid';
// @Injectable()
// export default class S3Service {
//   private _s3Client: S3Client = null;
//   private _stsClient: STSClient = null;

//   constructor() {
//     this._s3Client = new S3Client({
//       credentials: {
//         accessKeyId: AppConfig.AWS.ACCESS_KEY,
//         secretAccessKey: AppConfig.AWS.SECRET_KEY,
//       },
//       region: AppConfig.AWS.REGION,
//     });

//     this._stsClient = new STSClient({
//       credentials: {
//         accessKeyId: AppConfig.AWS.ACCESS_KEY,
//         secretAccessKey: AppConfig.AWS.SECRET_KEY,
//       },
//       region: AppConfig.AWS.REGION,
//     });
//   }

//   private _createUniqueFileName(name: string): string {
//     return uuid() + '__' + encodeURIComponent(name.replace(/ /g, '+'));
//   }

//   private _generateS3ResourceARN(resource: string) {
//     return `arn:aws:s3:::${AppConfig.AWS.BUCKET}/${resource}`;
//   }

//   private _generateUniqueRoleSessionName(id: number) {
//     return `mediaupload-${id}`;
//   }

//   private _generateSTSPolicy(resource: string) {
//     return {
//       Version: '2012-10-17',
//       Statement: [
//         {
//           Sid: 'VisualEditor0',
//           Effect: 'Allow',
//           Action: [
//             's3:PutObject',
//             's3:AbortMultipartUpload',
//             's3:PutObjectAcl',
//             's3:GetObject',
//             's3:ListMultipartUploadParts',
//           ],
//           Resource: this._generateS3ResourceARN(resource),
//         },
//       ],
//     };
//   }

//   public CreateUniqueFilePath(fileName: string, type: any): string {
//     const date = new Date();
//     return `media/${type}/${date.getFullYear()}/${
//       date.getMonth() + 1
//     }/${date.getDate()}/${date.getMilliseconds()}__${this._createUniqueFileName(
//       fileName,
//     )}`;
//   }

//   async GetFileUploadPermissions(path: string, mediaId: number) {
//     const command = new AssumeRoleCommand({
//       RoleArn: AppConfig.AWS.STS_ROLE_ARN,
//       RoleSessionName: this._generateUniqueRoleSessionName(mediaId),
//       DurationSeconds: 60 * 60,
//       Policy: JSON.stringify(this._generateSTSPolicy(path)),
//     });
//     const { Credentials } = await this._stsClient.send(command);

//     return {
//       accessKeyId: Credentials.AccessKeyId,
//       secretAccessKey: Credentials.SecretAccessKey,
//       sessionToken: Credentials.SessionToken,
//       filePath: path,
//     };
//   }

//   async GetObjectHead(path: string) {
//     const command = new HeadObjectCommand({
//       Bucket: AppConfig.AWS.BUCKET,
//       Key: path,
//     });
//     const result = await this._s3Client.send(command);

//     return {
//       contentType: result.ContentType,
//       contentLength: result.ContentLength / 1024, // KB
//     };
//   }

//   async UpdateObjectAccess(path: string, access: 'public-read' | 'private') {
//     const command = new PutObjectAclCommand({
//       Bucket: AppConfig.AWS.BUCKET,
//       Key: path,
//       ACL: access,
//     });
//     await this._s3Client.send(command);
//     return true;
//   }

//   async GetSignedUrl(path: string) {
//     const command = new GetObjectCommand({
//       Bucket: AppConfig.AWS.BUCKET,
//       Key: path,
//     });

//     return await getSignedUrl(this._s3Client, command, { expiresIn: 10800 });
//   }

//   async DeleteObject(path: string) {
//     const command = new DeleteObjectCommand({
//       Bucket: AppConfig.AWS.BUCKET,
//       Key: path,
//     });
//     await this._s3Client.send(command);
//     const s3Object = await this.GetObjectHead(path);
//     if (!s3Object) {
//       return true;
//     }
//     return false;
//   }
// }
