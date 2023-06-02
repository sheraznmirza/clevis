import MediaType from '@prisma/client';

export interface createNewCardTokenInterface {
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: number;
}

export interface createTokenForSavedCardInterface {
  saved_card: {
    card_id: string;
    customer_id: string;
  };
  client_ip?: string;
}

export interface createNewCardResponseInterface {
  id: string;
  created: number;
  object: string;
  live_mode: boolean;
  type: string;
  used: boolean;
  card: {
    id: string;
    object: string;
    funding: string;
    fingerprint: string;
    brand: string;
    scheme: string;
    issuer: {
      bank: string;
      country: string;
      id: string;
    };
    exp_month: number;
    exp_year: number;
    last_four: number;
    first_six: number;
  };
}

export interface createCustomerRequestInterface {
  first_name: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  phone?: {
    country_code?: string;
    number?: string;
  };
  description?: string;
  currency?: string;
}

export interface createAuthorizedRequestInterface {
  amount: number;
  currency: string;
  threeDSecure: boolean;
  save_card?: boolean;
  statement_descriptor: string;
  reference: {
    transaction: string;
    order: string;
  };
  receipt?: {
    email?: boolean;
    sms?: boolean;
  };
  customer?: {
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone: {
      country_code: string;
      number: string;
    };
  };
  source: {
    id: string;
  };
  auto: {
    type: string;
    time: number;
  };
  post: {
    url: string;
  };
  redirect: {
    url: string;
  };
}

export interface createBusinessRequestInterface {
  name: {
    en: string;
    ar: string;
  };
  type: string;
  entity: {
    legal_name: {
      en: string;
      ar: string;
    };
    is_licensed: string;
    license: {
      type: string;
      number: string;
    };
    not_for_profit: boolean;
    country: string;
    tax_number: string;
    bank_account: {
      iban: string;
      swift_code: string;
      account_number: string;
    };
    billing_address: {
      recipient_name: string;
      address_1: string;
      address_2: string;
      po_box: string;
      district: string;
      city: string;
      state: string;
      zip_code: string;
      country: string;
    };
  };
  contact_person: {
    name: {
      title: string;
      first: string;
      middle: string;
      last: string;
    };
    contact_info: {
      primary: {
        email: string;
        phone: {
          country_code: string;
          number: string;
        };
      };
    };
    nationality: string;
    date_of_birth: string;
    is_authorized: boolean;
    authorization: {
      name: {
        title: string;
        first: string;
        middle: string;
        last: string;
      };
      type: string;
      issuing_country: string;
      issuing_date: string;
      expiry_date: string;
    };
  };
  post: {
    url: string;
  };
  metadata: {
    mtd: string;
  };
}

export interface createMerchantRequestInterface {
  display_name: string;
  business_id: string;
  business_entity_id: string;
  brand_id: string;
  branch_id: string;
  wallet_id: string;
  charge_currenices: string;
  bank_account: {
    iban: string;
  };
  settlement_by: string;
}
