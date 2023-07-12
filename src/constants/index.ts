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
  BOOKING_SENT_CUSTOMER = 'Booking Request Sent',
  JOB_PICKUP_ACCEPT = 'PickUp Accepted',
  JOB_DELIVERY_ACCEPT = ' Delivery Accepted',
  JOB_PICKUP_COMPLETED = 'PickUp Completed',
  JOB_DELIVERY_COMPLETED = 'Delivery completed ',
  BOOKING_APPROVED = 'Booking Approved!',
  BOOKING_REJECTED = 'Booking Rejected!',
  BOOKING_CREATED = 'Booking Created',
  VENDOR_CREATED = 'Vendor Approvel',
  RIDER_CREATED = 'Rider Approvel',
  ADMIN_APPROVED = 'Admin Approved',
  ADMIN_REJECTED = 'Admin Rejected',
  BOOKING_COMPLETED = 'Booking Completed',
  BOOKING_IN_PROGRESS = 'Booking in progress',
  VENDOR_UPDATE_BY_ADMIN = 'Update by Admin',
  VENDOR_CREATED_JOB = 'Job Created',
  RIDER_ACCEPT_JOB = 'Job Request Accepted',
  RIDER_JOB_COMPLETED = 'Job Completed',
  CUSTOMER_CREATE_ACCOUNT = 'Account Created',
  CHANGE_PASSWORD = 'Password Change',
}

export enum NotificationBody {
  BOOKING_SENT_CUSTOMER = 'Your booking request {id} has been sent successfully. Tap to view',
  JOB_PICKUP_ACCEPT = '{rider} is on its ways to pick your order for booking {id}',
  JOB_DELIVERY_ACCEPT = '{rider} is on its ways to deliver your order for booking {id}',
  JOB_PICKUP_COMPLETED = '{rider} has dropped off your laundry for at the vendor for booking {id}.',
  JOB_DELIVERY_COMPLETED = '{rider} has successfully delivered your laundry for booking {id}.',
  BOOKING_APPROVED = 'Hi {name} , Your booking has been confirmed successfully. Please check the details of your booking in Bookings section . ',
  BOOKING_REJECTED = 'Your booking request {Booking} has been rejected. Tap to view',
  BOOKING_CREATED = 'You have received a new booking request',
  RIDER_CREATED = 'Rider Verified Successfully & Waiting for Approvel',
  VENDOR_CREATED = 'Vendor Verified Successfully & Waiting for Approvel',
  ADMIN_APPROVED = 'Welcome to Clevis.We are happy to have you on board! To start , add in service information to get bookings',
  ADMIN_REJECTED = 'Admin Reject your request',
  BOOKING_COMPLETED = 'Your booking {id} has been Completed successfully',
  BOOKING_IN_PROGRESS = 'Your booking {id} is in progress . Tap to view',
  VENDOR_UPDATE_BY_ADMIN = 'Your Profile Information has been updated by the admin.',
  VENDOR_CREATED_JOB = 'Job Created by {vendor}',
  ADMIN_APPROVED_RIDER = 'Welcome to Clevis.{rider} can now start accepting jobs and earning with our platform. Get ready to hit the road',
  RIDER_ACCEPT_JOB = '{rider} have accepted a new job request. Please proceed to the designated location and provide your excellent service. ',
  RIDER_JOB_COMPLETED = '{rider} have successfully completed the assigned job {id}. ',
  CUSTOMER_CREATE_ACCOUNT = 'Welcome to Clevis. Book Laundry & car wash service from the comfort of your home.',
  CHANGE_PASSWORD = 'Your password has been changed successfully.',
}

export enum EventType {
  GENERATE_CERTIFICATE = 'GENERATE_CERTIFICATE',
}

export * from './socket';
