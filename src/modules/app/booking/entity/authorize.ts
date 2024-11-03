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
}

interface Transaction {
  timezone: string;
  created: string;
  url: string;
  expiry: Expiry;
  asynchronous: boolean;
  amount: number;
  currency: string;
}

interface Expiry {
  period: number;
  type: string;
}

interface Response {
  code: string;
  message: string;
}

interface Receipt {
  email: boolean;
  sms: boolean;
}

interface Customer {
  id: string;
  first_name: string;
  email: string;
}

interface Source {
  object: string;
  id: string;
}

interface Redirect {
  status: string;
  url: string;
}

interface Auto {
  status: string;
  type: string;
  time: number;
}
