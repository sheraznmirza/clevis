import { ChargeEntityTypes } from 'src/core/dto';

export type ChargeParams = {
  userMasterId: string;
  entityType: ChargeEntityTypes;
  entityId: string;
};

export interface ChargeDto {
  id: string;
  object: string;
  live_mode: boolean;
  customer_initiated: boolean;
  api_version: string;
  method: string;
  status: string;
  amount: number;
  currency: string;
  threeDSecure: boolean;
  card_threeDSecure: boolean;
  save_card: boolean;
  merchant_id: string;
  product: string;
  transaction: Transaction;
  reference: Reference;
  response: Response;
  security: Security;
  acquirer: Acquirer;
  gateway: Gateway;
  card: Card;
  receipt: Receipt;
  customer: Customer;
  merchant: Merchant;
  source: Source;
  redirect: Redirect;
  post: Post;
  activities: Activity[];
  auto_reversed: boolean;
}

export interface Transaction {
  authorization_id: string;
  timezone: string;
  created: string;
  expiry: Expiry;
  asynchronous: boolean;
  amount: number;
  currency: string;
}

export interface Expiry {
  period: number;
  type: string;
}

export interface Reference {
  track: string;
  payment: string;
  gateway: string;
  acquirer: string;
}

export interface Response {
  code: string;
  message: string;
}

export interface Security {
  threeDSecure: ThreeDsecure;
}

export interface ThreeDsecure {
  id: string;
  status: string;
}

export interface Acquirer {
  response: Response2;
}

export interface Response2 {
  code: string;
  message: string;
}

export interface Gateway {
  response: Response3;
}

export interface Response3 {
  code: string;
  message: string;
}

export interface Card {
  object: string;
  first_six: string;
  scheme: string;
  brand: string;
  last_four: string;
}

export interface Receipt {
  id: string;
  email: boolean;
  sms: boolean;
}

export interface Customer {
  id: string;
  first_name: string;
  email: string;
}

export interface Merchant {
  country: string;
  currency: string;
  id: string;
}

export interface Source {
  object: string;
  type: string;
  payment_type: string;
  payment_method: string;
  channel: string;
  id: string;
}

export interface Redirect {
  status: string;
  url: string;
}

export interface Post {
  status: string;
  url: string;
}

export interface Activity {
  id: string;
  object: string;
  created: number;
  status: string;
  currency: string;
  amount: number;
  remarks: string;
}
