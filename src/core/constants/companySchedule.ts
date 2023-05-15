import { Days } from '@prisma/client';

type Schedule = {
  day: Days;
  startTime: Date;
  endTime: Date;
};

export const companySchedule = (): Schedule[] => {
  const startTime = new Date();
  const endTime = new Date();

  startTime.setHours(9, 0, 0);
  endTime.setHours(21, 0, 0);

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
    },
    {
      day: Days.Sunday,
      startTime: startTime,
      endTime: endTime,
    },
  ];
};
