const MAIL_HOST = 'smtp.office365.com';
// const MAIL_USER = 'info@meritadvisor.com';
// const MAIL_PASSWORD = 'E8Ybu9$$!@zw9#4tLCLE';
// const MAIL_FROM = 'info@meritadvisor.com';

const MAIL_USER = 'sheraznabimirza@hotmail.com';
const MAIL_PASSWORD = 'hcet4a97';
const MAIL_FROM = 'sheraznabimirza@hotmail.com';

const COPYRIGHT_YEAR = 2023;

export const MAIL_ENV = {
  MAIL_HOST: MAIL_HOST,
  MAIL_USER: MAIL_USER,
  MAIL_PASSWORD: MAIL_PASSWORD,
  MAIL_FROM: MAIL_FROM,
  COPYRIGHT_YEAR: COPYRIGHT_YEAR,
  MAIL_TRANSPORT: `smtp://${MAIL_USER}:${MAIL_PASSWORD}@${MAIL_HOST}`,
};
