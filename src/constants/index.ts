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
  ADMIN_APPROVED = 'Admin Approved',
  ADMIN_REJECTED = 'Admin Rejected',
  BOOKING_COMPLETED = 'Booking Completed',
  BOOKING_IN_PROGRESS = 'Booking In_progress',
  VENDOR_UPDATE_BY_ADMIN = 'Vender Update by Admin',
  VENDOR_CREATED_JOB = 'Job Created by Vendor',
}

export enum NotificationBody {
  BOOKING_APPROVED = 'The booking request has been accepted. ',
  BOOKING_REJECTED = 'Booking Rejected by vendor',
  BOOKING_CREATED = 'You have received a new booking request',
  RIDER_CREATED = 'Rider Verified Successfully & Waiting for Approvel',
  VENDOR_CREATED = 'Vendor Verified Successfully & Waiting for Approvel',
  ADMIN_APPROVED = 'Welcome to Clevis.We are happy to have you on board! To start , add in service information to get bookings',
  ADMIN_REJECTED = 'Admin Reject your request',
  BOOKING_COMPLETED = 'The booking {id} has been successfully completed',
  BOOKING_IN_PROGRESS = 'The vendor has marked the booking {id} as In Progress',
  VENDOR_UPDATE_BY_ADMIN = 'Your Profile Information has been updated by the admin.',
  VENDOR_CREATED_JOB = 'Job Created by Vendor ',
  ADMIN_APPROVED_RIDER = 'Welcome to Clevis.You can now start accepting jobs and earning with our platform. Get ready to hit the road',
}

export enum EventType {
  GENERATE_CERTIFICATE = 'GENERATE_CERTIFICATE',
}

export * from './socket';
