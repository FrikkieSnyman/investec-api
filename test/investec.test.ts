import { createInvestecAPIClient } from "../lib/util/investec";

const fetch = jest.fn();
global.fetch = fetch as unknown as typeof global.fetch;

const okJson = (data: unknown) => ({
  status: 200,
  json: async () => data,
});

const lastCall = () => {
  const [url, options] = fetch.mock.calls[fetch.mock.calls.length - 1];
  return { url: url as string, options: options ?? {} };
};

describe("createInvestecAPIClient", () => {
  // validation off: these tests assert requests, not response shapes
  const api = createInvestecAPIClient(undefined, { validation: "off" });

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
      const custom = createInvestecAPIClient("https://sandbox.example.com", {
        validation: "off",
      });
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
    it("gets private banking accounts", async () => {
      await api.getInvestecAccounts("token");
      const { url, options } = lastCall();
      expect(url).toBe("https://openapi.investec.com/za/pb/v1/accounts");
      expect(options.headers.Authorization).toBe("Bearer token");
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

  describe("pending transactions", () => {
    it("gets pending transactions", async () => {
      await api.getInvestecPendingTransactionsForAccount("token", "acc-1");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/pb/v1/accounts/acc-1/pending-transactions"
      );
    });

    it("passes includePending on the transactions query", async () => {
      await api.getInvestecTransactionsForAccount("token", {
        accountId: "acc-1",
        fromDate: "2024-01-01",
        includePending: true,
      });
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/pb/v1/accounts/acc-1/transactions?fromDate=2024-01-01&includePending=true"
      );
    });
  });

  describe("profiles", () => {
    it("gets profiles", async () => {
      await api.getInvestecProfiles("token");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/pb/v1/profiles"
      );
    });

    it("gets profile accounts", async () => {
      await api.getInvestecProfileAccounts("token", "prof-1");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/pb/v1/profiles/prof-1/accounts"
      );
    });

    it("gets authorisation setup details", async () => {
      await api.getInvestecAuthorisationSetupDetails("token", "prof-1", "acc-1");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/pb/v1/profiles/prof-1/accounts/acc-1/authorisationsetupdetails"
      );
    });

    it("gets profile beneficiaries", async () => {
      await api.getInvestecProfileBeneficiaries("token", "prof-1", "acc-1");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/pb/v1/profiles/prof-1/accounts/acc-1/beneficiaries"
      );
    });
  });

  describe("documents", () => {
    it("gets the document list", async () => {
      await api.getInvestecDocuments("token", "acc-1", "2023-04-01", "2023-06-01");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/pb/v1/accounts/acc-1/documents?fromDate=2023-04-01&toDate=2023-06-01"
      );
    });

    it("downloads a document as a Buffer", async () => {
      fetch.mockResolvedValue({
        status: 200,
        arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
      });
      const document = await api.getInvestecDocument(
        "token",
        "acc-1",
        "Statement",
        "2023-03-16"
      );
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/pb/v1/accounts/acc-1/document/Statement/2023-03-16"
      );
      expect(Buffer.isBuffer(document)).toBe(true);
      expect([...(document as Buffer)]).toEqual([1, 2, 3]);
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

  describe("business banking", () => {
    it("gets business accounts from the v2 endpoint", async () => {
      await api.getInvestecBusinessAccounts("token");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/bb/v2/accounts"
      );
    });

    it("gets business transactions with query params", async () => {
      await api.getInvestecBusinessTransactionsForAccount("token", {
        accountId: "acc-1",
        fromDate: "2025-02-01",
        toDate: "2025-02-15",
        page: 2,
      });
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/bb/v2/accounts/acc-1/transactions?fromDate=2025-02-01&toDate=2025-02-15&page=2"
      );
    });

    it("initiates a payment with an idempotency key", async () => {
      const remittance = {
        format: "XMLPain NEWSTDD",
        payload: { body: { content: "base64==", contentEncoding: "base64" } },
      };
      await api.postInvestecBusinessPayment("token", remittance, "idem-1");
      const { url, options } = lastCall();
      expect(url).toBe("https://openapi.investec.com/za/bb/v1/payments");
      expect(options.method).toBe("POST");
      expect(options.headers["Idempotency-Key"]).toBe("idem-1");
      expect(JSON.parse(options.body)).toEqual({ remittance });
    });

    it("gets payment status", async () => {
      await api.getInvestecBusinessPaymentStatus("token", "pay-1");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/bb/v1/payments/pay-1/status"
      );
    });

    it("gets companies", async () => {
      await api.getInvestecBusinessCompanies("token");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/bb/v1/companies"
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

    it("creates a virtual card", async () => {
      await api.postInvestecCreateVirtualCard("token", {
        accountNumber: "10011001100",
        embossName: "NAME ONE",
        embossName2: "NAME TWO",
      });
      const { url, options } = lastCall();
      expect(url).toBe("https://openapi.investec.com/za/v1/cards");
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body)).toEqual({
        AccountNumber: "10011001100",
        EmbossName: "NAME ONE",
        EmbossName2: "NAME TWO",
      });
    });

    it("gets card detail", async () => {
      await api.getInvestecCardDetail("token", "card-1");
      expect(lastCall().url).toBe(
        "https://openapi.investec.com/za/v1/cards/card-1"
      );
    });

    it("posts for sensitive card detail with extended=true", async () => {
      const input = {
        keyId: 0,
        identifier: "my key",
        appName: "app",
        modulus: "mod",
        exponent: "010001",
      };
      await api.postInvestecCardDetailSensitive("token", "card-1", input);
      const { url, options } = lastCall();
      expect(url).toBe(
        "https://openapi.investec.com/za/v1/cards/card-1?extended=true"
      );
      expect(JSON.parse(options.body)).toEqual(input);
    });

    it("publishes saved code to the publish endpoint", async () => {
      await api.postInvestecCardPublishSavedCode("token", "card-1", "code-id");
      const { url, options } = lastCall();
      expect(url).toBe(
        "https://openapi.investec.com/za/v1/cards/card-1/publish"
      );
      expect(JSON.parse(options.body)).toEqual({
        codeid: "code-id",
        code: "",
      });
    });

    it("toggles the programmable feature", async () => {
      await api.postInvestecCardToggleProgrammableFeature(
        "token",
        "card-1",
        true
      );
      const { url, options } = lastCall();
      expect(url).toBe(
        "https://openapi.investec.com/za/v1/cards/card-1/toggle-programmable-feature"
      );
      expect(JSON.parse(options.body)).toEqual({ Enabled: true });
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
