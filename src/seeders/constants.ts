import { UserType } from '@prisma/client';

export const roles = [
  {
    name: 'ADMIN',
    userType: UserType.ADMIN,
  },
  {
    name: 'CUSTOMER',
    userType: UserType.CUSTOMER,
  },
  {
    name: 'RIDER',
    userType: UserType.RIDER,
  },
  {
    name: 'VENDOR',
    userType: UserType.VENDOR,
  },
];
