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
  InvestecAccountPaymentResponse,
  InvestecAccountPendingTransactionsResponse,
  InvestecAuthorisationSetupDetailsResponse,
  InvestecBeneficiariesResponse,
  InvestecBeneficiaryCategoriesResponse,
  InvestecBusinessAccountsResponse,
  InvestecBusinessCompaniesResponse,
  InvestecBusinessPaymentRemittance,
  InvestecBusinessPaymentResponse,
  InvestecBusinessPaymentStatusResponse,
  InvestecBusinessTransactionsResponse,
  InvestecCardDetailsResponse,
  InvestecCreateVirtualCardInput,
  InvestecCreateVirtualCardResponse,
  InvestecDocumentsResponse,
  InvestecProfileAccountsResponse,
  InvestecProfilesResponse,
  InvestecSensitiveCardDetailsInput,
  InvestecToggleProgrammableFeatureResponse,
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

const buildQueryString = (params: {
  [key in string]: string | number | boolean | undefined;
}) => {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join("&");
  return query ? `?${query}` : "";
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
      token: string
    ): Promise<InvestecAccountsResponse> => {
      const accountsResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/pb/v1/accounts`,
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
      accountId: string
    ): Promise<InvestecAccountBalanceResponse> => {
      const balanceResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/pb/v1/accounts/${accountId}/balance`,
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
        includePending,
      }: {
        accountId: string;
        fromDate?: string;
        toDate?: string;
        transactionType?: InvestecTransactionTransactionType;
        includePending?: boolean;
      }
    ): Promise<InvestecAccountTransactionsResponse> => {
      const transactionsResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/pb/v1/accounts/${accountId}/transactions${buildQueryString(
          {
            fromDate,
            toDate,
            transactionType: transactionType ?? undefined,
            includePending,
          }
        )}`,
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

    getInvestecPendingTransactionsForAccount: async (
      token: string,
      accountId: string
    ): Promise<InvestecAccountPendingTransactionsResponse> => {
      const pendingTransactionsResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/pb/v1/accounts/${accountId}/pending-transactions`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecAccountPendingTransactionsResponse>(
        pendingTransactionsResponse
      );
    },

    postInvestecTransferMultiple: async (
      token: string,
      {
        fromAccountId,
        toAccounts,
        profileId,
      }: {
        fromAccountId: string;
        toAccounts: Array<{
          accountId: string;
          amount: number;
          myReference: string;
          theirReference: string;
        }>;
        profileId?: string;
      }
    ): Promise<InvestecAccountTransferResponse> => {
      const body = {
        transferList: toAccounts.map((t) => ({
          beneficiaryAccountId: t.accountId,
          amount: t.amount,
          myReference: t.myReference,
          theirReference: t.theirReference,
        })),
        ...(profileId ? { profileId } : {}),
      };
      const transferResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/pb/v1/accounts/${fromAccountId}/transfermultiple`,
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
          authoriserAId?: string;
          authoriserBId?: string;
          authPeriodId?: string;
          fasterPayment?: boolean;
        }>;
      }
    ): Promise<InvestecAccountPaymentResponse> => {
      const body = {
        paymentList: toBeneficiaries,
      };
      const transferResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/pb/v1/accounts/${fromAccountId}/paymultiple`,
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

    getInvestecProfiles: async (
      token: string
    ): Promise<InvestecProfilesResponse> => {
      const profilesResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/pb/v1/profiles`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecProfilesResponse>(profilesResponse);
    },

    getInvestecProfileAccounts: async (
      token: string,
      profileId: string
    ): Promise<InvestecProfileAccountsResponse> => {
      const accountsResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/pb/v1/profiles/${profileId}/accounts`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecProfileAccountsResponse>(accountsResponse);
    },

    getInvestecAuthorisationSetupDetails: async (
      token: string,
      profileId: string,
      accountId: string
    ): Promise<InvestecAuthorisationSetupDetailsResponse> => {
      const detailsResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/pb/v1/profiles/${profileId}/accounts/${accountId}/authorisationsetupdetails`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecAuthorisationSetupDetailsResponse>(
        detailsResponse
      );
    },

    getInvestecProfileBeneficiaries: async (
      token: string,
      profileId: string,
      accountId: string
    ): Promise<InvestecBeneficiariesResponse> => {
      const beneficiariesResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/pb/v1/profiles/${profileId}/accounts/${accountId}/beneficiaries`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecBeneficiariesResponse>(beneficiariesResponse);
    },

    getInvestecDocuments: async (
      token: string,
      accountId: string,
      fromDate: string,
      toDate: string
    ): Promise<InvestecDocumentsResponse> => {
      const documentsResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/pb/v1/accounts/${accountId}/documents${buildQueryString(
          { fromDate, toDate }
        )}`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecDocumentsResponse>(documentsResponse);
    },

    getInvestecDocument: async (
      token: string,
      accountId: string,
      documentType: string,
      documentDate: string
    ): Promise<Buffer | { status: number }> => {
      const documentResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/pb/v1/accounts/${accountId}/document/${documentType}/${documentDate}`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      if (documentResponse.status !== 200) {
        return { status: documentResponse.status };
      }
      return Buffer.from(await documentResponse.arrayBuffer());
    },

    getInvestecBusinessAccounts: async (
      token: string
    ): Promise<InvestecBusinessAccountsResponse> => {
      const accountsResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/bb/v2/accounts`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecBusinessAccountsResponse>(accountsResponse);
    },

    getInvestecBusinessTransactionsForAccount: async (
      token: string,
      {
        accountId,
        fromDate,
        toDate,
        page,
      }: {
        accountId: string;
        fromDate?: string;
        toDate?: string;
        page?: number;
      }
    ): Promise<InvestecBusinessTransactionsResponse> => {
      const transactionsResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/bb/v2/accounts/${accountId}/transactions${buildQueryString(
          { fromDate, toDate, page }
        )}`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecBusinessTransactionsResponse>(
        transactionsResponse
      );
    },

    postInvestecBusinessPayment: async (
      token: string,
      remittance: InvestecBusinessPaymentRemittance,
      idempotencyKey: string
    ): Promise<InvestecBusinessPaymentResponse> => {
      const paymentResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/bb/v1/payments`,
        {
          method: "POST",
          body: JSON.stringify({ remittance }),
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecBusinessPaymentResponse>(paymentResponse);
    },

    getInvestecBusinessPaymentStatus: async (
      token: string,
      paymentId: string
    ): Promise<InvestecBusinessPaymentStatusResponse> => {
      const statusResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/bb/v1/payments/${paymentId}/status`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecBusinessPaymentStatusResponse>(
        statusResponse
      );
    },

    getInvestecBusinessCompanies: async (
      token: string
    ): Promise<InvestecBusinessCompaniesResponse> => {
      const companiesResponse = await fetch(
        `${INVESTEC_BASE_URL}/za/bb/v1/companies`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecBusinessCompaniesResponse>(companiesResponse);
    },

    getInvestecCards: async (token: string): Promise<InvestecCardsResponse> => {
      const cardsResponse = await fetch(`${INVESTEC_BASE_URL}/za/v1/cards`, {
        headers: {
          ...getBasicHeaders(token),
        },
      });
      return safeResponse<InvestecCardsResponse>(cardsResponse);
    },

    postInvestecCreateVirtualCard: async (
      token: string,
      { accountNumber, embossName, embossName2 }: InvestecCreateVirtualCardInput
    ): Promise<InvestecCreateVirtualCardResponse> => {
      const body = {
        AccountNumber: accountNumber,
        EmbossName: embossName,
        ...(embossName2 ? { EmbossName2: embossName2 } : {}),
      };
      const response = await fetch(`${INVESTEC_BASE_URL}/za/v1/cards`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          ...getBasicHeaders(token),
        },
      });
      return safeResponse<InvestecCreateVirtualCardResponse>(response);
    },

    getInvestecCardDetail: async (
      token: string,
      cardKey: string
    ): Promise<InvestecCardDetailsResponse> => {
      const response = await fetch(
        `${INVESTEC_BASE_URL}/za/v1/cards/${cardKey}`,
        {
          headers: {
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecCardDetailsResponse>(response);
    },

    postInvestecCardDetailSensitive: async (
      token: string,
      cardKey: string,
      input: InvestecSensitiveCardDetailsInput
    ): Promise<InvestecCardDetailsResponse> => {
      const response = await fetch(
        `${INVESTEC_BASE_URL}/za/v1/cards/${cardKey}?extended=true`,
        {
          method: "POST",
          body: JSON.stringify(input),
          headers: {
            "Content-Type": "application/json",
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecCardDetailsResponse>(response);
    },

    postInvestecCardToggleProgrammableFeature: async (
      token: string,
      cardKey: string,
      enabled: boolean
    ): Promise<InvestecToggleProgrammableFeatureResponse> => {
      const response = await fetch(
        `${INVESTEC_BASE_URL}/za/v1/cards/${cardKey}/toggle-programmable-feature`,
        {
          method: "POST",
          body: JSON.stringify({ Enabled: enabled }),
          headers: {
            "Content-Type": "application/json",
            ...getBasicHeaders(token),
          },
        }
      );
      return safeResponse<InvestecToggleProgrammableFeatureResponse>(response);
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
      codeId: string,
      code: string = ""
    ): Promise<InvestecCardCodeResponse> => {
      const body = { codeid: codeId, code };
      const response = await fetch(
        `${INVESTEC_BASE_URL}/za/v1/cards/${cardKey}/publish`,
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
