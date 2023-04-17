// import { Media } from "./entities/media.entity";
// import { ResponseMediaInterface } from "../utilities/interface";

// export const mediasListingMapper = function (medias: Media[] = []) {
//   if (medias.length > 0) {
//     const modifyMedia: ResponseMediaInterface[] = medias.map((media) => {
//       return {
//         attributes: {
//           type: media?.type,
//           path: `${process.env.APP_URL}/${media?.path}`,
//           createdAt: media?.created_at,
//           updatedAt: media?.updated_at,
//         },
//         id: media?.id,
//       };
//     });
//     return modifyMedia;
//   }
//   return medias;
// };

// export const mediaSingleMapper = function (media: Media | any) {
//   const data: ResponseMediaInterface = {
//     attributes: {
//       type: media?.type,
//       path: `${process.env.APP_URL}/${media?.path}`,
//       createdAt: media?.created_at,
//       updatedAt: media?.updated_at,
//     },
//     id: media?.id,
//   };
//   return data;
// };

// export const mediaRelationSingleMapper = function (media: Media | any) {
//   return {
//     id: media?.id,
//     type: media?.type,
//     path: `${process.env.APP_URL}/${media?.path}`,
//     createdAt: media?.created_at,
//     updatedAt: media?.updated_at,
//   };
// };

// export const mediaRelationListingMapper = function (medias: Media[] = []) {
//   if (medias.length > 0) {
//     return medias.map((media) => {
//       return {
//         id: media?.id,
//         type: media?.type,
//         path: `${process.env.APP_URL}/${media?.path}`,
//         createdAt: media?.created_at,
//         updatedAt: media?.updated_at,
//       };
//     });
//   }
//   return medias;
// };
