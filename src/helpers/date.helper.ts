// import * as dayjs from 'dayjs-timezone';
import { Days } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

export enum AllowDateFormat {
  ISODate = 'YYYY-MM-DD',
  YearMonth = 'YYYY-MM',
  ShortDate = 'MM/DD/YYYY',
  LongDate = 'MMM DD YYYY',
  StringDate = 'YYYY-MM-DDTHH:mm:ss.sssZ',
  DateTime = 'YYYY-MM-DD HH:mm:ss',
  TimeWithOutSeconds = 'LT',
  TimeWithSeconds = 'LTS',
  DD = 'DD',
  MM = 'MM',
  YYYY = 'YYYY',
  YearWeek = 'GGGG-WW',
  Time24HourFormat = 'HH:mm',
  FullMonth = 'MMMM',
  UnixTimeStamp = 'x',
  WeekDay = 'dddd',
}

export function Now() {
  return dayjs().toDate();
}

// export function ConvertDurationToSeconds(duration, unit: dayjs.DurationInputArg2 = 'minutes') {
//     return dayjs.duration(duration, unit).asSeconds();
// }

export function ToTimeStamp(date) {
  return dayjs(date).valueOf();
}

export function IsDateFormatValid(date, format) {
  return dayjs(date, format, true).isValid();
}

export function GetCurrentWeekDay() {
  return dayjs().format('dddd');
}

export function ConvertToDate(dateString: string, format: AllowDateFormat) {
  return dayjs(dateString, format).toDate();
}

// export function IsSameOrAfter(firstDate, secondDate) {
//     return dayjs(firstDate).isSameOrAfter(secondDate);
// }

// export function IsSameOrBefore(firstDate, secondDate) {
//     return dayjs(firstDate).isSameOrBefore(secondDate);
// }

export function IsSame(firstDate, secondDate) {
  return dayjs(firstDate).isSame(secondDate);
}

export function IsBefore(firstDate, secondDate) {
  return dayjs(firstDate).isBefore(secondDate);
}

export function ConvertToSpecificFormat(date: Date, format: AllowDateFormat) {
  return dayjs(date).format(format);
}

export function SubtractDays(date, days) {
  return dayjs(date).subtract(days, 'days').toDate();
}

export function AddMinutes(date, minutes: number) {
  return dayjs(date).add(minutes, 'minutes').toDate();
}

export function AddDays(date, days) {
  return dayjs(date).add(days, 'days').toDate();
}

export function AddMonths(date, month) {
  return dayjs(date).add(month, 'month').toDate();
}

export function SubtractMonths(date, month) {
  return dayjs(date).subtract(month, 'month').toDate();
}

export function AddHours(date, hours) {
  return dayjs(date).add(hours, 'hour').toDate();
}

export function SubtractHours(date, hour) {
  return dayjs(date).subtract(24, 'hour').toDate();
}

export function SubtractYears(date, years) {
  return dayjs(date).subtract(years, 'year').toDate();
}

export function DiffBetweenTwoDates(firstDate, secondDate) {
  return dayjs(secondDate).diff(dayjs(firstDate), 'days');
}

export function DiffBetweenTwoDatesInMinutes(firstDate, secondDate) {
  return dayjs(secondDate).diff(dayjs(firstDate), 'minutes');
}

export function StartDateOfMonth(date) {
  return dayjs(date).startOf('month').toDate();
}

export function EndDateOfMonth(date) {
  return dayjs(date).endOf('month').toDate();
}

export function StartOfDay(date) {
  return dayjs(date).startOf('day').toDate();
}

export function EndOfDay(date) {
  return dayjs(date).endOf('day').toDate();
}

export function StartOfYear(date) {
  return dayjs(date).startOf('year').toDate();
}

export function EndOfYear(date) {
  return dayjs(date).endOf('year').toDate();
}

export function GetDate(date: Date) {
  return dayjs(date).date();
}

export function GetMonth(date: Date) {
  return dayjs(date).month();
}

export function GetYear(date: Date) {
  return dayjs(date).year();
}

// export function GetMomentFromString(dateString, format: AllowDateFormat, tz = 'UTC') {
//     return dayjs.tz(dateString, format, tz);
// }

// export function GetMomentFromTimezone(date: Date, tz) {
//     return dayjs.tz(date, tz);
// }

// export function GetTimezoneDate(date: Date, tz) {
//     return dayjs.tz(date, tz).toDate();
// }

export function GetLastDayOfYear(year) {
  return dayjs(year, 'YYYY').endOf('year').toDate();
}

export function IsFuture(date: Date) {
  return dayjs(date).isAfter(dayjs());
}

// export function getSeries(
//     startDate: dayjs.Moment,
//     endDate: dayjs.Moment,
//     type: dayjs.unitOfTime.DurationConstructor,
// ): string[] {
//     if (startDate.isSameOrAfter(endDate)) {
//         throw new Error('Invalid date range supplied');
//     }

//     let series: string[] = [];
//     let format: string = null;

//     switch (type) {
//         case 'year':
//             format = AllowDateFormat.YYYY;
//             break;
//         case 'month':
//             format = AllowDateFormat.YYYY + '-' + AllowDateFormat.MM;
//             break;
//         case 'week':
//             format = 'gggg-ww';
//             break;
//         default:
//             type = 'day';
//             format = AllowDateFormat.YYYY + '-' + AllowDateFormat.MM + '-' + AllowDateFormat.DD;
//     }

//     while (true) {
//         series.push(startDate.format(format));
//         startDate = startDate.add(1, type as dayjs.unitOfTime.DurationConstructor);
//         if (startDate.isAfter(endDate)) {
//             break;
//         }
//     }
//     return series;
// }

// export function getYearKeys(year) {
//     let startDate = dayjs(year, AllowDateFormat.YYYY).startOf('year');
//     let endDate = startDate.clone().endOf('year');
//     let keys: string[] = getSeries(startDate, endDate, 'month');
//     return keys;
// }

// export function generateLastXMonthKeys(today: dayjs.Moment, Months: number) {
//     let endDate = today;
//     let startDate = today.clone().subtract(Months - 1, 'months');
//     let keys: string[] = getSeries(startDate, endDate, 'month');
//     return keys;
// }

// export function generateWeekIntervalKeysBetweenTwoDates(startDate: Date, endDate: Date) {
//     return getSeries(dayjs(startDate), dayjs(endDate), 'week');
// }

// export function generateDayIntervalKeys(endDate: dayjs.Moment, interval) {
//     let startDate = endDate.clone().subtract(interval - 1, 'days');
//     let keys: string[] = getSeries(startDate, endDate, 'day');
//     return keys;
// }

// export function generateDayIntervalKeysBetweenTwoDates(startDate: Date, endDate: Date) {
//     return getSeries(dayjs(startDate), dayjs(endDate), 'days');
// }
export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}
/**
 * @function
 * @description returns range (start & end datetime) of previous Quarter of the hour or the datetime provided
 */
// export function getPreviousQuarterHourRange(dateTime = dayjs()) {
//   if (typeof dateTime === 'string') {
//     dateTime = dayjs(dateTime, AllowDateFormat.DateTime);
//   }

//   let startTime = dateTime.clone().subtract(15, 'minutes');
//   startTime.minutes(Math.floor(startTime.minutes() / 15) * 15);
//   startTime.seconds(0);

//   let endTime = startTime.clone();
//   endTime.add(15, 'minutes').subtract(1, 'second');

//   return {
//     start: startTime,
//     end: endTime,
//   };
// }

/**
 * @function
 * @description Get available timezones
 * @returns {string[]}
 */
// export function getAvailableTimezones() {
//     return dayjs.tz.names().filter((tz) => {
//         let tzl = tz.toLowerCase();
//         return tzl.indexOf('etc/') === -1 && tzl.indexOf('/') !== -1;
//     });
// }

/**
 * @function
 * @description Get timezones in which day is changed on the given utc date time
 * @returns {string[]}
 */
// export function getDayChangedTimezones(dateTime: dayjs.Moment): string[] {
//     let tzs: string[] = [];

//     return getAvailableTimezones().filter((tz) => {
//         let dt: dayjs.Moment = dateTime.clone();
//         dt.tz(tz).set('seconds', 0);
//         return dt.format('HH:mm:ss') == '00:00:00';
//     });
// }
/**
 * @function
 * @description Get timezones in which week is changed on the given utc date time
 * @returns {string[]}
 */
// export function getWeekChangedTimezones(dateTime: dayjs.Moment): string[] {
//     let tzs: string[] = [];

//     return getDayChangedTimezones(dateTime).filter((tz) => {
//         let dt: dayjs.Moment = dateTime.clone();
//         dt.tz(tz).set('seconds', 0);
//         let dt2 = dt.clone();
//         dt2.subtract('second', 1);
//         return dt.format(AllowDateFormat.YearWeek) != dt2.format(AllowDateFormat.YearWeek);
//     });
// }
/**
 * @function
 * @description Get timezones in which month is changed on the given utc date time
 * @returns {string[]}
 */
// export function getMonthChangedTimezones(dateTime: dayjs.Moment): string[] {
//     let tzs: string[] = [];

//     return getDayChangedTimezones(dateTime).filter((tz) => {
//         let dt: dayjs.Moment = dateTime.clone();
//         dt.tz(tz).set('seconds', 0);
//         let dt2 = dt.clone();
//         dt2.subtract('seconds', 1);
//         return dt.format(AllowDateFormat.YearMonth) != dt2.format(AllowDateFormat.YearMonth);
//     });
// }

export function ConvertMillisecondsToHour(time: number) {
  return (time / (1000 * 60 * 60)) % 24;
}

export function currentDateToVendorFilter(currentDay: string): {
  currentTime: string;
  currentDay: Days;
} {
  const today = dayjs(currentDay).utc().format('dddd');

  // console.log('dayjs: ', dayjs('06:00').tz());

  let enumDays: Days = Days.Monday;
  switch (today) {
    case 'Monday':
      enumDays = Days.Monday;
      break;
    case 'Tuesday':
      enumDays = Days.Tuesday;
      break;
    case 'Wednesday':
      enumDays = Days.Wednesday;
      break;
    case 'Thursday':
      enumDays = Days.Thursday;
      break;
    case 'Friday':
      enumDays = Days.Friday;
      break;
    case 'Saturday':
      enumDays = Days.Saturday;
      break;
    case 'Sunday':
      enumDays = Days.Sunday;
      break;

    default:
      break;
  }

  return {
    currentTime: dayjs(currentDay).utc().format('HH:mm'),
    currentDay: enumDays,
  };
}
