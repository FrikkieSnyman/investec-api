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
} from "./model";
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
  clientSecret: string
): Promise<InvestecAuthResponse> => {
  const tokenResponse = await fetch(
    "https://openapi.investec.com/identity/v2/oauth2/token",
    {
      method: "POST",
      body: `grant_type=client_credentials&scope=accounts`,
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

export const getInvestecAccounts = async (
  token: string
): Promise<InvestecAccountsResponse> => {
  const accountsResponse = await fetch(
    `https://openapi.investec.com/za/pb/v1/accounts`,
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
  accountId: string
): Promise<InvestecAccountBalanceResponse> => {
  const balanceResponse = await fetch(
    `https://openapi.investec.com/za/pb/v1/accounts/${accountId}/balance`,
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
  }
): Promise<InvestecAccountTransactionsResponse> => {
  const transactionsResponse = await fetch(
    `https://openapi.investec.com/za/pb/v1/accounts/${accountId}/transactions?${
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
  }
): Promise<InvestecAccountTransferResponse> => {
  const body = {
    AccountId: fromAccountId,
    TransferList: toAccounts.map((t) => ({
      BeneficiaryAccountId: t.accountId,
      Amount: t.amount,
      MyReference: t.myReference,
      TheirReference: t.theirReference,
    })),
  };
  const transferResponse = await fetch(
    "https://openapi.investec.com/za/pb/v1/accounts/transfermultiple",
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

export const getInvestecCards = async (
  token: string
): Promise<InvestecCardsResponse> => {
  const cardsResponse = await fetch(
    `https://openapi.investec.com/za/v1/cards`,
    {
      headers: {
        ...getBasicHeaders(token),
      },
    }
  );
  return safeResponse<InvestecCardsResponse>(cardsResponse);
};

export const getInvestecCardSavedCode = async (
  token: string,
  cardKey: string
): Promise<InvestecCardCodeResponse> => {
  const cardsResponse = await fetch(
    `https://openapi.investec.com/za/v1/cards/${cardKey}/code`,
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
  cardKey: string
): Promise<InvestecCardCodeResponse> => {
  const cardsResponse = await fetch(
    `https://openapi.investec.com/za/v1/cards/${cardKey}/publishedcode`,
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
  code: string
): Promise<InvestecCardCodeResponse> => {
  const body = { code };
  const response = await fetch(
    `https://openapi.investec.com/za/v1/cards/${cardKey}/code`,
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
  codeId: string
): Promise<InvestecCardCodeResponse> => {
  const body = { codeid: codeId, code: "" };
  const response = await fetch(
    `https://openapi.investec.com/za/v1/cards/${cardKey}/code`,
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
  opts: InvestecSimulateExecutionInput
): Promise<InvestecCardExecutionResponse> => {
  const body = { ...opts };
  const response = await fetch(
    `https://openapi.investec.com/za/v1/cards/${cardKey}/code/execute`,
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
  cardKey: string
): Promise<InvestecCardExecutionResponse> => {
  const cardsResponse = await fetch(
    `https://openapi.investec.com/za/v1/cards/${cardKey}/code/executions`,
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
  cardKey: string
): Promise<InvestecCardEnvironmentVariablesResponse> => {
  const envResponse = await fetch(
    `https://openapi.investec.com/za/v1/cards/${cardKey}/environmentvariables`,
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
  variables: { [key in string]: string | number | boolean | Object }
): Promise<InvestecCardEnvironmentVariablesResponse> => {
  const body = { variables };
  const response = await fetch(
    `https://openapi.investec.com/za/v1/cards/${cardKey}/environmentvariables`,
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
  token: string
): Promise<InvestecCardNameCodeResponse> => {
  const envResponse = await fetch(
    `https://openapi.investec.com/za/v1/cards/countries`,
    {
      headers: {
        ...getBasicHeaders(token),
      },
    }
  );
  return safeResponse<InvestecCardNameCodeResponse>(envResponse);
};

export const getInvestecCardCurrencies = async (
  token: string
): Promise<InvestecCardNameCodeResponse> => {
  const envResponse = await fetch(
    `https://openapi.investec.com/za/v1/cards/currencies`,
    {
      headers: {
        ...getBasicHeaders(token),
      },
    }
  );
  return safeResponse<InvestecCardNameCodeResponse>(envResponse);
};

export const getInvestecCardMerchants = async (
  token: string
): Promise<InvestecCardNameCodeResponse> => {
  const envResponse = await fetch(
    `https://openapi.investec.com/za/v1/cards/merchants`,
    {
      headers: {
        ...getBasicHeaders(token),
      },
    }
  );
  return safeResponse<InvestecCardNameCodeResponse>(envResponse);
};
