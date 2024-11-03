import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

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
  if (error?.code === 'P2025') {
    throw new BadRequestException('The following parameter does not exist');
  } else if (error?.code === 'P2002') {
    throw new ForbiddenException('already exist');
  } else if (error?.status !== 417 && statusCode === 417) {
    throw new HttpException(message, HttpStatus.EXPECTATION_FAILED);
  }
  throw new HttpException(error?.message || message, statusCode);
};
