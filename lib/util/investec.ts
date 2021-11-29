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
): Promise<any> => {
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
  return safeResponse<any>(transferResponse);
};
