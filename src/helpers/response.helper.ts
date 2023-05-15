export const successResponse = (statusCode: number, message: string) => {
  return {
    statusCode,
    message,
  };
};

// export const errorResponse = (error : prismaerr) = {
//   return {
//     error.code
//   }
// }
