import { Days } from '@prisma/client';

type Schedule = {
  day: Days;
  startTime: string;
  endTime: string;
  isActive?: boolean;
};

export const companySchedule = (): Schedule[] => {
  const startTime = '09:00';
  const endTime = '21:00';

  return [
    {
      day: Days.Monday,
      startTime: startTime,
      endTime: endTime,
    },
    {
      day: Days.Tuesday,
      startTime: startTime,
      endTime: endTime,
    },
    {
      day: Days.Wednesday,
      startTime: startTime,
      endTime: endTime,
    },
    {
      day: Days.Thursday,
      startTime: startTime,
      endTime: endTime,
    },
    {
      day: Days.Friday,
      startTime: startTime,
      endTime: endTime,
    },
    {
      day: Days.Saturday,
      startTime: startTime,
      endTime: endTime,
      isActive: false,
    },
    {
      day: Days.Sunday,
      startTime: startTime,
      endTime: endTime,
      isActive: false,
    },
  ];
};
