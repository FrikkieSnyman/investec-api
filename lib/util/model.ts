export type InvestecTransactionType = "DEBIT" | "CREDIT";

export type InvestecTransactionTransactionType =
  | "CardPurchases"
  | "VASTransactions"
  | "OnlineBankingPayments"
  | "DebitOrders"
  | "Deposits"
  | "ATMWithdrawals"
  | "FeesAndInterest"
  | string
  | null; // what are the values here?
export type InvestecTransactionStatus = string; // what are the values here? "POSTED"

export interface InvestecAccount {
  accountId: string;
  accountNumber: string;
  accountName: string;
  referenceName: string;
  productName: string;
  meta: any;
}

export interface InvestecCard {
  CardKey: string;
  CardNumber: string;
  IsProgrammable: boolean;
  Status: string;
  CardTypeCode: string;
  AccountNumber: string;
  AccountId: string;
}

export interface InvestecCardCode {
  codeId: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  error: any;
}

export interface InvestecSimulateExecutionInput {
  code: string;
  centsAmount: string;
  currencyCode: string;
  merchantCode: number;
  merchantCity: string;
  countryCode: string;
}

export interface InvestecCardExecution {
  executionId: string;
  rootCodeFunctionId: string;
  sandbox: boolean;
  type: "before_transaction" | "after_transaction";
  authorizationApproved: boolean | null;
  logs: Array<{
    createdAt: string;
    level: string;
    content: string;
  }>;
  smsCount: number;
  emailCount: number;
  pushNotificationCount: number;
  createdAt: string;
  startedAt: string;
  completedAt: string;
  updatedAt: string;
  Error: any;
}

export interface InvestecCardEnvironmentVariables {
  variables: { [key in string]: string | number | boolean | Object };
  createdAt: string;
  updatedAt: string;
  error: any;
}

export interface InvestecNameAndCode {
  Code: string;
  Name: string;
}

export interface InvestecAccountBalance {
  accountId: string;
  currentBalance: number;
  availableBalance: number;
  currency: string;
}

export interface InvestecTransaction {
  accountId: string;
  type: InvestecTransactionType;
  transactionType: InvestecTransactionTransactionType;
  status: InvestecTransactionStatus;
  description: string;
  cardNumber: string;
  postedOrder: number;
  postingDate: string; // ISO8601 date (yyyy-mm-dd)
  valueDate: string; // ISO8601 date (yyyy-mm-dd)
  actionDate: string; // ISO8601 date (yyyy-mm-dd)
  transactionDate: string; // ISO8601 date (yyyy-mm-dd)
  amount: number;
  runningBalance: number;
}

export interface InvestecTransfer {
  PaymentReferenceNumber: string;
  PaymentDate: string;
  Status: string;
  BeneficiaryName: string;
  BeneficiaryAccountId: string;
  AuthorisationRequired: boolean;
}

type Status = { status: number };
type InvestecGenericOKResponse<Data> = {
  data: Data;
  links: {
    self: string | null;
  };
  meta: {
    totalPages: number;
  };
};
type InvestecGenericResponse<Data> = Status | InvestecGenericOKResponse<Data>;

export type Realm = "business" | "private";

export type Scope = "accounts" | "transactions";

export type InvestecAuthResponse = Status | InvestecToken;

export type InvestecToken = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: Scope;
  refresh_token?: string;
};
export type InvestecAccountsResponse = InvestecGenericResponse<{
  accounts: InvestecAccount[];
}>;

export type InvestecAccountBalanceResponse =
  InvestecGenericResponse<InvestecAccountBalance>;

export type InvestecAccountTransactionsResponse = InvestecGenericResponse<{
  transactions: InvestecTransaction[];
}>;

export type InvestecAccountTransferResponse = InvestecGenericResponse<{
  transferResponse: { TransferResponses: InvestecTransfer[] };
  ErrorMessage: any;
}>;

export type InvestecCardsResponse = InvestecGenericResponse<{
  cards: InvestecCard[];
}>;

export type InvestecCardCodeResponse = InvestecGenericResponse<{
  result: InvestecCardCode;
}>;

export type InvestecCardExecutionResponse = InvestecGenericResponse<{
  result: InvestecCardExecution[];
}>;

export type InvestecCardEnvironmentVariablesResponse = InvestecGenericResponse<{
  result: InvestecCardEnvironmentVariables;
}>;

export type InvestecCardNameCodeResponse = InvestecGenericResponse<{
  result: InvestecNameAndCode[];
}>;

export const isResponseBad = (response: any): response is Status => {
  return !!response.status;
};
