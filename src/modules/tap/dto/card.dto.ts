import MediaType from '@prisma/client';
import { String } from 'aws-sdk/clients/acm';
import { Boolean } from 'aws-sdk/clients/appstream';
import { string1To1000 } from 'aws-sdk/clients/customerprofiles';
import { stringValue } from 'aws-sdk/clients/iot';

export interface createNewCardTokenInterface {
  card: {
    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: number;
  };
}

export interface createTokenForSavedCardInterface {
  saved_card: {
    card_id: string;
    customer_id: string;
  };
  client_ip?: string;
}

export interface createNewCardResponse {
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

export interface createTokenForSavedCardResponse {
  id: string;
  created: number;
  object: string;
  live_mode: boolean;
  type: string;
  used: boolean;
  card: {
    id: string;
    object: string;
    address?: {};
    customer: string;
    funding: string;
    fingerprint: string;
    brand: string;
    scheme: string;
    name: string;
    issuer: {
      bank: string;
      country: string;
      id: string;
    };
    exp_month: number;
    exp_year: number;
    last_four: string;
    first_six: string;
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

export interface createCustomerResponse {
  object: string;
  live_mode: boolean;
  created: string;
  merchant_id?: string;
  description?: string;
  metadata?: {
    udf1: string;
  };
  currency: string;
  id: string;
  first_name: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  phone?: {
    country_code: string;
    number: string;
  };
}

export interface createAuthorizedRequestInterface {
  amount: number;
  currency: string;
  threeDSecure: boolean;
  save_card?: boolean;
  statement_descriptor?: string;
  reference?: {
    transaction: string;
    order: string;
  };
  receipt?: {
    email?: boolean;
    sms?: boolean;
  };
  customer?: {
    id: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    email?: string;
    phone?: {
      country_code: string;
      number: string;
    };
  };
  source: {
    id: string;
  };
  auto?: {
    type: string;
    time: number;
  };
  post: {
    url: string;
  };
}

export interface createBusinessRequestInterface {
  name: {
    en: string;
    ar?: string;
  };
  type: string;
  entity: {
    legal_name: {
      en: string;
      ar?: string;
    };
    is_licensed: boolean;
    country: string;
    billing_address: {
      recipient_name: string;
      address_1: string;
      city: string;
      state: string;
      country: string;
    };
  };
  contact_person: {
    name: {
      first: string;
      last?: string;
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
    authorization: {
      name: {
        first: string;
        last?: string;
      };
    };
  };
  brands: [
    {
      name: {
        en: string;
      };
    },
  ];
}

export interface createBusinessRequestResponseInterface {
  id: string;
  status: string;
  created: number;
  object: string;
  live_mode: boolean;
  api_version: string;
  feature_version: string;
  name: Name;
  type: string;
  brands: Brand[];
  entity: Entity;
  user: User;
  post: Post;
  destination_id: string;
}

interface Name {
  en: string;
}

interface Brand {
  id: string;
  status: string;
  created: number;
  name: Name2;
}

interface Name2 {
  en: string;
}

interface Entity {
  id: string;
  status: string;
  created: number;
  legal_name: LegalName;
  country: string;
  is_licensed: boolean;
  taxable: boolean;
  wallets: Wallet[];
  branches: Branch[];
  billing_address: BillingAddress;
  operator: Operator;
}

interface LegalName {
  ar: string;
  en: string;
}

interface Wallet {
  id: string;
  status: string;
  created: number;
  base_currency: string;
  country: string;
  primary_wallet: boolean;
  is_merchant: boolean;
  is_non_resident: boolean;
}

interface Branch {
  id: string;
  created: number;
  virtual: boolean;
  brands: string[];
}

interface BillingAddress {
  id: string;
  country: string;
  state: string;
  city: string;
  recipient_name: string;
  address_1: string;
}

interface Operator {
  id: string;
  status: string;
  created: number;
  name: string;
  developer_id: string;
  is_merchant: boolean;
  api_credentials: ApiCredentials;
}

interface ApiCredentials {
  test: Test;
}

interface Test {
  secret: string;
  public: string;
}

interface User {
  id: string;
  status: string;
  created: number;
  name: Name3;
  contact_info: ContactInfo;
  authorization: Authorization;
  is_authorized: boolean;
  is_verified: boolean;
}

interface Name3 {
  first: string;
  last: string;
}

interface ContactInfo {
  primary: Primary;
}

interface Primary {
  email: string;
  phone: Phone;
}

interface Phone {
  country_code: string;
  number: string;
}

interface Authorization {
  id: string;
  status: string;
  created: number;
  name: Name4;
}

interface Name4 {
  first: string;
  last: string;
}

interface Post {
  url: string;
}

export interface createBusniessResponse {
  id: string;
  status: string;
  created: number;
  object: string;
  live_mode: boolean;
  api_version: string;
  feature_version: string;
  name: {
    en: string;
  };
  type: string;
  brands: [
    {
      id: string;
      status: string;
      created: number;
      name: {
        ar: string;
        en: string1To1000;
      };
    },
  ];
  entity: {
    id: string;
    status: string;
    created: number;
    legal_name: {
      en: string;
    };
    country: string;
    taxable: boolean;
    wallets: [
      {
        id: string;
        status: string;
        created: number;
        base_currency: string;
        country: string;
        primary_wallet: boolean;
        is_merchant: boolean;
        is_non_resident: boolean;
      },
    ];
    branches: [
      {
        id: string;
        created: number;
        virtual: boolean;
        brands: [string];
      },
    ];
    operator: {
      id: string;
      status: string;
      created: number;
      name: string;
      developer_id: string;
      is_merchant: boolean;
      api_credentials: {
        test: {
          secret: string;
          public: string;
        };
      };
    };
  };
  user: {
    id: string;
    status: string;
    created: number;
    name: {
      title: string;
      first: string;
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
    authorization: {
      id: string;
      status: string;
      created: number;
      name: {
        title: string;
      };
    };
    identification: [
      {
        id: string;
        status: string;
        created: number;
        name: {
          title: stringValue;
        };
        files: [];
      },
    ];
    is_authorized: boolean;
    is_verified: boolean;
  };
  destination_id: string;
}

export interface createMerchantRequestInterface {
  display_name: string;
  business_id: string;
  business_entity_id: string;
  brand_id: string;
  branch_id: string;
}

export interface createMerchantRequestResponse {
  id: string;
  status: string;
  created: number;
  object: string;
  live_mode: boolean;
  api_version: string;
  feature_version: string;
  display_name: string;
  business_id: string;
  business_entity_id: string;
  brand_id: string;
  branch_id: string;
  wallets: {
    id: string;
    created: number;
    base_currency: string;
    country: string;
    settlement_by: string;
    primary_wallet: boolean;
    is_merchant: boolean;
    is_non_resident: boolean;
  };
  operator: {
    id: string;
    status: string;
    created: number;
    name: string;
    developer_id: string;
    is_merchant: boolean;
    api_credentials: {
      test: {
        secret: string;
        public: string;
      };
    };
  };
  legacy_id: string;
  marketplace: boolean;
}

export interface createChargeRequestInterface {
  amount: number;
  currency: string;
  customer_initiated?: boolean;
  threeDSecure?: boolean;
  save_card?: boolean;
  description?: string;
  reference?: { transaction: string; order: string };
  receipt?: { email: boolean; sms: boolean };
  customer: {
    id: string;
  };
  merchant: {
    id: string;
  };
  source: { id: string; type: string };
  redirect: {
    url: string;
  };
  post: {
    url: string;
  };
}
