export declare type InvestecTransactionType = "DEBIT" | "CREDIT";
export declare type InvestecTransactionTransactionType = "CardPurchases" | "VASTransactions" | "OnlineBankingPayments" | "DebitOrders" | "Deposits" | "ATMWithdrawals" | "FeesAndInterest" | string | null;
export declare type InvestecTransactionStatus = string;
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
    variables: {
        [key in string]: string | number | boolean | Object;
    };
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
    postingDate: string;
    valueDate: string;
    actionDate: string;
    transactionDate: string;
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
}
export interface InvestecBeneficiaryCategory {
    id: string;
    isDefault: string;
    name: string;
}
declare type Status = {
    status: number;
};
declare type InvestecGenericOKResponse<Data> = {
    data: Data;
    links: {
        self: string | null;
    };
    meta: {
        totalPages: number;
    };
};
declare type InvestecGenericResponse<Data> = Status | InvestecGenericOKResponse<Data>;
export declare type Realm = "business" | "private";
export declare type Scope = "accounts" | "transactions";
export declare type InvestecAuthResponse = Status | InvestecToken;
export declare type InvestecToken = {
    access_token: string;
    token_type: "Bearer";
    expires_in: number;
    scope: Scope;
    refresh_token?: string;
};
export declare type InvestecAccountsResponse = InvestecGenericResponse<{
    accounts: InvestecAccount[];
}>;
export declare type InvestecAccountBalanceResponse = InvestecGenericResponse<InvestecAccountBalance>;
export declare type InvestecAccountTransactionsResponse = InvestecGenericResponse<{
    transactions: InvestecTransaction[];
}>;
export declare type InvestecAccountTransferResponse = InvestecGenericResponse<{
    TransferResponses: InvestecTransfer[];
    ErrorMessage: any;
}>;
export declare type InvestecAccountPaymentResponse = InvestecGenericResponse<{
    TransferResponses: InvestecPayment[];
    ErrorMessage: string;
}>;
export declare type InvestecBeneficiariesResponse = InvestecGenericResponse<InvestecBeneficiary[]>;
export declare type InvestecBeneficiaryCategoriesResponse = InvestecGenericResponse<InvestecBeneficiaryCategory[]>;
export declare type InvestecCardsResponse = InvestecGenericResponse<{
    cards: InvestecCard[];
}>;
export declare type InvestecCardCodeResponse = InvestecGenericResponse<{
    result: InvestecCardCode;
}>;
export declare type InvestecCardExecutionResponse = InvestecGenericResponse<{
    result: InvestecCardExecution[];
}>;
export declare type InvestecCardEnvironmentVariablesResponse = InvestecGenericResponse<{
    result: InvestecCardEnvironmentVariables;
}>;
export declare type InvestecCardNameCodeResponse = InvestecGenericResponse<{
    result: InvestecNameAndCode[];
}>;
export declare const isResponseBad: (response: any) => response is Status;
export {};
