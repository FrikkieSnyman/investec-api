import { z } from "zod";

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

const transactionTypeSchema = z.enum(["DEBIT", "CREDIT"]);

export const investecAccountSchema = z.object({
  accountId: z.string(),
  accountNumber: z.string(),
  accountName: z.string(),
  referenceName: z.string(),
  productName: z.string(),
  kycCompliant: z.boolean(),
  profileId: z.string(),
  profileName: z.string(),
});
// meta is set by this library on Account instances, not returned by the API
export type InvestecAccount = z.infer<typeof investecAccountSchema> & {
  meta?: any;
};

export const investecProfileSchema = z.object({
  profileId: z.string(),
  profileName: z.string(),
  defaultProfile: z.boolean(),
});
export type InvestecProfile = z.infer<typeof investecProfileSchema>;

export const investecAuthorisationPeriodSchema = z.object({
  id: z.string(),
  description: z.string(),
});
export type InvestecAuthorisationPeriod = z.infer<
  typeof investecAuthorisationPeriodSchema
>;

export const investecAuthoriserSchema = z.object({
  authoriserId: z.string(),
  name: z.string(),
});
export type InvestecAuthoriser = z.infer<typeof investecAuthoriserSchema>;

// the lists are null on accounts with no payment authorisation configured
export const investecAuthorisationSetupDetailsSchema = z.object({
  numberOfAuthorisationRequired: z.string(),
  period: z.array(investecAuthorisationPeriodSchema).nullable(),
  authorisersListA: z.array(investecAuthoriserSchema).nullable(),
  authorisersListB: z.array(investecAuthoriserSchema).nullable(),
});
export type InvestecAuthorisationSetupDetails = z.infer<
  typeof investecAuthorisationSetupDetailsSchema
>;

export const investecDocumentSchema = z.object({
  documentType: z.string(),
  documentDate: z.string(),
});
export type InvestecDocument = z.infer<typeof investecDocumentSchema>;

export const investecCardSchema = z.object({
  CardKey: z.string(),
  CardNumber: z.string(),
  IsProgrammable: z.boolean(),
  Status: z.string(),
  CardTypeCode: z.string(),
  AccountNumber: z.string(),
  AccountId: z.string(),
  EmbossedName: z.string(),
  IsVirtualCard: z.boolean(),
});
export type InvestecCard = z.infer<typeof investecCardSchema>;

export interface InvestecCreateVirtualCardInput {
  accountNumber: string;
  embossName: string;
  embossName2?: string;
}

export const investecCreatedVirtualCardSchema = z.object({
  CardKey: z.string(),
  IsVirtualCard: z.boolean(),
  EmbossName: z.string(),
  EmbossName2: z.string(),
});
export type InvestecCreatedVirtualCard = z.infer<
  typeof investecCreatedVirtualCardSchema
>;

export const investecCardDetailsSchema = z.object({
  CardKeyHash: z.string(),
  MaskedCardNumber: z.string(),
  EmbossName: z.string(),
  EmbossName2: z.string(),
  Status: z.string(),
  AccountNumber: z.string(),
  IsVirtualCard: z.boolean(),
  ExtendedDetails: z
    .object({
      CardNumber: z.string(),
      ExpiryDate: z.string(),
      CVV2: z.string(),
    })
    .nullable(),
});
export type InvestecCardDetails = z.infer<typeof investecCardDetailsSchema>;

export interface InvestecSensitiveCardDetailsInput {
  keyId: number;
  identifier: string;
  appName: string;
  modulus: string;
  exponent: string;
}

export const investecCardCodeSchema = z.object({
  codeId: z.string(),
  code: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable(),
  error: z.any(),
});
export type InvestecCardCode = z.infer<typeof investecCardCodeSchema>;

export interface InvestecSimulateExecutionInput {
  code: string;
  centsAmount: string;
  currencyCode: string;
  merchantCode: number;
  merchantCity: string;
  countryCode: string;
}

export const investecCardExecutionSchema = z.object({
  executionId: z.string(),
  rootCodeFunctionId: z.string(),
  sandbox: z.boolean(),
  type: z.enum(["before_transaction", "after_transaction"]),
  authorizationApproved: z.boolean().nullable(),
  logs: z.array(
    z.object({
      createdAt: z.string(),
      level: z.string(),
      content: z.string(),
    })
  ),
  smsCount: z.number(),
  emailCount: z.number(),
  pushNotificationCount: z.number(),
  createdAt: z.string(),
  startedAt: z.string(),
  completedAt: z.string(),
  updatedAt: z.string(),
  Error: z.any(),
});
export type InvestecCardExecution = z.infer<typeof investecCardExecutionSchema>;

export const investecCardEnvironmentVariablesSchema = z.object({
  variables: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
  error: z.any(),
});
export type InvestecCardEnvironmentVariables = z.infer<
  typeof investecCardEnvironmentVariablesSchema
>;

export const investecNameAndCodeSchema = z.object({
  Code: z.string(),
  Name: z.string(),
});
export type InvestecNameAndCode = z.infer<typeof investecNameAndCodeSchema>;

export const investecAccountBalanceSchema = z.object({
  accountId: z.string(),
  currentBalance: z.number(),
  availableBalance: z.number(),
  budgetBalance: z.number(),
  straightBalance: z.number(),
  cashBalance: z.number(),
  currency: z.string(),
});
export type InvestecAccountBalance = z.infer<
  typeof investecAccountBalanceSchema
>;

// cardNumber and the posting/value/action dates come back null on rows
// merged in by includePending; the spec claims plain strings
export const investecTransactionSchema = z.object({
  accountId: z.string(),
  type: transactionTypeSchema,
  transactionType: z.string().nullable(),
  status: z.string(),
  description: z.string(),
  cardNumber: z.string().nullable(),
  postedOrder: z.number(),
  postingDate: z.string().nullable(), // ISO8601 date (yyyy-mm-dd)
  valueDate: z.string().nullable(), // ISO8601 date (yyyy-mm-dd)
  actionDate: z.string().nullable(), // ISO8601 date (yyyy-mm-dd)
  transactionDate: z.string(), // ISO8601 date (yyyy-mm-dd)
  amount: z.number(),
  runningBalance: z.number(),
  uuid: z.string(),
});
export type InvestecTransaction = z.infer<typeof investecTransactionSchema>;

export const investecPendingTransactionSchema = z.object({
  accountId: z.string(),
  type: transactionTypeSchema,
  status: z.string(),
  description: z.string(),
  transactionDate: z.string(), // ISO8601 date (yyyy-mm-dd)
  amount: z.number(),
});
export type InvestecPendingTransaction = z.infer<
  typeof investecPendingTransactionSchema
>;

export const investecTransferSchema = z.object({
  PaymentReferenceNumber: z.string(),
  PaymentDate: z.string(),
  Status: z.string(),
  BeneficiaryName: z.string(),
  BeneficiaryAccountId: z.string(),
  AuthorisationRequired: z.boolean(),
});
export type InvestecTransfer = z.infer<typeof investecTransferSchema>;

export const investecPaymentSchema = z.object({
  PaymentReferenceNumber: z.string(),
  PaymentDate: z.string(),
  Status: z.string(),
  BeneficiaryName: z.string(),
  BeneficiaryAccountId: z.string(),
  AuthorisationRequired: z.boolean(),
});
export type InvestecPayment = z.infer<typeof investecPaymentSchema>;

export const investecBeneficiarySchema = z.object({
  beneficiaryId: z.string(),
  accountNumber: z.string(),
  code: z.string(),
  bank: z.string(),
  beneficiaryName: z.string(),
  lastPaymentAmount: z.string(),
  lastPaymentDate: z.string(),
  cellNo: z.string().nullable(),
  emailAddress: z.string().nullable(),
  name: z.string(),
  referenceAccountNumber: z.string(),
  referenceName: z.string(),
  categoryId: z.string(),
  profileId: z.string(),
  fasterPaymentAllowed: z.boolean().optional(),
});
export type InvestecBeneficiary = z.infer<typeof investecBeneficiarySchema>;

export interface InvestecPaymentAuthorisationOptions {
  aId?: string;
  bId?: string;
  periodId?: string;
}

export const investecBeneficiaryCategorySchema = z.object({
  id: z.string(),
  isDefault: z.string(),
  name: z.string(),
});
export type InvestecBeneficiaryCategory = z.infer<
  typeof investecBeneficiaryCategorySchema
>;

export const investecBusinessAccountSchema = z.object({
  accountId: z.string(),
  accountName: z.string(),
  accountNumber: z.string(),
  accountType: z.string(),
  electronicAccountNumber: z.string().nullable(),
  nickName: z.string(),
  availableBalance: z.number(),
  balance: z.number(),
  currencyCode: z.string(),
});
export type InvestecBusinessAccount = z.infer<
  typeof investecBusinessAccountSchema
>;

export const investecBusinessTransactionSchema = z.object({
  accountId: z.string(),
  accountName: z.string(),
  accountNumber: z.string(),
  accountType: z.string(),
  lineId: z.string(),
  transactionId: z.string(),
  transactionDescription: z.string(),
  postDate: z.string(), // ISO8601 date (yyyy-mm-dd)
  valueDate: z.string(), // ISO8601 date (yyyy-mm-dd)
  deposit: z.number(),
  withdrawal: z.number(),
  transactionCodeDescription: z.string().nullable(),
  cardNumber: z.string().nullable(),
  cardHolderName: z.string().nullable(),
  paymentId: z.string(),
  counterPartyAccountNumber: z.string().nullable(),
  bulkId: z.string().nullable(),
  numberOfTransactions: z.number().nullable(),
  clientStatementReference: z.string(),
  uetr: z.string(),
  fileId: z.string().nullable(),
  statementId: z.string(),
  statementNumber: z.string().nullable(),
  swiftStatementNumber: z.string().nullable(),
  matchedCardKey: z.string().nullable(),
  paymentReference: z.string(),
  drCrIndicator: transactionTypeSchema,
  electronicAccountNumber: z.string().nullable(),
  transactionStatus: z.string(),
  runningBalance: z.number(),
  supplementaryId: z.string(),
  transactionCode: z.string(),
  currencyCode: z.string(),
  transactionAmount: z.number(),
});
export type InvestecBusinessTransaction = z.infer<
  typeof investecBusinessTransactionSchema
>;

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

export const investecBusinessPaymentStatusSchema = z.object({
  format: z.string(), // e.g. "XML Pain 002.001.10"
  payload: z.object({
    compression: z.string(),
    encryption: z
      .object({
        algorithm: z.string().optional(),
        keyName: z.string().optional(),
        initialVector: z.string().optional(),
      })
      .optional(),
    body: z.object({
      content: z.string(), // base64 encoded pain.002 status report
      contentEncoding: z.string(),
    }),
  }),
});
export type InvestecBusinessPaymentStatus = z.infer<
  typeof investecBusinessPaymentStatusSchema
>;

export const investecBusinessCompanySchema = z.object({
  companyName: z.string(),
  companyFullName: z.string().optional(),
});
export type InvestecBusinessCompany = z.infer<
  typeof investecBusinessCompanySchema
>;

type Status = { status: number };

const linksSchema = z.object({ self: z.string().nullable() });
const metaSchema = z.object({ totalPages: z.number() }).partial();
const okResponseSchema = <T extends z.ZodType>(data: T) =>
  z.object({
    data,
    links: linksSchema.optional(),
    meta: metaSchema.optional(),
  });

export type Scope =
  | "accounts"
  | "balances"
  | "transactions"
  | "transfers"
  | "beneficiarypayments"
  | "cards"
  | "documents.statements"
  | "documents.taxcertificates";

export const investecTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("Bearer"),
  expires_in: z.number(),
  scope: z.string(),
  refresh_token: z.string().optional(),
});
export type InvestecToken = z.infer<typeof investecTokenSchema>;

export type InvestecAuthResponse = Status | InvestecToken;

export const investecAccountsResponseSchema = okResponseSchema(
  z.object({ accounts: z.array(investecAccountSchema) })
);
export type InvestecAccountsResponse =
  | Status
  | z.infer<typeof investecAccountsResponseSchema>;

export const investecAccountBalanceResponseSchema = okResponseSchema(
  investecAccountBalanceSchema
);
export type InvestecAccountBalanceResponse =
  | Status
  | z.infer<typeof investecAccountBalanceResponseSchema>;

export const investecAccountTransactionsResponseSchema = okResponseSchema(
  z.object({ transactions: z.array(investecTransactionSchema) })
);
export type InvestecAccountTransactionsResponse =
  | Status
  | z.infer<typeof investecAccountTransactionsResponseSchema>;

export const investecAccountPendingTransactionsResponseSchema =
  okResponseSchema(
    z.object({ transactions: z.array(investecPendingTransactionSchema) })
  );
export type InvestecAccountPendingTransactionsResponse =
  | Status
  | z.infer<typeof investecAccountPendingTransactionsResponseSchema>;

export const investecProfilesResponseSchema = okResponseSchema(
  z.array(investecProfileSchema)
);
export type InvestecProfilesResponse =
  | Status
  | z.infer<typeof investecProfilesResponseSchema>;

export const investecProfileAccountsResponseSchema = okResponseSchema(
  z.array(investecAccountSchema)
);
export type InvestecProfileAccountsResponse =
  | Status
  | z.infer<typeof investecProfileAccountsResponseSchema>;

export const investecAuthorisationSetupDetailsResponseSchema =
  okResponseSchema(investecAuthorisationSetupDetailsSchema);
export type InvestecAuthorisationSetupDetailsResponse =
  | Status
  | z.infer<typeof investecAuthorisationSetupDetailsResponseSchema>;

export const investecDocumentsResponseSchema = okResponseSchema(
  z.array(investecDocumentSchema)
);
export type InvestecDocumentsResponse =
  | Status
  | z.infer<typeof investecDocumentsResponseSchema>;

export const investecAccountTransferResponseSchema = okResponseSchema(
  z.object({
    TransferResponses: z.array(investecTransferSchema),
    ErrorMessage: z.any(),
  })
);
export type InvestecAccountTransferResponse =
  | Status
  | z.infer<typeof investecAccountTransferResponseSchema>;

export const investecAccountPaymentResponseSchema = okResponseSchema(
  z.object({
    TransferResponses: z.array(investecPaymentSchema),
    ErrorMessage: z.any(),
  })
);
export type InvestecAccountPaymentResponse =
  | Status
  | z.infer<typeof investecAccountPaymentResponseSchema>;

export const investecBeneficiariesResponseSchema = okResponseSchema(
  z.array(investecBeneficiarySchema)
);
export type InvestecBeneficiariesResponse =
  | Status
  | z.infer<typeof investecBeneficiariesResponseSchema>;

export const investecBeneficiaryCategoriesResponseSchema = okResponseSchema(
  z.array(investecBeneficiaryCategorySchema)
);
export type InvestecBeneficiaryCategoriesResponse =
  | Status
  | z.infer<typeof investecBeneficiaryCategoriesResponseSchema>;

export const investecCardsResponseSchema = okResponseSchema(
  z.object({ cards: z.array(investecCardSchema) })
);
export type InvestecCardsResponse =
  | Status
  | z.infer<typeof investecCardsResponseSchema>;

export const investecCardCodeResponseSchema = okResponseSchema(
  z.object({ result: investecCardCodeSchema })
);
export type InvestecCardCodeResponse =
  | Status
  | z.infer<typeof investecCardCodeResponseSchema>;

// the spec documents result as an array, but the live API wraps it in
// { executionItems, error }; accept both
export const investecCardExecutionResponseSchema = okResponseSchema(
  z.object({
    result: z.union([
      z.array(investecCardExecutionSchema),
      z.object({
        executionItems: z.array(investecCardExecutionSchema),
        error: z.any(),
      }),
    ]),
  })
);
export type InvestecCardExecutionResponse =
  | Status
  | z.infer<typeof investecCardExecutionResponseSchema>;

export const investecCardEnvironmentVariablesResponseSchema = okResponseSchema(
  z.object({ result: investecCardEnvironmentVariablesSchema })
);
export type InvestecCardEnvironmentVariablesResponse =
  | Status
  | z.infer<typeof investecCardEnvironmentVariablesResponseSchema>;

export const investecCardNameCodeResponseSchema = okResponseSchema(
  z.object({ result: z.array(investecNameAndCodeSchema) })
);
export type InvestecCardNameCodeResponse =
  | Status
  | z.infer<typeof investecCardNameCodeResponseSchema>;

export const investecCreateVirtualCardResponseSchema = okResponseSchema(
  z.object({ result: investecCreatedVirtualCardSchema })
);
export type InvestecCreateVirtualCardResponse =
  | Status
  | z.infer<typeof investecCreateVirtualCardResponseSchema>;

export const investecCardDetailsResponseSchema = okResponseSchema(
  z.object({ result: investecCardDetailsSchema })
);
export type InvestecCardDetailsResponse =
  | Status
  | z.infer<typeof investecCardDetailsResponseSchema>;

export const investecToggleProgrammableFeatureResponseSchema = z.object({
  Enabled: z.boolean(),
});
export type InvestecToggleProgrammableFeatureResponse =
  | Status
  | z.infer<typeof investecToggleProgrammableFeatureResponseSchema>;

export const investecBusinessAccountsResponseSchema = okResponseSchema(
  z.object({ accounts: z.array(investecBusinessAccountSchema) })
);
export type InvestecBusinessAccountsResponse =
  | Status
  | z.infer<typeof investecBusinessAccountsResponseSchema>;

export const investecBusinessTransactionsResponseSchema = z.object({
  data: z.object({ transactions: z.array(investecBusinessTransactionSchema) }),
  meta: z
    .object({
      resultCount: z.number(),
      totalCount: z.number(),
      totalPages: z.number(),
      currentPage: z.number(),
      currentPageSize: z.number(),
    })
    .partial()
    .optional(),
});
export type InvestecBusinessTransactionsResponse =
  | Status
  | z.infer<typeof investecBusinessTransactionsResponseSchema>;

// unlike the generic envelope, the payment response has no links/meta
export const investecBusinessPaymentResponseSchema = z.object({
  data: z.object({ paymentId: z.string() }),
});
export type InvestecBusinessPaymentResponse =
  | Status
  | z.infer<typeof investecBusinessPaymentResponseSchema>;

export const investecBusinessPaymentStatusResponseSchema = z.object({
  status: investecBusinessPaymentStatusSchema,
});
export type InvestecBusinessPaymentStatusResponse =
  | Status
  | z.infer<typeof investecBusinessPaymentStatusResponseSchema>;

export const investecBusinessCompaniesResponseSchema = okResponseSchema(
  z.array(investecBusinessCompanySchema)
);
export type InvestecBusinessCompaniesResponse =
  | Status
  | z.infer<typeof investecBusinessCompaniesResponseSchema>;

// status is a number on errors; the payment status endpoint returns an object under the same key
export const isResponseBad = (response: any): response is Status => {
  return typeof response.status === "number";
};
