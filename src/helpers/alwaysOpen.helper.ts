import { Days } from '@prisma/client';
import { VendorSchedule } from 'src/modules/app/vendor/dto';

type Schedule = {
  id: number;
  day: Days;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
};

export const setAlwaysOpen = (schedule: VendorSchedule[]): Schedule[] => {
  const startTime = new Date();
  const endTime = new Date();

  startTime.setHours(24, 0, 0);
  endTime.setHours(23, 59, 59);

  const twentyFourSevenWeek = schedule.map((today) => {
    return {
      id: today.id,
      day: today.day,
      startTime: startTime,
      endTime: endTime,
      isActive: true,
    };
  });

  return twentyFourSevenWeek;
};
