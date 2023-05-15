import { Days } from '@prisma/client';
import dayjs, { Dayjs } from 'dayjs';
type Schedule = {
  day: Days;
  vendorId?: number;
  riderId?: number;
  startTime: Dayjs;
  endTime: Dayjs;
};

export const companySchedule = (vendorId: number) => [
  {
    day: Days.Monday,
    startTime: dayjs(),
    endtime: dayjs(),
  },
];
