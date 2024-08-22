import fetch, { Response } from "node-fetch";
import {
  InvestecAccountBalanceResponse,
  InvestecAccountsResponse,
  InvestecAccountTransactionsResponse,
  InvestecAuthResponse,
  InvestecCardCodeResponse,
  InvestecCardNameCodeResponse,
  InvestecCardEnvironmentVariablesResponse,
  InvestecCardsResponse,
  InvestecTransactionTransactionType,
  InvestecSimulateExecutionInput,
  InvestecCardExecutionResponse,
  InvestecAccountTransferResponse,
  Scope,
  Realm,
  InvestecAccountPaymentResponse,
  InvestecBeneficiariesResponse,
  InvestecBeneficiaryCategoriesResponse,
} from "./model";

const RealmSelector: { [key in Realm]: "pb" | "bb" } = {
  business: "bb",
  private: "pb",
};

const INVESTEC_BASE_URL = "https://openapi.investec.com";

const getBasicHeaders = (token: string) => {
  return {
    Authorization: `Bearer ${token}`,
  };
};

const safeResponse = <T>(response: Response) => {
  if (response.status !== 200) {
    return { status: response.status };
  }

  return response.json() as Promise<T>;
};

export const createInvestecAPIClient = (
  baseUrl: string = "https://openapi.investec.com"
) => {
  const INVESTEC_BASE_URL = baseUrl;
  return {
    getInvestecToken: async (
      clientId: string,
      clientSecret: string,
      apiKey: string
    ): Promise<InvestecAuthResponse> => {
      const tokenResponse = await fetch(
        `${INVESTEC_BASE_URL}/identity/v2/oauth2/token`,
        {
          method: "POST",
          body: `grant_type=client_credentials&scope=accounts`,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic  ${Buffer.from(
              `${clientId}:${clientSecret}`
            ).toString("base64")} `,

            "x-api-key": apiKey,
          },
        }
      );
      return safeResponse<InvestecAuthResponse>(tokenResponse);
    },

    getInvestecOAuthToken: async (
      clientId: string,
      clientSecret: string,
      apiKey: string,
      authCode: string,
      redirectUri: string
    ): Promise<InvestecAuthResponse> => {
      const tokenResponse = await fetch(
        `${INVESTEC_BASE_URL}/identity/v2/oauth2/token`,
        {
          method: "POST",
          body: `grant_type=authorization_code&code=${authCode}&redirect_uri=${redirectUri}`,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic  ${Buffer.from(
              `${clientId}:${clientSecret}`
            ).toString("base64")} `,
            "x-api-key": apiKey,
          },
        }
      );
      return safeResponse<InvestecAuthResponse>(tokenResponse);
    },

    refreshInvestecOAuthToken: async (
      clientId: string,
      clientSecret: string,
      refreshToken: string
    ): Promise<InvestecAuthResponse> => {
      const tokenResponse = await fetch(
        `${INVESTEC_BASE_URL}/identity/v2/oauth2/token`,
        {
          method: "POST",
          body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic  ${Buffer.from(
              `${clientId}:${clientSecret}`
            ).toString("base64")} `,
          },
        }
      );
      return safeResponse<InvestecAuthResponse>(tokenResponse);
    },

    getInvestecOAuthRedirectUrl: (
      clientId: string,
      scope: Scope[],
      redirectUri: string
    ): string => {
      return `${INVESTEC_BASE_URL}/identity/v2/oauth2/authorize?scope=${scope.join(
        " "
      )}&client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    },

    getInvestecAccounts: async (
      token: string,
      realm: Realm = "private"
    ): Promise<InvestecAccountsResponse> => {
      const accountsResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/${RealmSelector[realm]}/v1/accounts`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecAccountsResponse>(accountsResponse);
    },

    getAccountBalance: async (
      token: string,
      accountId: string,
      realm: Realm = "private"
    ): Promise<InvestecAccountBalanceResponse> => {
      const balanceResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/${RealmSelector[realm]}/v1/accounts/${accountId}/balance`,
        {
          headers: { ...getBasicHeaders(token) },
        }
      );
      return safeResponse<InvestecAccountBalanceResponse>(balanceResponse);
    },

    getInvestecTransactionsForAccount: async (
      token: string,
      {
        accountId,
        fromDate,
        toDate,
        transactionType,
      }: {
        accountId: string;
        fromDate?: string;
        toDate?: string;
        transactionType?: InvestecTransactionTransactionType;
      },
      realm: Realm = "private"
    ): Promise<InvestecAccountTransactionsResponse> => {
      const transactionsResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/${
          RealmSelector[realm]
        }/v1/accounts/${accountId}/transactions?${
          fromDate ? ` &fromDate=${fromDate}` : ""
        }${toDate ? `&toDate=${toDate}` : ""}
        ${transactionType ? `&transactionType=${transactionType}` : ""}`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecAccountTransactionsResponse>(
        transactionsResponse
      );
    },

    postInvestecTransferMultiple: async (
      token: string,
      {
        fromAccountId,
        toAccounts,
      }: {
        fromAccountId: string;
        toAccounts: Array<{
          accountId: string;
          amount: number;
          myReference: string;
          theirReference: string;
        }>;
      },
      realm: Realm = "private"
    ): Promise<InvestecAccountTransferResponse> => {
      const body = {
        transferList: toAccounts.map((t) => ({
          beneficiaryAccountId: t.accountId,
          amount: t.amount,
          myReference: t.myReference,
          theirReference: t.theirReference,
        })),
      };
      const transferResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/${RealmSelector[realm]}/v1/accounts/${fromAccountId}/transfermultiple`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecAccountTransferResponse>(transferResponse);
    },

    postInvestecPayMultiple: async (
      token: string,
      {
        fromAccountId,
        toBeneficiaries,
      }: {
        fromAccountId: string;
        toBeneficiaries: Array<{
          beneficiaryId: string;
          amount: number;
          myReference: string;
          theirReference: string;
        }>;
      },
      realm: Realm = "private"
    ): Promise<InvestecAccountPaymentResponse> => {
      const body = {
        paymentList: toBeneficiaries,
      };
      const transferResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/${RealmSelector[realm]}/v1/accounts/${fromAccountId}/paymultiple`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecAccountPaymentResponse>(transferResponse);
    },

    getInvestecBeneficiaries: async (token: string) => {
      const beneficiariesResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/pb/v1/accounts/beneficiaries`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecBeneficiariesResponse>(beneficiariesResponse);
    },

    getInvestecBeneficiaryCategories: async (token: string) => {
      const beneficiariesResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/pb/v1/accounts/beneficiarycategories`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecBeneficiaryCategoriesResponse>(
        beneficiariesResponse
      );
    },

    getInvestecCards: async (token: string): Promise<InvestecCardsResponse> => {
      const cardsResponse = await fetch(`${INVESTEC_BASE_URL}/za/v1/cards`, {
        headers: {
          ...getBasicHeaders(token),
        },
      });
      return safeResponse<InvestecCardsResponse>(cardsResponse);
    },

    getInvestecCardSavedCode: async (
      token: string,
      cardKey: string
    ): Promise<InvestecCardCodeResponse> => {
      const cardsResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/v1/cards/${cardKey}/code`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecCardCodeResponse>(cardsResponse);
    },

    getInvestecCardPublishedCode: async (
      token: string,
      cardKey: string
    ): Promise<InvestecCardCodeResponse> => {
      const cardsResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/v1/cards/${cardKey}/publishedcode`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecCardCodeResponse>(cardsResponse);
    },

    postInvestecCardSaveCode: async (
      token: string,
      cardKey: string,
      code: string
    ): Promise<InvestecCardCodeResponse> => {
      const body = { code };
      const response = await fetch(
        `${INVESTEC_BASE_URL}/za/v1/cards/${cardKey}/code`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecCardCodeResponse>(response);
    },

    postInvestecCardPublishSavedCode: async (
      token: string,
      cardKey: string,
      codeId: string
    ): Promise<InvestecCardCodeResponse> => {
      const body = { codeid: codeId, code: "" };
      const response = await fetch(
        `${INVESTEC_BASE_URL}/za/v1/cards/${cardKey}/code`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecCardCodeResponse>(response);
    },

    postInvestecSimulateExecuteFunctionCode: async (
      token: string,
      cardKey: string,
      opts: InvestecSimulateExecutionInput
    ): Promise<InvestecCardExecutionResponse> => {
      const body = { ...opts };
      const response = await fetch(
        `${INVESTEC_BASE_URL}/za/v1/cards/${cardKey}/code/execute`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecCardExecutionResponse>(response);
    },

    getInvestecCardExecutions: async (
      token: string,
      cardKey: string
    ): Promise<InvestecCardExecutionResponse> => {
      const cardsResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/v1/cards/${cardKey}/code/executions`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecCardExecutionResponse>(cardsResponse);
    },

    getInvestecCardEnvironmentVariables: async (
      token: string,
      cardKey: string
    ): Promise<InvestecCardEnvironmentVariablesResponse> => {
      const envResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/v1/cards/${cardKey}/environmentvariables`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecCardEnvironmentVariablesResponse>(
        envResponse
      );
    },

    postInvestecCardEnvironmentVariables: async (
      token: string,
      cardKey: string,
      variables: { [key in string]: string | number | boolean | Object }
    ): Promise<InvestecCardEnvironmentVariablesResponse> => {
      const body = { variables };
      const response = await fetch(
        `${INVESTEC_BASE_URL}/za/v1/cards/${cardKey}/environmentvariables`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecCardEnvironmentVariablesResponse>(response);
    },

    getInvestecCardCountries: async (
      token: string
    ): Promise<InvestecCardNameCodeResponse> => {
      const envResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/v1/cards/countries`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecCardNameCodeResponse>(envResponse);
    },

    getInvestecCardCurrencies: async (
      token: string
    ): Promise<InvestecCardNameCodeResponse> => {
      const envResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/v1/cards/currencies`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecCardNameCodeResponse>(envResponse);
    },

    getInvestecCardMerchants: async (
      token: string
    ): Promise<InvestecCardNameCodeResponse> => {
      const envResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/v1/cards/merchants`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecCardNameCodeResponse>(envResponse);
    },
  };
};
