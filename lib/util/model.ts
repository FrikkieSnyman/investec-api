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
type Status = { status: number };
type InvestecGenericOKResponse<Data> = {
  data: Data;
  links: {
    self: string;
  };
  meta: {
    totalPages: number;
  };
};
type InvestecGenericResponse<Data> = Status | InvestecGenericOKResponse<Data>;

export type InvestecAuthResponse = Status | InvestecToken;

export type InvestecToken = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: "accounts";
};
export type InvestecAccountsResponse = InvestecGenericResponse<{
  accounts: InvestecAccount[];
}>;

export type InvestecAccountBalanceResponse =
  InvestecGenericResponse<InvestecAccountBalance>;

export type InvestecAccountTransactionsResponse = InvestecGenericResponse<{
  transactions: InvestecTransaction[];
}>;

export const isResponseBad = (response: any): response is Status => {
  return !!response.status;
};