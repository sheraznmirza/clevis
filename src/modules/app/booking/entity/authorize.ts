export interface AuthorizeResponseInterface {
  id: string;
  object: string;
  live_mode: boolean;
  api_version: string;
  method: string;
  status: string;
  amount: number;
  currency: string;
  threeDSecure: boolean;
  save_card: boolean;
  merchant_id: string;
  product: string;
  transaction: Transaction;
  response: Response;
  receipt: Receipt;
  customer: Customer;
  source: Source;
  redirect: Redirect;
  auto: Auto;
  order: Order;
}

export interface Transaction {
  timezone: string;
  created: string;
  url: string;
  expiry: Expiry;
  asynchronous: boolean;
  amount: number;
  currency: string;
}

export interface Expiry {
  period: number;
  type: string;
}

export interface Response {
  code: string;
  message: string;
}

export interface Receipt {
  email: boolean;
  sms: boolean;
}

export interface Customer {
  id: string;
  first_name: string;
  email: string;
}

export interface Source {
  object: string;
  id: string;
}

export interface Redirect {
  status: string;
  url: string;
}

export interface Auto {
  status: string;
  type: string;
  time: number;
}

export interface Order {}
