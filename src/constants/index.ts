export enum EmailTemplates {
  WELCOME = 'WELCOME',
  FORGET_PASSWORD = 'FORGET_PASSWORD',
}

export enum NotificationSocketType {
  TEST_NOTIFICATION = 'TEST_NOTIFICATION',
  BOOKING_STATUS = 'BOOKING_STATUS',
  CUSTOMER_BOOKING = 'CUSTOMER_BOOKING',
}

export enum NotificationTitle {
  BOOKING_APPROVED = 'Booking Approved!',
  BOOKING_REJECTED = 'Booking Rejected!',
  BOOKING_CREATED = 'Booking Created',
  VENDOR_CREATED = 'Vendor Approvel',
  RIDER_CREATED = 'Rider Approvel',
}

export enum NotificationBody {
  BOOKING_APPROVED = 'Booking Approved by vendor',
  BOOKING_REJECTED = 'Booking Rejected by vendor',
  BOOKING_CREATED = 'Booking Created by Customer',
  RIDER_CREATED = 'Rider Verified Successfully & Waiting for Approvel',
  VENDOR_CREATED = 'Vendor Verified Successfully & Waiting for Approvel',
}

export enum EventType {
  GENERATE_CERTIFICATE = 'GENERATE_CERTIFICATE',
}

export * from './socket';
