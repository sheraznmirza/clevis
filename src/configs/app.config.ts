import { config } from 'dotenv';
config();

const AppConfig = {
  APP: {
    NAME: 'API',
    PORT: Number(process.env.APP_PORT),
    DEBUG: Boolean(process.env.APP_DEBUG),
    LOG_LEVEL: Number(process.env.APP_LOG_LEVEL),
    TOKEN_EXPIRATION: Number(process.env.APP_TOKEN_EXPIRATION),
    REMEMBER_TOKEN:
      Number(process.env.APP_REMEMBER_TOKEN_EXPIRATION) ?? 7776000,
  },
  DATABASE: {
    URL: process.env.APP_DATABASE_URL,
  },
  REDIS: {
    HOST: process.env.APP_REDIS_HOST,
    PORT: Number(process.env.APP_REDIS_PORT),
  },
  AWS: {
    ACCESS_KEY: process.env.APP_AWS_ACCESS_KEY,
    SECRET_KEY: process.env.APP_AWS_SECRET_KEY,
    REGION: process.env.APP_AWS_REGION,
    BUCKET: process.env.APP_AWS_BUCKET,
    BUCKET_BASE_URL: process.env.APP_AWS_BUCKET_BASE_URL,
    STS_ROLE_ARN: process.env.APP_AWS_STS_ROLE_ARN,
    QUEUE_URL: process.env.APP_AWS_QUEUE_URL,
    SES_FROM_EMAIL: process.env.APP_AWS_SES_FROM_EMAIL,
  },
  TWILIO: {
    ACCOUNT_SID: process.env.APP_TWILIO_ACCOUNT_SID,
    AUTH_TOKEN: process.env.APP_TWILIO_AUTH_TOKEN,
    FROM_NUMBER: process.env.APP_TWILIO_FROM_NUMBER,
  },
  OAUTH: {
    GOOGLE: process.env.APP_GOOGLE_OAUTH_ENDPOINT,
    APPLE: process.env.APP_APPLE_OAUTH_ENDPOINT,
    FACEBOOK: process.env.APP_FACEBOOK_OAUTH_ENDPOINT,
  },
  NOTIFICATION: {
    FCM: {
      PROJECT_ID: process.env.APP_FIREBASE_PROJECT_ID || '',
      CLIENT_EMAIL: process.env.APP_FIREBASE_CLIENT_EMAIL || '',
      PRIVATE_KEY:
        process.env.APP_FIREBASE_PRIVATE_KEY?.replace(/\\n/gm, '\n') || '',
    },
    ONE_SIGNAL: {
      APP_KEY: process.env.APP_ONE_SIGNAL_APP_KEY || '',
      USER_KEY: process.env.APP_ONE_SIGNAL_USER_KEY || '',
      APP_ID: process.env.APP_ONE_SIGNAL_APP_ID || '',
    },
  },
  E_SIGNATURE: {
    DOCUSIGN_ACCOUNT_ID: process.env.APP_DOCUSIGN_ACCOUNT_ID,
    DOCUSIGN_OAUTH_BASE_PATH: process.env.APP_DOCUSIGN_OAUTH_BASE_URL,
    DOCUSIGN_OAUTH_CALLBACK_PATH: process.env.APP_DOCUSIGN_OAUTH_CALLBACK_URL,
    DOCUSIGN_BASE_PATH: process.env.APP_DOCUSIGN_BASE_URL,
    DOCUSIGN_INTEGRATION_KEY: process.env.APP_DOCUSIGN_INTEGRATION_KEY,
    DOCUSIGN_SECRET_KEY: process.env.APP_DOCUSIGN_SECRET_KEY,
    DOCUSIGN_WEB_RETURN_URL: process.env.APP_DOCUSIGN_WEB_RETURN_URL,
    DOCUSIGN_RETURN_URL: process.env.APP_DOCUSIGN_RETURN_URL,
    DOCUSIGN_WEBHOOK_SECRET: process.env.APP_DOCUSIGN_WEBHOOK_SECRET,
  },
  IN_APP_PURCHASE: {
    GOOGLE: {
      IAP_GOOGLE_EMAIL: process.env.APP_IAP_GOOGLE_EMAIL,
      IAP_GOOGLE_SECRET_KEY: process.env.APP_IAP_GOOGLE_SECRET_KEY.replace(
        /\\n/gm,
        '\n',
      ),
      IAP_ANDROID_PACKAGE_NAME: process.env.APP_IAP_ANDROID_PACKAGE_NAME,
    },
    APPLE: {
      IAP_APPLE_SECRET_KEY: process.env.APP_IAP_APPLE_SECRET_KEY.replace(
        /\\n/gm,
        '\n',
      ),
    },
  },
  PAYMENT: {
    STRIPE: {
      SECRET_KEY: process.env.APP_STRIPE_SECRET_KEY,
      CURRENCY: process.env.APP_STRIPE_CURRENCY,
      WEBHOOK: process.env.APP_STRIPE_WEBHOOK_KEY,
    },
    PAYPAL: {
      CLIENT_ID: process.env.APP_PAYPAL_CLIENT_ID,
      CLIENT_SECRET: process.env.APP_PAYPAL_CLIENT_SECRET,
      MODE: process.env.APP_PAYPAL_ENVIRONMENT,
      WEBHOOK_ID: process.env.APP_PAYPAL_WEBHOOK_ID,
      RETURN_URL: process.env.APP_PAYPAL_RETURN_URL,
      CANCEL_URL: process.env.APP_PAYPAL_CANCEL_URL,
    },
  },
  CHAT_SESSION: Number(process.env.APP_CHAT_SESSION_EXPIRATION),
};

export default AppConfig;
