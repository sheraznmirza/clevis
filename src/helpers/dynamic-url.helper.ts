import { UserType } from '@prisma/client';

export const dynamicUrl = (userType: UserType) => {
  switch (userType) {
    case UserType.RIDER:
      return 'RIDER_URL';
    case UserType.ADMIN:
      return 'ADMIN_URL';
    case UserType.VENDOR:
      return 'VENDOR_URL';
    default:
      break;
  }
};
