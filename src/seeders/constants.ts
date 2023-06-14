import { ServiceType, UserMaster, UserType } from '@prisma/client';
import { VendorSignUpDto } from 'src/modules/app/auth/dto';

export const roles = [
  {
    name: 'ADMIN',
    userType: UserType.ADMIN,
  },
  {
    name: 'CUSTOMER',
    userType: UserType.CUSTOMER,
  },
  {
    name: 'RIDER',
    userType: UserType.RIDER,
  },
  {
    name: 'VENDOR',
    userType: UserType.VENDOR,
  },
];

const AUTHENTICATED_ROUTES = {
  ADMIN_DASHBOARD: 'dashboard',
  MY_SERVICES: 'my-services',
  MY_SERVICES_DETAIL: 'detail/',
  ADD_SERVICES: 'add-service',
  EDIT_SERVICES: 'edit-service/',
  SERVICE_BOOKINGS: 'service-bookings',
  MY_EARNINGS: 'my-earnings',
  JOB_REQUESTS: 'job-requests',
  ABOUT_US: 'about-us',
  TERMS_CONDITION: 'terms-condition',
  HELP_SUPPORT: 'help-support',
  PROFILE: 'profile',
};

export const routes = [
  {
    icon: 'dashboard',
    label: 'dashboard',
    linkTo: '/dashboard',
    selectedOptionKey: 'dashboard',
    routeName: 'dashboard',
  },
  {
    icon: 'vendor-dashboard',
    label: 'dashboard',
    linkTo: '/dashboard',
    selectedOptionKey: 'dashboard',
    routeName: 'dashboard',
  },
  {
    icon: 'customer-management',
    label: 'customer-management',
    linkTo: '/customer-management',
    selectedOptionKey: 'customer-management',
    routeName: 'customer-management',
  },
  {
    icon: 'vendor-management',
    label: 'vendor-management',
    linkTo: '/vendor-management',
    selectedOptionKey: 'vendor-management',
    routeName: 'vendor-management',
  },
  {
    icon: 'rider-management',
    label: 'rider-management',
    linkTo: '/rider-management',
    selectedOptionKey: 'rider-management',
    routeName: 'rider-management',
  },
  {
    icon: 'bookings-management',
    label: 'bookings-management',
    linkTo: '/bookings-management',
    selectedOptionKey: 'bookings-management',
    routeName: 'bookings-management',
  },
  {
    icon: 'payments-management',
    label: 'payments-management',
    linkTo: '/payments-management',
    selectedOptionKey: 'payments-management',
    routeName: 'payments-management',
  },
  {
    icon: 'service-management',
    label: 'service-management',
    linkTo: '/service-management',
    selectedOptionKey: 'service-management',
    routeName: 'service-management',
  },
  {
    icon: 'settings',
    label: 'settings',
    linkTo: '/settings',
    selectedOptionKey: 'settings',
    routeName: 'settings',
  },
  {
    icon: 'vendor-services',
    label: 'My services',
    linkTo: '/vendor/services',
    selectedOptionKey: 'vendor-services',
    routeName: 'vendor-services',
  },
  {
    icon: 'vendor-bookings',
    label: 'Service Bookings',
    linkTo: '/vendor/bookings',
    selectedOptionKey: 'vendor-bookings',
    routeName: 'vendor-bookings',
  },
  {
    icon: 'payments-management',
    label: 'My Payments',
    linkTo: '/payments',
    selectedOptionKey: 'payments',
    routeName: 'payments',
  },
  {
    icon: 'job-requests',
    label: 'Job Requests',
    linkTo: '/job-requests',
    selectedOptionKey: 'payments',
    routeName: 'payments',
  },
  {
    icon: 'earnings',
    label: 'Earnings',
    linkTo: '/earnings',
    selectedOptionKey: 'earnings',
    routeName: 'earnings',
  },

  {
    label: 'Dashboard',
    linkTo: AUTHENTICATED_ROUTES.ADMIN_DASHBOARD,
    selectedOptionKey: 'dashboard',
    icon: '<DashboardIcon />',
  },
  {
    label: 'Job Requests',
    linkTo: AUTHENTICATED_ROUTES.JOB_REQUESTS,
    selectedOptionKey: 'job-requests',
    icon: '<JobRequestIcon />',
  },
  {
    label: 'Earnings',
    linkTo: AUTHENTICATED_ROUTES.MY_EARNINGS,
    selectedOptionKey: 'my-earnings',
    icon: '<EarningsIcon />',
  },
];

export const subcategories = [
  { subCategoryName: 'Cotton', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Linen', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Silk', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Lace', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Satin', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Polyester', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Knit', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Wool', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Rayon', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Blends', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Cotton Lawn', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Jersey', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Chiffon', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Georgette', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Nylon', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Leather', serviceType: ServiceType.LAUNDRY },
  {
    subCategoryName: 'Synthetic (Microfiber)',
    serviceType: ServiceType.LAUNDRY,
  },
  { subCategoryName: 'Flannel', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Denim', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Polar Fleece', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Lawn', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Cashmere', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Pique Knit', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Velvet', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Corduroy', serviceType: ServiceType.LAUNDRY },
  { subCategoryName: 'Spandex', serviceType: ServiceType.LAUNDRY },
];

export const categories = [
  { categoryName: 'Sedan', serviceType: ServiceType.CAR_WASH },
  { categoryName: 'Minivan', serviceType: ServiceType.CAR_WASH },
  { categoryName: 'Electric Car', serviceType: ServiceType.CAR_WASH },
  { categoryName: 'Hatchback', serviceType: ServiceType.CAR_WASH },
  { categoryName: 'Convertible', serviceType: ServiceType.CAR_WASH },
  { categoryName: 'Coupe', serviceType: ServiceType.CAR_WASH },
  { categoryName: 'Crossover SUVS', serviceType: ServiceType.CAR_WASH },
  { categoryName: 'Small Sized SUVS', serviceType: ServiceType.CAR_WASH },
  { categoryName: 'Full Sized SUVS', serviceType: ServiceType.CAR_WASH },
  { categoryName: 'Hat', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Cap', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Beanie', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Headband', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Gloves', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Mittens', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Belt', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Tie', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Bow tie', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Necktie', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Pocket square', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Bandana', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Turbans', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Fezes', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Kaffiyeh', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Mishlah', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Burqa', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Thawb', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Tagiyah', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Salwar', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Curtain', serviceType: ServiceType.LAUNDRY },
  { categoryName: 'Carpet', serviceType: ServiceType.LAUNDRY },
];

export const services = [
  {
    serviceName: 'Car tuning',
    serviceType: ServiceType.CAR_WASH,
  },
  {
    serviceName: 'Denting & Painting',
    serviceType: ServiceType.CAR_WASH,
  },
  {
    serviceName: 'Car Polishing',
    serviceType: ServiceType.CAR_WASH,
  },
  {
    serviceName: 'Car Waxing',
    serviceType: ServiceType.CAR_WASH,
  },
  {
    serviceName: 'Polishing',
    serviceType: ServiceType.CAR_WASH,
  },

  {
    serviceName: 'Dry Clean',
    serviceType: ServiceType.LAUNDRY,
  },

  {
    serviceName: 'Ironing',
    serviceType: ServiceType.LAUNDRY,
  },

  {
    serviceName: 'Washing',
    serviceType: ServiceType.LAUNDRY,
  },

  {
    serviceName: 'Heavy Laundry',
    serviceType: ServiceType.LAUNDRY,
  },
];

export const vendors: VendorSignUpDto[] = [
  {
    fullName: 'Vendor Car Wash',
    email: 'vendor_carwash@clevis.com',
    password: 'click123',
    serviceType: 'CAR_WASH',
    companyName: 'Brock and Nelson LLC',
    companyEmail: 'bawyboxa@mailinator.com',
    phone: '+1 (724) 274-3973',
    fullAddress: 'Jafza One, FZJOB1320 Dubai - Dubai - United Arab Emirates',
    cityId: 32,
    description: 'Quis libero molestia',
    latitude: 25.204849299999992,
    longitude: 55.270782800000006,
    logo: {
      name: '"6fbd2c6dd786a83ed54c0b331c452686"',
      location: 'Clevis/1684396768389-service-image-2.jpg/1684396768389',
      key: 'Clevis/1684396768389-service-image-2.jpg/1684396768389',
    },
    businessLicense: [
      {
        name: '"2d7a9477f6a4965ac16748e45f10ec9e"',
        location: 'Clevis/1684396768403-workplace-img-5.jpg/1684396768403',
        key: 'Clevis/1684396768403-workplace-img-5.jpg/1684396768403',
      },
      {
        name: '"292dd544c38b2174d3099cabdf66b269"',
        location: 'Clevis/1684396770405-workplace-img-6.jpg/1684396770405',
        key: 'Clevis/1684396770405-workplace-img-6.jpg/1684396770405',
      },
    ],
    workspaceImages: [
      {
        name: '"3f2f7efde9a06b33dc2f26bc8cd2d813"',
        location: 'Clevis/1684396768400-service-image-4.jpg/1684396768400',
        key: 'Clevis/1684396768400-service-image-4.jpg/1684396768400',
      },
      {
        name: '"6fb1a43cbac5d913ef6f4ba4c9d52e33"',
        location: 'Clevis/1684396770421-service-image-5.jpg/1684396770421',
        key: 'Clevis/1684396770421-service-image-5.jpg/1684396770421',
      },
    ],
  },

  {
    fullName: 'Vendor Justice',
    email: 'lybaceqis1@mailinator.com',
    password: 'click123',
    serviceType: 'CAR_WASH',
    companyName: 'Brock and Nelson LLC',
    companyEmail: 'bawyboxa@mailinator.com',
    phone: '+1 (724) 274-3973',
    fullAddress: 'Jafza One, FZJOB1320 Dubai - Dubai - United Arab Emirates',
    cityId: 32,
    description: 'Quis libero molestia',
    latitude: 25.204849299999992,
    longitude: 55.270782800000006,
    logo: {
      name: '"6fbd2c6dd786a83ed54c0b331c452686"',
      location: 'Clevis/1684396768389-service-image-2.jpg/1684396768389',
      key: 'Clevis/1684396768389-service-image-2.jpg/1684396768389',
    },
    businessLicense: [
      {
        name: '"2d7a9477f6a4965ac16748e45f10ec9e"',
        location: 'Clevis/1684396768403-workplace-img-5.jpg/1684396768403',
        key: 'Clevis/1684396768403-workplace-img-5.jpg/1684396768403',
      },
      {
        name: '"292dd544c38b2174d3099cabdf66b269"',
        location: 'Clevis/1684396770405-workplace-img-6.jpg/1684396770405',
        key: 'Clevis/1684396770405-workplace-img-6.jpg/1684396770405',
      },
    ],
    workspaceImages: [
      {
        name: '"3f2f7efde9a06b33dc2f26bc8cd2d813"',
        location: 'Clevis/1684396768400-service-image-4.jpg/1684396768400',
        key: 'Clevis/1684396768400-service-image-4.jpg/1684396768400',
      },
      {
        name: '"6fb1a43cbac5d913ef6f4ba4c9d52e33"',
        location: 'Clevis/1684396770421-service-image-5.jpg/1684396770421',
        key: 'Clevis/1684396770421-service-image-5.jpg/1684396770421',
      },
    ],
  },

  {
    fullName: 'Donovan Vendor',
    email: 'lybaceqis2@mailinator.com',
    password: 'click123',
    serviceType: 'CAR_WASH',
    companyName: 'Brock and Nelson LLC',
    companyEmail: 'bawyboxa@mailinator.com',
    phone: '+1 (724) 274-3973',
    fullAddress: 'Jafza One, FZJOB1320 Dubai - Dubai - United Arab Emirates',
    cityId: 32,
    description: 'Quis libero molestia',
    latitude: 25.204849299999992,
    longitude: 55.270782800000006,
    logo: {
      name: '"6fbd2c6dd786a83ed54c0b331c452686"',
      location: 'Clevis/1684396768389-service-image-2.jpg/1684396768389',
      key: 'Clevis/1684396768389-service-image-2.jpg/1684396768389',
    },
    businessLicense: [
      {
        name: '"2d7a9477f6a4965ac16748e45f10ec9e"',
        location: 'Clevis/1684396768403-workplace-img-5.jpg/1684396768403',
        key: 'Clevis/1684396768403-workplace-img-5.jpg/1684396768403',
      },
      {
        name: '"292dd544c38b2174d3099cabdf66b269"',
        location: 'Clevis/1684396770405-workplace-img-6.jpg/1684396770405',
        key: 'Clevis/1684396770405-workplace-img-6.jpg/1684396770405',
      },
    ],
    workspaceImages: [
      {
        name: '"3f2f7efde9a06b33dc2f26bc8cd2d813"',
        location: 'Clevis/1684396768400-service-image-4.jpg/1684396768400',
        key: 'Clevis/1684396768400-service-image-4.jpg/1684396768400',
      },
      {
        name: '"6fb1a43cbac5d913ef6f4ba4c9d52e33"',
        location: 'Clevis/1684396770421-service-image-5.jpg/1684396770421',
        key: 'Clevis/1684396770421-service-image-5.jpg/1684396770421',
      },
    ],
  },

  {
    fullName: 'Vendior',
    email: 'lybaceqis3@mailinator.com',
    password: 'click123',
    serviceType: 'CAR_WASH',
    companyName: 'Brock and Nelson LLC',
    companyEmail: 'bawyboxa@mailinator.com',
    phone: '+1 (724) 274-3973',
    fullAddress: 'Jafza One, FZJOB1320 Dubai - Dubai - United Arab Emirates',
    cityId: 32,
    description: 'Quis libero molestia',
    latitude: 25.204849299999992,
    longitude: 55.270782800000006,
    logo: {
      name: '"6fbd2c6dd786a83ed54c0b331c452686"',
      location: 'Clevis/1684396768389-service-image-2.jpg/1684396768389',
      key: 'Clevis/1684396768389-service-image-2.jpg/1684396768389',
    },
    businessLicense: [
      {
        name: '"2d7a9477f6a4965ac16748e45f10ec9e"',
        location: 'Clevis/1684396768403-workplace-img-5.jpg/1684396768403',
        key: 'Clevis/1684396768403-workplace-img-5.jpg/1684396768403',
      },
      {
        name: '"292dd544c38b2174d3099cabdf66b269"',
        location: 'Clevis/1684396770405-workplace-img-6.jpg/1684396770405',
        key: 'Clevis/1684396770405-workplace-img-6.jpg/1684396770405',
      },
    ],
    workspaceImages: [
      {
        name: '"3f2f7efde9a06b33dc2f26bc8cd2d813"',
        location: 'Clevis/1684396768400-service-image-4.jpg/1684396768400',
        key: 'Clevis/1684396768400-service-image-4.jpg/1684396768400',
      },
      {
        name: '"6fb1a43cbac5d913ef6f4ba4c9d52e33"',
        location: 'Clevis/1684396770421-service-image-5.jpg/1684396770421',
        key: 'Clevis/1684396770421-service-image-5.jpg/1684396770421',
      },
    ],
  },

  {
    fullName: 'Vendor Laundry',
    email: 'vendor_laundry@clevis.com',
    password: 'click123',
    serviceType: 'LAUNDRY',
    companyName: 'Commercial Laundry',
    companyEmail: 'bawyboxa@mailinator.com',
    phone: '+1 (724) 274-3973',
    fullAddress: 'Jafza One, FZJOB1320 Dubai - Dubai - United Arab Emirates',
    cityId: 32,
    description: 'Quis libero molestia',
    latitude: 25.204849299999992,
    longitude: 55.270782800000006,
    logo: {
      name: '"6fbd2c6dd786a83ed54c0b331c452686"',
      location: 'Clevis/1684396768389-service-image-2.jpg/1684396768389',
      key: 'Clevis/1684396768389-service-image-2.jpg/1684396768389',
    },
    businessLicense: [
      {
        name: '"2d7a9477f6a4965ac16748e45f10ec9e"',
        location: 'Clevis/1684396768403-workplace-img-5.jpg/1684396768403',
        key: 'Clevis/1684396768403-workplace-img-5.jpg/1684396768403',
      },
      {
        name: '"292dd544c38b2174d3099cabdf66b269"',
        location: 'Clevis/1684396770405-workplace-img-6.jpg/1684396770405',
        key: 'Clevis/1684396770405-workplace-img-6.jpg/1684396770405',
      },
    ],
    workspaceImages: [
      {
        name: '"3f2f7efde9a06b33dc2f26bc8cd2d813"',
        location: 'Clevis/1684396768400-service-image-4.jpg/1684396768400',
        key: 'Clevis/1684396768400-service-image-4.jpg/1684396768400',
      },
      {
        name: '"6fb1a43cbac5d913ef6f4ba4c9d52e33"',
        location: 'Clevis/1684396770421-service-image-5.jpg/1684396770421',
        key: 'Clevis/1684396770421-service-image-5.jpg/1684396770421',
      },
    ],
  },

  {
    fullName: 'Car Washing Vendor',
    email: 'lybaceqis5@mailinator.com',
    password: 'click123',
    serviceType: 'LAUNDRY',
    companyName: 'Brock and Nelson LLC',
    companyEmail: 'bawyboxa@mailinator.com',
    phone: '+1 (724) 274-3973',
    fullAddress: 'Jafza One, FZJOB1320 Dubai - Dubai - United Arab Emirates',
    cityId: 32,
    description: 'Quis libero molestia',
    latitude: 25.204849299999992,
    longitude: 55.270782800000006,
    logo: {
      name: '"6fbd2c6dd786a83ed54c0b331c452686"',
      location: 'Clevis/1684396768389-service-image-2.jpg/1684396768389',
      key: 'Clevis/1684396768389-service-image-2.jpg/1684396768389',
    },
    businessLicense: [
      {
        name: '"2d7a9477f6a4965ac16748e45f10ec9e"',
        location: 'Clevis/1684396768403-workplace-img-5.jpg/1684396768403',
        key: 'Clevis/1684396768403-workplace-img-5.jpg/1684396768403',
      },
      {
        name: '"292dd544c38b2174d3099cabdf66b269"',
        location: 'Clevis/1684396770405-workplace-img-6.jpg/1684396770405',
        key: 'Clevis/1684396770405-workplace-img-6.jpg/1684396770405',
      },
    ],
    workspaceImages: [
      {
        name: '"3f2f7efde9a06b33dc2f26bc8cd2d813"',
        location: 'Clevis/1684396768400-service-image-4.jpg/1684396768400',
        key: 'Clevis/1684396768400-service-image-4.jpg/1684396768400',
      },
      {
        name: '"6fb1a43cbac5d913ef6f4ba4c9d52e33"',
        location: 'Clevis/1684396770421-service-image-5.jpg/1684396770421',
        key: 'Clevis/1684396770421-service-image-5.jpg/1684396770421',
      },
    ],
  },

  {
    fullName: 'Clevis Vendor',
    email: 'lybaceqis6@mailinator.com',
    password: 'click123',
    serviceType: 'LAUNDRY',
    companyName: 'Brock and Nelson LLC',
    companyEmail: 'bawyboxa@mailinator.com',
    phone: '+1 (724) 274-3973',
    fullAddress: 'Jafza One, FZJOB1320 Dubai - Dubai - United Arab Emirates',
    cityId: 32,
    description: 'Quis libero molestia',
    latitude: 25.204849299999992,
    longitude: 55.270782800000006,
    logo: {
      name: '"6fbd2c6dd786a83ed54c0b331c452686"',
      location: 'Clevis/1684396768389-service-image-2.jpg/1684396768389',
      key: 'Clevis/1684396768389-service-image-2.jpg/1684396768389',
    },
    businessLicense: [
      {
        name: '"2d7a9477f6a4965ac16748e45f10ec9e"',
        location: 'Clevis/1684396768403-workplace-img-5.jpg/1684396768403',
        key: 'Clevis/1684396768403-workplace-img-5.jpg/1684396768403',
      },
      {
        name: '"292dd544c38b2174d3099cabdf66b269"',
        location: 'Clevis/1684396770405-workplace-img-6.jpg/1684396770405',
        key: 'Clevis/1684396770405-workplace-img-6.jpg/1684396770405',
      },
    ],
    workspaceImages: [
      {
        name: '"3f2f7efde9a06b33dc2f26bc8cd2d813"',
        location: 'Clevis/1684396768400-service-image-4.jpg/1684396768400',
        key: 'Clevis/1684396768400-service-image-4.jpg/1684396768400',
      },
      {
        name: '"6fb1a43cbac5d913ef6f4ba4c9d52e33"',
        location: 'Clevis/1684396770421-service-image-5.jpg/1684396770421',
        key: 'Clevis/1684396770421-service-image-5.jpg/1684396770421',
      },
    ],
  },
];

export const riders = [
  {
    businessLicense: [
      {
        key: '1683292172394-Fingerprint-bro 1.png/1684400547359',
        location: '1683292172394-Fingerprint-bro 1.png/1684400547359',
        name: '"9886b25f77acbbefa4d0304d169d7b47"',
      },
    ],
    cityId: 32,
    companyEmail: 'fixyre@mailinator.com',
    companyName: 'Alvarado and Kent LLC',
    description: 'Non in in dolore inv',
    email: 'sefytiroso@mailinator.com',
    fullAddress: '100 Princess Rd, Hulme, Manchester M15 5AS, UK',
    fullName: 'Ryder Gray',
    latitude: 53.461141,
    logo: {
      key: '1683292172394-Fingerprint-bro 1.png/1684400547343',
      location: '1683292172394-Fingerprint-bro 1.png/1684400547343',
      name: '"9886b25f77acbbefa4d0304d169d7b47"',
    },
    longitude: -2.2455309999999997,
    password: 'click123',
    phone: '+1 (481) 993-4488',
    state: '629',
    workspaceImages: [
      {
        key: '1683292172394-Fingerprint-bro 1.png/1684400547351',
        location: '1683292172394-Fingerprint-bro 1.png/1684400547351',
        name: '"9886b25f77acbbefa4d0304d169d7b47"',
      },
    ],
  },

  {
    businessLicense: [
      {
        key: '1683292172394-Fingerprint-bro 1.png/1684400547359',
        location: '1683292172394-Fingerprint-bro 1.png/1684400547359',
        name: '"9886b25f77acbbefa4d0304d169d7b47"',
      },
    ],
    cityId: 32,
    companyEmail: 'fixyre@mailinator.com',
    companyName: 'Alvarado and Kent LLC',
    description: 'Non in in dolore inv',
    email: 'sefytiroso1@mailinator.com',
    fullAddress: '100 Princess Rd, Hulme, Manchester M15 5AS, UK',
    fullName: 'Lavinia Rider',
    latitude: 53.461141,
    logo: {
      key: '1683292172394-Fingerprint-bro 1.png/1684400547343',
      location: '1683292172394-Fingerprint-bro 1.png/1684400547343',
      name: '"9886b25f77acbbefa4d0304d169d7b47"',
    },
    longitude: -2.2455309999999997,
    password: 'click123',
    phone: '+1 (481) 993-4488',
    workspaceImages: [
      {
        key: '1683292172394-Fingerprint-bro 1.png/1684400547351',
        location: '1683292172394-Fingerprint-bro 1.png/1684400547351',
        name: '"9886b25f77acbbefa4d0304d169d7b47"',
      },
    ],
  },

  {
    businessLicense: [
      {
        key: '1683292172394-Fingerprint-bro 1.png/1684400547359',
        location: '1683292172394-Fingerprint-bro 1.png/1684400547359',
        name: '"9886b25f77acbbefa4d0304d169d7b47"',
      },
    ],
    cityId: 32,
    companyEmail: 'fixyre@mailinator.com',
    companyName: 'Alvarado and Kent LLC',
    description: 'Non in in dolore inv',
    email: 'sefytiroso2@mailinator.com',
    fullAddress: '100 Princess Rd, Hulme, Manchester M15 5AS, UK',
    fullName: 'Ryda Gray',
    latitude: 53.461141,
    logo: {
      key: '1683292172394-Fingerprint-bro 1.png/1684400547343',
      location: '1683292172394-Fingerprint-bro 1.png/1684400547343',
      name: '"9886b25f77acbbefa4d0304d169d7b47"',
    },
    longitude: -2.2455309999999997,
    password: 'click123',
    phone: '+1 (481) 993-4488',
    state: '629',
    workspaceImages: [
      {
        key: '1683292172394-Fingerprint-bro 1.png/1684400547351',
        location: '1683292172394-Fingerprint-bro 1.png/1684400547351',
        name: '"9886b25f77acbbefa4d0304d169d7b47"',
      },
    ],
  },

  {
    businessLicense: [
      {
        key: '1683292172394-Fingerprint-bro 1.png/1684400547359',
        location: '1683292172394-Fingerprint-bro 1.png/1684400547359',
        name: '"9886b25f77acbbefa4d0304d169d7b47"',
      },
    ],
    cityId: 32,
    companyEmail: 'fixyre@mailinator.com',
    companyName: 'Alvarado and Kent LLC',
    description: 'Non in in dolore inv',
    email: 'sefytiroso3@mailinator.com',
    fullAddress: '100 Princess Rd, Hulme, Manchester M15 5AS, UK',
    fullName: 'Rider Clevis',
    latitude: 53.461141,
    logo: {
      key: '1683292172394-Fingerprint-bro 1.png/1684400547343',
      location: '1683292172394-Fingerprint-bro 1.png/1684400547343',
      name: '"9886b25f77acbbefa4d0304d169d7b47"',
    },
    longitude: -2.2455309999999997,
    password: 'click123',
    phone: '+1 (481) 993-4488',
    state: '629',
    workspaceImages: [
      {
        key: '1683292172394-Fingerprint-bro 1.png/1684400547351',
        location: '1683292172394-Fingerprint-bro 1.png/1684400547351',
        name: '"9886b25f77acbbefa4d0304d169d7b47"',
      },
    ],
  },

  {
    businessLicense: [
      {
        key: '1683292172394-Fingerprint-bro 1.png/1684400547359',
        location: '1683292172394-Fingerprint-bro 1.png/1684400547359',
        name: '"9886b25f77acbbefa4d0304d169d7b47"',
      },
    ],
    cityId: 32,
    companyEmail: 'fixyre@mailinator.com',
    companyName: 'Alvarado and Kent LLC',
    description: 'Non in in dolore inv',
    email: 'sefytiroso4@mailinator.com',
    fullAddress: '100 Princess Rd, Hulme, Manchester M15 5AS, UK',
    fullName: 'Raydur Clevis',
    latitude: 53.461141,
    logo: {
      key: '1683292172394-Fingerprint-bro 1.png/1684400547343',
      location: '1683292172394-Fingerprint-bro 1.png/1684400547343',
      name: '"9886b25f77acbbefa4d0304d169d7b47"',
    },
    longitude: -2.2455309999999997,
    password: 'click123',
    phone: '+1 (481) 993-4488',
    state: '629',
    workspaceImages: [
      {
        key: '1683292172394-Fingerprint-bro 1.png/1684400547351',
        location: '1683292172394-Fingerprint-bro 1.png/1684400547351',
        name: '"9886b25f77acbbefa4d0304d169d7b47"',
      },
    ],
  },

  {
    businessLicense: [
      {
        key: '1683292172394-Fingerprint-bro 1.png/1684400547359',
        location: '1683292172394-Fingerprint-bro 1.png/1684400547359',
        name: '"9886b25f77acbbefa4d0304d169d7b47"',
      },
    ],
    cityId: 32,
    companyEmail: 'fixyre@mailinator.com',
    companyName: 'Alvarado and Kent LLC',
    description: 'Non in in dolore inv',
    email: 'sefytiroso5@mailinator.com',
    fullAddress: '100 Princess Rd, Hulme, Manchester M15 5AS, UK',
    fullName: 'Riodur',
    latitude: 53.461141,
    logo: {
      key: '1683292172394-Fingerprint-bro 1.png/1684400547343',
      location: '1683292172394-Fingerprint-bro 1.png/1684400547343',
      name: '"9886b25f77acbbefa4d0304d169d7b47"',
    },
    longitude: -2.2455309999999997,
    password: 'click123',
    phone: '+1 (481) 993-4488',
    state: '629',
    workspaceImages: [
      {
        key: '1683292172394-Fingerprint-bro 1.png/1684400547351',
        location: '1683292172394-Fingerprint-bro 1.png/1684400547351',
        name: '"9886b25f77acbbefa4d0304d169d7b47"',
      },
    ],
  },

  {
    businessLicense: [
      {
        key: '1683292172394-Fingerprint-bro 1.png/1684400547359',
        location: '1683292172394-Fingerprint-bro 1.png/1684400547359',
        name: '"9886b25f77acbbefa4d0304d169d7b47"',
      },
    ],
    cityId: 32,
    companyEmail: 'fixyre@mailinator.com',
    companyName: 'Alvarado and Kent LLC',
    description: 'Non in in dolore inv',
    email: 'sefytiroso6@mailinator.com',
    fullAddress: '100 Princess Rd, Hulme, Manchester M15 5AS, UK',
    fullName: 'Lavinia Gray',
    latitude: 53.461141,
    logo: {
      key: '1683292172394-Fingerprint-bro 1.png/1684400547343',
      location: '1683292172394-Fingerprint-bro 1.png/1684400547343',
      name: '"9886b25f77acbbefa4d0304d169d7b47"',
    },
    longitude: -2.2455309999999997,
    password: 'click123',
    phone: '+1 (481) 993-4488',
    state: '629',
    workspaceImages: [
      {
        key: '1683292172394-Fingerprint-bro 1.png/1684400547351',
        location: '1683292172394-Fingerprint-bro 1.png/1684400547351',
        name: '"9886b25f77acbbefa4d0304d169d7b47"',
      },
    ],
  },
];
