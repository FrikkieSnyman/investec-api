import {
  getInvestecAccounts,
  getInvestecBeneficiaries,
  getInvestecBeneficiaryCategories,
  getInvestecCards,
  getInvestecOAuthRedirectUrl,
  getInvestecOAuthToken,
  getInvestecToken,
  refreshInvestecOAuthToken,
} from "../util/investec";
import {
  InvestecAuthResponse,
  InvestecBeneficiary,
  InvestecBeneficiaryCategory,
  InvestecToken,
  isResponseBad,
  Realm,
  Scope,
} from "../util/model";
import { Account } from "./Account";
import { Card } from "./Card";

const INVESTEC_BASE_URL = "https://openapi.investec.com";
const INVESTEC_SANDBOX_URL = "https://openapisandbox.investec.com";

function useBaseOrSandboxUrl(sandbox?: boolean) {
  if (sandbox) {
    return INVESTEC_SANDBOX_URL;
  }
  return INVESTEC_BASE_URL;
}

export class Client {
  public get baseUrl() {
    return useBaseOrSandboxUrl(this.sandbox);
  }

  public static async create(clientId: string, clientSecret: string, apiKey: string, token: InvestecToken, sandbox: boolean) {
    const client = new Client(clientId, clientSecret, apiKey, undefined, sandbox);
    await client.authenticate();
    return client;
  }

  public async authenticate() {
    let response: InvestecAuthResponse;
    if (this.token?.refresh_token) {
      response = await refreshInvestecOAuthToken(
        this.clientId,
        this.clientSecret,
        this.token.refresh_token,
        this.baseUrl
      );
    } else {
      response = await getInvestecToken(this.clientId, this.clientSecret, this.apiKey, this.baseUrl);
    }

    if (isResponseBad(response)) {
      throw new Error(`bad response from investec auth: ${response}`);
    }
    this.token = response;
  }

  public getAuthRedirect(redirectUrl: string, scope: Scope[]): string {
    return encodeURI(
      getInvestecOAuthRedirectUrl(this.clientId, scope, redirectUrl, this.baseUrl)
    );
  }

  public getOAuthClientFromToken(token: InvestecToken) {
    return new Client(this.clientId, this.clientSecret, this.apiKey, token);
  }

  public async getOAuthClient(
    authCode: string,
    redirectUri: string
  ): Promise<Client> {
    const response = await getInvestecOAuthToken(
      this.clientId,
      this.clientSecret,
      this.apiKey,
      authCode,
      redirectUri,
      this.baseUrl
    );
    if (isResponseBad(response)) {
      throw new Error(`bad response from investec oauth: ${response}`);
    }
    return new Client(this.clientId, this.clientSecret, this.apiKey, response);
  }

  public async getAccounts(realm: Realm = "private"): Promise<Account[]> {
    if (!this.token) {
      throw new Error("client is not set up");
    }
    const accounts = await getInvestecAccounts(this.token.access_token, realm, this.baseUrl);
    if (isResponseBad(accounts)) {
      throw new Error(`not ok response from getting accounts: ${JSON.stringify(accounts)}`);
    }
    return accounts.data.accounts.map((a) => new Account(this, a, realm));
  }

  public async getCards(): Promise<Card[]> {
    if (!this.token) {
      throw new Error("client is not set up");
    }
    const cards = await getInvestecCards(this.token.access_token, this.baseUrl);
    if (isResponseBad(cards)) {
      throw new Error("not ok response from getting cards: " + cards);
    }
    return cards.data.cards.map((c) => new Card(this, c));
  }

  public async getBeneficiaries(): Promise<InvestecBeneficiary[]> {
    if (!this.token) {
      throw new Error("client is not set up");
    }
    const beneficiaries = await getInvestecBeneficiaries(this.token.access_token, this.baseUrl);
    if (isResponseBad(beneficiaries)) {
      throw new Error("not ok response from getting cards: " + beneficiaries);
    }
    return beneficiaries.data;
  }

  public async getBeneficiaryCategories(): Promise<InvestecBeneficiaryCategory[]> {
    if (!this.token) {
      throw new Error("client is not set up");
    }
    const beneficiaries = await getInvestecBeneficiaryCategories(this.token.access_token, this.baseUrl);
    if (isResponseBad(beneficiaries)) {
      throw new Error("not ok response from getting cards: " + beneficiaries);
    }

    return beneficiaries.data;
  }

  private constructor(
    private clientId: string,
    private clientSecret: string,
    private apiKey: string,
    public token?: InvestecToken,
    private sandbox?: boolean,
  ) {}
}
