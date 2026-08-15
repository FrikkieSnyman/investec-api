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
  kycCompliant: boolean;
  profileId: string;
  profileName: string;
  meta: any;
}

export interface InvestecProfile {
  profileId: string;
  profileName: string;
  defaultProfile: boolean;
}

export interface InvestecAuthorisationPeriod {
  id: string;
  description: string;
}

export interface InvestecAuthoriser {
  authoriserId: string;
  name: string;
}

export interface InvestecAuthorisationSetupDetails {
  numberOfAuthorisationRequired: string;
  period: InvestecAuthorisationPeriod[];
  authorisersListA: InvestecAuthoriser[];
  authorisersListB: InvestecAuthoriser[];
}

export interface InvestecDocument {
  documentType: string;
  documentDate: string;
}

export interface InvestecCard {
  CardKey: string;
  CardNumber: string;
  IsProgrammable: boolean;
  Status: string;
  CardTypeCode: string;
  AccountNumber: string;
  AccountId: string;
  EmbossedName: string;
  IsVirtualCard: boolean;
}

export interface InvestecCreateVirtualCardInput {
  accountNumber: string;
  embossName: string;
  embossName2?: string;
}

export interface InvestecCreatedVirtualCard {
  CardKey: string;
  IsVirtualCard: boolean;
  EmbossName: string;
  EmbossName2: string;
}

export interface InvestecCardDetails {
  CardKeyHash: string;
  MaskedCardNumber: string;
  EmbossName: string;
  EmbossName2: string;
  Status: string;
  AccountNumber: string;
  IsVirtualCard: boolean;
  ExtendedDetails: {
    CardNumber: string;
    ExpiryDate: string;
    CVV2: string;
  } | null;
}

export interface InvestecSensitiveCardDetailsInput {
  keyId: number;
  identifier: string;
  appName: string;
  modulus: string;
  exponent: string;
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
  budgetBalance: number;
  straightBalance: number;
  cashBalance: number;
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
  uuid: string;
}

export interface InvestecPendingTransaction {
  accountId: string;
  type: InvestecTransactionType;
  status: InvestecTransactionStatus;
  description: string;
  transactionDate: string; // ISO8601 date (yyyy-mm-dd)
  amount: number;
}

export interface InvestecTransfer {
  PaymentReferenceNumber: string;
  PaymentDate: string;
  Status: string;
  BeneficiaryName: string;
  BeneficiaryAccountId: string;
  AuthorisationRequired: boolean;
}

export interface InvestecPayment {
  PaymentReferenceNumber: string;
  PaymentDate: string;
  Status: string;
  BeneficiaryName: string;
  BeneficiaryAccountId: string;
  AuthorisationRequired: boolean;
}

export interface InvestecBeneficiary {
  beneficiaryId: string;
  accountNumber: string;
  code: string;
  bank: string;
  beneficiaryName: string;
  lastPaymentAmount: string;
  lastPaymentDate: string;
  cellNo: string;
  emailAddress: string;
  name: string;
  referenceAccountNumber: string;
  referenceName: string;
  categoryId: string;
  profileId: string;
  fasterPaymentAllowed?: boolean;
}

export interface InvestecPaymentAuthorisationOptions {
  aId?: string;
  bId?: string;
  periodId?: string;
}

export interface InvestecBeneficiaryCategory {
  id: string;
  isDefault: string;
  name: string;
}

export interface InvestecBusinessAccount {
  accountId: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  electronicAccountNumber: string | null;
  nickName: string;
  availableBalance: number;
  balance: number;
  currencyCode: string;
}

export interface InvestecBusinessTransaction {
  accountId: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  lineId: string;
  transactionId: string;
  transactionDescription: string;
  postDate: string; // ISO8601 date (yyyy-mm-dd)
  valueDate: string; // ISO8601 date (yyyy-mm-dd)
  deposit: number;
  withdrawal: number;
  transactionCodeDescription: string | null;
  cardNumber: string | null;
  cardHolderName: string | null;
  paymentId: string;
  counterPartyAccountNumber: string | null;
  bulkId: string | null;
  numberOfTransactions: number | null;
  clientStatementReference: string;
  uetr: string;
  fileId: string | null;
  statementId: string;
  statementNumber: string | null;
  swiftStatementNumber: string | null;
  matchedCardKey: string | null;
  paymentReference: string;
  drCrIndicator: InvestecTransactionType;
  electronicAccountNumber: string | null;
  transactionStatus: string;
  runningBalance: number;
  supplementaryId: string;
  transactionCode: string;
  currencyCode: string;
  transactionAmount: number;
}

export interface InvestecBusinessPaymentRemittance {
  format: string; // e.g. "XMLPain NEWSTDD" - PAIN.001 ISO 20022 Standard
  payload: {
    body: {
      content: string; // base64 encoded pain.001.09 file
      contentEncoding: string; // e.g. "base64"
    };
    compression?: string;
    encryption?: {
      algorithm?: string;
      initialVector?: string;
      keyName?: string;
    };
  };
  subFormat?: string;
}

export interface InvestecBusinessPaymentStatus {
  format: string; // e.g. "XML Pain 002.001.10"
  payload: {
    compression: string;
    encryption?: {
      algorithm?: string;
      keyName?: string;
      initialVector?: string;
    };
    body: {
      content: string; // base64 encoded pain.002 status report
      contentEncoding: string;
    };
  };
}

export interface InvestecBusinessCompany {
  companyName: string;
  companyFullName?: string;
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

export type Scope =
  | "accounts"
  | "balances"
  | "transactions"
  | "transfers"
  | "beneficiarypayments"
  | "cards"
  | "documents.statements"
  | "documents.taxcertificates";

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

export type InvestecAccountPendingTransactionsResponse =
  InvestecGenericResponse<{
    transactions: InvestecPendingTransaction[];
  }>;

export type InvestecProfilesResponse = InvestecGenericResponse<
  InvestecProfile[]
>;

export type InvestecProfileAccountsResponse = InvestecGenericResponse<
  InvestecAccount[]
>;

export type InvestecAuthorisationSetupDetailsResponse =
  InvestecGenericResponse<InvestecAuthorisationSetupDetails>;

export type InvestecDocumentsResponse = InvestecGenericResponse<
  InvestecDocument[]
>;

export type InvestecAccountTransferResponse = InvestecGenericResponse<{
  TransferResponses: InvestecTransfer[];
  ErrorMessage: any;
}>;

export type InvestecAccountPaymentResponse = InvestecGenericResponse<{
  TransferResponses: InvestecPayment[];
  ErrorMessage: string
}>;

export type InvestecBeneficiariesResponse = InvestecGenericResponse<InvestecBeneficiary[]>;

export type InvestecBeneficiaryCategoriesResponse = InvestecGenericResponse<InvestecBeneficiaryCategory[]>;

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

export type InvestecCreateVirtualCardResponse = InvestecGenericResponse<{
  result: InvestecCreatedVirtualCard;
}>;

export type InvestecCardDetailsResponse = InvestecGenericResponse<{
  result: InvestecCardDetails;
}>;

export type InvestecToggleProgrammableFeatureResponse =
  | Status
  | { Enabled: boolean };

export type InvestecBusinessAccountsResponse = InvestecGenericResponse<{
  accounts: InvestecBusinessAccount[];
}>;

export type InvestecBusinessTransactionsResponse =
  | Status
  | {
      data: {
        transactions: InvestecBusinessTransaction[];
      };
      meta: {
        resultCount: number;
        totalCount: number;
        totalPages: number;
        currentPage: number;
        currentPageSize: number;
      };
    };

// unlike the generic envelope, the payment response has no links/meta
export type InvestecBusinessPaymentResponse =
  | Status
  | { data: { paymentId: string } };

export type InvestecBusinessPaymentStatusResponse =
  | Status
  | { status: InvestecBusinessPaymentStatus };

export type InvestecBusinessCompaniesResponse = InvestecGenericResponse<
  InvestecBusinessCompany[]
>;

// status is a number on errors; the payment status endpoint returns an object under the same key
export const isResponseBad = (response: any): response is Status => {
  return typeof response.status === "number";
};
