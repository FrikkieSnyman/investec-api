import { InvestecAccountBalanceResponse, InvestecAccountsResponse, InvestecAccountTransactionsResponse, InvestecAuthResponse, InvestecCardCodeResponse, InvestecCardNameCodeResponse, InvestecCardEnvironmentVariablesResponse, InvestecCardsResponse, InvestecTransactionTransactionType, InvestecSimulateExecutionInput, InvestecCardExecutionResponse, InvestecAccountTransferResponse, Scope, Realm, InvestecAccountPaymentResponse, InvestecBeneficiariesResponse, InvestecBeneficiaryCategoriesResponse } from "./model";
export declare const getInvestecToken: (clientId: string, clientSecret: string, apiKey: string, baseUrl: string) => Promise<InvestecAuthResponse>;
export declare const getInvestecOAuthToken: (clientId: string, clientSecret: string, apiKey: string, authCode: string, redirectUri: string, baseUrl: string) => Promise<InvestecAuthResponse>;
export declare const refreshInvestecOAuthToken: (clientId: string, clientSecret: string, refreshToken: string, baseUrl: string) => Promise<InvestecAuthResponse>;
export declare const getInvestecOAuthRedirectUrl: (clientId: string, scope: Scope[], redirectUri: string, baseUrl: string) => string;
export declare const getInvestecAccounts: (token: string, realm: Realm | undefined, baseUrl: string) => Promise<InvestecAccountsResponse>;
export declare const getAccountBalance: (token: string, accountId: string, realm: Realm | undefined, baseUrl: string) => Promise<InvestecAccountBalanceResponse>;
export declare const getInvestecTransactionsForAccount: (token: string, { accountId, fromDate, toDate, transactionType, }: {
    accountId: string;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    transactionType?: InvestecTransactionTransactionType | undefined;
}, realm: Realm | undefined, baseUrl: string) => Promise<InvestecAccountTransactionsResponse>;
export declare const postInvestecTransferMultiple: (token: string, { fromAccountId, toAccounts, }: {
    fromAccountId: string;
    toAccounts: Array<{
        accountId: string;
        amount: number;
        myReference: string;
        theirReference: string;
    }>;
}, realm: Realm | undefined, baseUrl: string) => Promise<InvestecAccountTransferResponse>;
export declare const postInvestecPayMultiple: (token: string, { fromAccountId, toBeneficiaries, }: {
    fromAccountId: string;
    toBeneficiaries: Array<{
        beneficiaryId: string;
        amount: number;
        myReference: string;
        theirReference: string;
    }>;
}, realm: Realm | undefined, baseUrl: string) => Promise<InvestecAccountPaymentResponse>;
export declare const getInvestecBeneficiaries: (token: string, baseUrl: string) => Promise<InvestecBeneficiariesResponse | {
    status: number;
}>;
export declare const getInvestecBeneficiaryCategories: (token: string, baseUrl: string) => Promise<InvestecBeneficiaryCategoriesResponse | {
    status: number;
}>;
export declare const getInvestecCards: (token: string, baseUrl: string) => Promise<InvestecCardsResponse>;
export declare const getInvestecCardSavedCode: (token: string, cardKey: string, baseUrl: string) => Promise<InvestecCardCodeResponse>;
export declare const getInvestecCardPublishedCode: (token: string, cardKey: string, baseUrl: string) => Promise<InvestecCardCodeResponse>;
export declare const postInvestecCardSaveCode: (token: string, cardKey: string, code: string, baseUrl: string) => Promise<InvestecCardCodeResponse>;
export declare const postInvestecCardPublishSavedCode: (token: string, cardKey: string, codeId: string, baseUrl: string) => Promise<InvestecCardCodeResponse>;
export declare const postInvestecSimulateExecuteFunctionCode: (token: string, cardKey: string, opts: InvestecSimulateExecutionInput, baseUrl: string) => Promise<InvestecCardExecutionResponse>;
export declare const getInvestecCardExecutions: (token: string, cardKey: string, baseUrl: string) => Promise<InvestecCardExecutionResponse>;
export declare const getInvestecCardEnvironmentVariables: (token: string, cardKey: string, baseUrl: string) => Promise<InvestecCardEnvironmentVariablesResponse>;
export declare const postInvestecCardEnvironmentVariables: (token: string, cardKey: string, variables: {
    [x: string]: string | number | boolean | Object;
}, baseUrl: string) => Promise<InvestecCardEnvironmentVariablesResponse>;
export declare const getInvestecCardCountries: (token: string, baseUrl: string) => Promise<InvestecCardNameCodeResponse>;
export declare const getInvestecCardCurrencies: (token: string, baseUrl: string) => Promise<InvestecCardNameCodeResponse>;
export declare const getInvestecCardMerchants: (token: string, baseUrl: string) => Promise<InvestecCardNameCodeResponse>;
