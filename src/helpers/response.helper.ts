import { BadRequestException, ForbiddenException } from '@nestjs/common';

export const successResponse = (statusCode: number, message: string) => {
  return {
    statusCode,
    message,
  };
};

export const unknowError = (
  statusCode: number,
  error: any,
  message: string,
) => {
  if (error.code === 'P2025') {
    throw new BadRequestException('The following parameter does not exist');
  } else if (error.code === 'P2002') {
    throw new ForbiddenException('already exist');
  }
  return {
    statusCode,
    error,
    message,
  };
};

// export const errorResponse = (error : prismaerr) = {
//   return {
//     error.code
//   }
// }
