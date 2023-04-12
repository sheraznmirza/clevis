const MAIL_HOST = 'smtp.office365.com';
const MAIL_USER = 'info@meritadvisor.com';
const MAIL_PASSWORD = 'E8Ybu9$$!@zw9#4tLCLE';
const MAIL_FROM = 'info@meritadvisor.com';
const COPYRIGHT_YEAR = 2022;

export const MAIL_ENV = {
  MAIL_HOST: MAIL_HOST,
  MAIL_USER: MAIL_USER,
  MAIL_PASSWORD: MAIL_PASSWORD,
  MAIL_FROM: MAIL_FROM,
  COPYRIGHT_YEAR: COPYRIGHT_YEAR,
  MAIL_TRANSPORT: `smtp://${MAIL_USER}:${MAIL_PASSWORD}@${MAIL_HOST}`,
};
