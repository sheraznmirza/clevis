import { Days } from '@prisma/client';
import dayjs from 'dayjs';
import { VendorSchedule } from 'src/modules/app/vendor/dto';

type Schedule = {
  // id: number;
  day: Days;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export const setAlwaysOpen = (schedule: VendorSchedule[]): Schedule[] => {
  // const startTime = new Date();
  // const endTime = new Date();

  // startTime.setHours(24, 0, 0);
  // endTime.setHours(23, 59, 59);
  const startTime = '00:00';
  const endTime = '23:59';

  const twentyFourSevenWeek = schedule.map((today) => {
    return {
      // id: today.id,
      day: today.day,
      startTime: startTime,
      endTime: endTime,
      isActive: true,
    };
  });

  return twentyFourSevenWeek;
};

export const convertDateTimeToTimeString = (
  schedule: VendorSchedule[],
): Schedule[] => {
  // const startTime = new Date();
  // const endTime = new Date();

  // startTime.setHours(24, 0, 0);
  // endTime.setHours(23, 59, 59);

  const datefor = schedule.map((today) => {
    return {
      // id: today.id,
      day: Days.Monday,
      startTime: dayjs(today.startTime).format('HH:mm'),
      endTime: dayjs(today.endTime).format('HH:mm'),
      isActive: today.isActive,
    };
  });
  console.log('datefor: ', datefor);
  return datefor;
};
