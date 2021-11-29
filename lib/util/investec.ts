import fetch, { Response } from "node-fetch";
import {
  InvestecAccountBalanceResponse,
  InvestecAccountsResponse,
  InvestecAccountTransactionsResponse,
  InvestecAuthResponse,
  InvestecTransactionTransactionType,
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
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}&scope=accounts`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
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
  const balanceResponse = await fetch(``, {
    headers: { ...getBasicHeaders(token) },
  });
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
