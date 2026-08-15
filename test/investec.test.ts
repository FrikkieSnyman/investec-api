import { createInvestecAPIClient } from "../lib/util/investec";

jest.mock("node-fetch");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require("node-fetch") as jest.Mock;

const okJson = (data: unknown) => ({
  status: 200,
  json: async () => data,
});

const lastCall = () => {
  const [url, options] = fetch.mock.calls[fetch.mock.calls.length - 1];
  return { url: url as string, options: options ?? {} };
};

describe("createInvestecAPIClient", () => {
  const api = createInvestecAPIClient();

  beforeEach(() => {
    fetch.mockReset();
    fetch.mockResolvedValue(okJson({ data: {} }));
  });

  describe("base URL", () => {
    it("defaults to the Investec Open API", async () => {
      await api.getInvestecCards("token");
      expect(lastCall().url).toBe("https://openapi.investec.com/za/v1/cards");
    });

    it("uses a custom base URL when provided", async () => {
      const custom = createInvestecAPIClient("https://sandbox.example.com");
      await custom.getInvestecCards("token");
      expect(lastCall().url).toBe("https://sandbox.example.com/za/v1/cards");
    });
  });

  describe("auth", () => {
    it("requests a client credentials token with basic auth and api key", async () => {
      await api.getInvestecToken("id", "secret", "key");
      const { url, options } = lastCall();
      expect(url).toBe("https://openapi.investec.com/identity/v2/oauth2/token");
      expect(options.method).toBe("POST");
      expect(options.body).toBe("grant_type=client_credentials&scope=accounts");
      expect(options.headers["x-api-key"]).toBe("key");
      expect(options.headers.Authorization).toContain(
        Buffer.from("id:secret").toString("base64")
      );
    });

    it("exchanges an auth code for a token", async () => {
      await api.getInvestecOAuthToken(
        "id",
        "secret",
        "key",
        "code123",
        "https://cb"
      );
      const { options } = lastCall();
      expect(options.body).toBe(
        "grant_type=authorization_code&code=code123&redirect_uri=https://cb"
      );
    });

    it("refreshes a token", async () => {
      await api.refreshInvestecOAuthToken("id", "secret", "refresh123");
      const { options } = lastCall();
      expect(options.body).toBe(
        "grant_type=refresh_token&refresh_token=refresh123"
      );
    });

    it("builds the OAuth redirect URL", () => {
      const url = api.getInvestecOAuthRedirectUrl(
        "id",
        ["accounts", "transactions"],
        "https://cb"
      );
      expect(url).toBe(
        "https://openapi.investec.com/identity/v2/oauth2/authorize?scope=accounts transactions&client_id=id&redirect_uri=https://cb&response_type=code"
      );
    });
  });

  describe("error handling", () => {
    it("returns the status for non-200 responses", async () => {
      fetch.mockResolvedValue({ status: 429, json: async () => ({}) });
      const response = await api.getInvestecCards("token");
      expect(response).toEqual({ status: 429 });
    });
  });

  describe("accounts", () => {
    it("gets private banking accounts by default", async () => {
      await api.getInvestecAccounts("token");
      const { url, options } = lastCall();
      expect(url).toBe("https://openapi.investec.com/za/pb/v1/accounts");
      expect(options.headers.Authorization).toBe("Bearer token");
    });

    it("gets business accounts for the business realm", async () => {
      await api.getInvestecAccounts("token", "business");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/bb/v1/accounts"
      );
    });

    it("gets an account balance", async () => {
      await api.getAccountBalance("token", "acc-1");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/pb/v1/accounts/acc-1/balance"
      );
    });

    it("gets account transactions", async () => {
      await api.getInvestecTransactionsForAccount("token", {
        accountId: "acc-1",
      });
      expect(lastCall().url).toContain(
        "https://openapi.investec.com/za/pb/v1/accounts/acc-1/transactions"
      );
    });

    it("posts a transfer with the mapped transfer list", async () => {
      await api.postInvestecTransferMultiple("token", {
        fromAccountId: "acc-1",
        toAccounts: [
          {
            accountId: "acc-2",
            amount: 10,
            myReference: "mine",
            theirReference: "theirs",
          },
        ],
      });
      const { url, options } = lastCall();
      expect(url).toBe(
        "https://openapi.investec.com/za/pb/v1/accounts/acc-1/transfermultiple"
      );
      expect(JSON.parse(options.body)).toEqual({
        transferList: [
          {
            beneficiaryAccountId: "acc-2",
            amount: 10,
            myReference: "mine",
            theirReference: "theirs",
          },
        ],
      });
    });

    it("posts a payment with the payment list", async () => {
      await api.postInvestecPayMultiple("token", {
        fromAccountId: "acc-1",
        toBeneficiaries: [
          {
            beneficiaryId: "ben-1",
            amount: 5,
            myReference: "mine",
            theirReference: "theirs",
          },
        ],
      });
      const { url, options } = lastCall();
      expect(url).toBe(
        "https://openapi.investec.com/za/pb/v1/accounts/acc-1/paymultiple"
      );
      expect(JSON.parse(options.body)).toEqual({
        paymentList: [
          {
            beneficiaryId: "ben-1",
            amount: 5,
            myReference: "mine",
            theirReference: "theirs",
          },
        ],
      });
    });
  });

  describe("beneficiaries", () => {
    it("gets beneficiaries", async () => {
      await api.getInvestecBeneficiaries("token");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/pb/v1/accounts/beneficiaries"
      );
    });

    it("gets beneficiary categories", async () => {
      await api.getInvestecBeneficiaryCategories("token");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/pb/v1/accounts/beneficiarycategories"
      );
    });
  });

  describe("cards", () => {
    it("gets saved code", async () => {
      await api.getInvestecCardSavedCode("token", "card-1");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/v1/cards/card-1/code"
      );
    });

    it("gets published code", async () => {
      await api.getInvestecCardPublishedCode("token", "card-1");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/v1/cards/card-1/publishedcode"
      );
    });

    it("saves code", async () => {
      await api.postInvestecCardSaveCode("token", "card-1", "some code");
      const { options } = lastCall();
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body)).toEqual({ code: "some code" });
    });

    it("simulates code execution", async () => {
      const input = {
        code: "code",
        centsAmount: "100",
        currencyCode: "ZAR",
        merchantCode: 1,
        merchantCity: "Cape Town",
        countryCode: "ZA",
      };
      await api.postInvestecSimulateExecuteFunctionCode(
        "token",
        "card-1",
        input
      );
      const { url, options } = lastCall();
      expect(url).toBe(
        "https://openapi.investec.com/za/v1/cards/card-1/code/execute"
      );
      expect(JSON.parse(options.body)).toEqual(input);
    });

    it("gets executions", async () => {
      await api.getInvestecCardExecutions("token", "card-1");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/v1/cards/card-1/code/executions"
      );
    });

    it("gets and replaces environment variables", async () => {
      await api.getInvestecCardEnvironmentVariables("token", "card-1");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/v1/cards/card-1/environmentvariables"
      );

      await api.postInvestecCardEnvironmentVariables("token", "card-1", {
        key: "value",
      });
      const { options } = lastCall();
      expect(JSON.parse(options.body)).toEqual({
        variables: { key: "value" },
      });
    });

    it("gets countries, currencies and merchants", async () => {
      await api.getInvestecCardCountries("token");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/v1/cards/countries"
      );
      await api.getInvestecCardCurrencies("token");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/v1/cards/currencies"
      );
      await api.getInvestecCardMerchants("token");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/v1/cards/merchants"
      );
    });
  });
});
