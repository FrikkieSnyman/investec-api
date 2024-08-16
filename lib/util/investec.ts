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

export const getInvestecToken = async (
  clientId: string,
  clientSecret: string,
  apiKey: string,
  baseUrl: string
): Promise<InvestecAuthResponse> => {
  console.log(baseUrl)
  const tokenResponse = await fetch(
    `${baseUrl}/identity/v2/oauth2/token`,
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
};

export const getInvestecOAuthToken = async (
  clientId: string,
  clientSecret: string,
  apiKey: string,
  authCode: string,
  redirectUri: string,
  baseUrl: string,
): Promise<InvestecAuthResponse> => {
  const tokenResponse = await fetch(
    `${baseUrl}/identity/v2/oauth2/token`,
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
};

export const refreshInvestecOAuthToken = async (
  clientId: string,
  clientSecret: string,
  refreshToken: string,
  baseUrl: string,
): Promise<InvestecAuthResponse> => {
  const tokenResponse = await fetch(
    `${baseUrl}/identity/v2/oauth2/token`,
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
};

export const getInvestecOAuthRedirectUrl = (
  clientId: string,
  scope: Scope[],
  redirectUri: string,
  baseUrl: string,
): string => {
  return `${baseUrl}/identity/v2/oauth2/authorize?scope=${scope.join(
    " "
  )}&client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
};

export const getInvestecAccounts = async (
  token: string,
  realm: Realm = "private",
  baseUrl: string,
): Promise<InvestecAccountsResponse> => {
  const accountsResponse = await fetch(
    `${baseUrl}/za/${RealmSelector[realm]}/v1/accounts`,
    {
      headers: {
        ...getBasicHeaders(token),
      },
    }
  );
  return safeResponse<InvestecAccountsResponse>(accountsResponse);
};

export const getAccountBalance = async (
  token: string,
  accountId: string,
  realm: Realm = "private",
  baseUrl: string,
): Promise<InvestecAccountBalanceResponse> => {
  const balanceResponse = await fetch(
    `${baseUrl}/za/${RealmSelector[realm]}/v1/accounts/${accountId}/balance`,
    {
      headers: { ...getBasicHeaders(token) },
    }
  );
  return safeResponse<InvestecAccountBalanceResponse>(balanceResponse);
};

export const getInvestecTransactionsForAccount = async (
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
  realm: Realm = "private",
  baseUrl: string,
): Promise<InvestecAccountTransactionsResponse> => {
  const transactionsResponse = await fetch(
    `${baseUrl}/za/${
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
};

export const postInvestecTransferMultiple = async (
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
  realm: Realm = "private",
  baseUrl: string,
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
    `${baseUrl}/za/${RealmSelector[realm]}/v1/accounts/${fromAccountId}/transfermultiple`,
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
};

export const postInvestecPayMultiple = async (
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
  realm: Realm = "private",
  baseUrl: string,
): Promise<InvestecAccountPaymentResponse> => {
  const body = {
    paymentList: toBeneficiaries
  };
  const transferResponse = await fetch(
    `${baseUrl}/za/${RealmSelector[realm]}/v1/accounts/${fromAccountId}/paymultiple`,
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
};

export const getInvestecBeneficiaries = async (token: string, baseUrl: string) => {
  const beneficiariesResponse = await fetch(`${baseUrl}/za/pb/v1/accounts/beneficiaries`, {
    headers: {
      ...getBasicHeaders(token),
    },
  });
  return safeResponse<InvestecBeneficiariesResponse>(beneficiariesResponse);
}

export const getInvestecBeneficiaryCategories = async (token: string, baseUrl: string) => {
  const beneficiariesResponse = await fetch(`${baseUrl}/za/pb/v1/accounts/beneficiarycategories`, {
    headers: {
      ...getBasicHeaders(token),
    },
  });
  return safeResponse<InvestecBeneficiaryCategoriesResponse>(beneficiariesResponse);
}

export const getInvestecCards = async (
  token: string,
  baseUrl: string,
): Promise<InvestecCardsResponse> => {
  const cardsResponse = await fetch(`${baseUrl}/za/v1/cards`, {
    headers: {
      ...getBasicHeaders(token),
    },
  });
  return safeResponse<InvestecCardsResponse>(cardsResponse);
};

export const getInvestecCardSavedCode = async (
  token: string,
  cardKey: string,
  baseUrl: string,
): Promise<InvestecCardCodeResponse> => {
  const cardsResponse = await fetch(
    `${baseUrl}/za/v1/cards/${cardKey}/code`,
    {
      headers: {
        ...getBasicHeaders(token),
      },
    }
  );
  return safeResponse<InvestecCardCodeResponse>(cardsResponse);
};

export const getInvestecCardPublishedCode = async (
  token: string,
  cardKey: string,
  baseUrl: string,
): Promise<InvestecCardCodeResponse> => {
  const cardsResponse = await fetch(
    `${baseUrl}/za/v1/cards/${cardKey}/publishedcode`,
    {
      headers: {
        ...getBasicHeaders(token),
      },
    }
  );
  return safeResponse<InvestecCardCodeResponse>(cardsResponse);
};

export const postInvestecCardSaveCode = async (
  token: string,
  cardKey: string,
  code: string,
  baseUrl: string,
): Promise<InvestecCardCodeResponse> => {
  const body = { code };
  const response = await fetch(
    `${baseUrl}/za/v1/cards/${cardKey}/code`,
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
};

export const postInvestecCardPublishSavedCode = async (
  token: string,
  cardKey: string,
  codeId: string,
  baseUrl: string,
): Promise<InvestecCardCodeResponse> => {
  const body = { codeid: codeId, code: "" };
  const response = await fetch(
    `${baseUrl}/za/v1/cards/${cardKey}/code`,
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
};

export const postInvestecSimulateExecuteFunctionCode = async (
  token: string,
  cardKey: string,
  opts: InvestecSimulateExecutionInput,
  baseUrl: string,
): Promise<InvestecCardExecutionResponse> => {
  const body = { ...opts };
  const response = await fetch(
    `${baseUrl}/za/v1/cards/${cardKey}/code/execute`,
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
};

export const getInvestecCardExecutions = async (
  token: string,
  cardKey: string,
  baseUrl: string,
): Promise<InvestecCardExecutionResponse> => {
  const cardsResponse = await fetch(
    `${baseUrl}/za/v1/cards/${cardKey}/code/executions`,
    {
      headers: {
        ...getBasicHeaders(token),
      },
    }
  );
  return safeResponse<InvestecCardExecutionResponse>(cardsResponse);
};

export const getInvestecCardEnvironmentVariables = async (
  token: string,
  cardKey: string,
  baseUrl: string,
): Promise<InvestecCardEnvironmentVariablesResponse> => {
  const envResponse = await fetch(
    `${baseUrl}/za/v1/cards/${cardKey}/environmentvariables`,
    {
      headers: {
        ...getBasicHeaders(token),
      },
    }
  );
  return safeResponse<InvestecCardEnvironmentVariablesResponse>(envResponse);
};

export const postInvestecCardEnvironmentVariables = async (
  token: string,
  cardKey: string,
  variables: { [key in string]: string | number | boolean | Object },
  baseUrl: string,
): Promise<InvestecCardEnvironmentVariablesResponse> => {
  const body = { variables };
  const response = await fetch(
    `${baseUrl}/za/v1/cards/${cardKey}/environmentvariables`,
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
};

export const getInvestecCardCountries = async (
  token: string,
  baseUrl: string,
): Promise<InvestecCardNameCodeResponse> => {
  const envResponse = await fetch(
    `${baseUrl}/za/v1/cards/countries`,
    {
      headers: {
        ...getBasicHeaders(token),
      },
    }
  );
  return safeResponse<InvestecCardNameCodeResponse>(envResponse);
};

export const getInvestecCardCurrencies = async (
  token: string,
  baseUrl: string,
): Promise<InvestecCardNameCodeResponse> => {
  const envResponse = await fetch(
    `${baseUrl}/za/v1/cards/currencies`,
    {
      headers: {
        ...getBasicHeaders(token),
      },
    }
  );
  return safeResponse<InvestecCardNameCodeResponse>(envResponse);
};

export const getInvestecCardMerchants = async (
  token: string,
  baseUrl: string,
): Promise<InvestecCardNameCodeResponse> => {
  const envResponse = await fetch(
    `${baseUrl}/za/v1/cards/merchants`,
    {
      headers: {
        ...getBasicHeaders(token),
      },
    }
  );
  return safeResponse<InvestecCardNameCodeResponse>(envResponse);
};
