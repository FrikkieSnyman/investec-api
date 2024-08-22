import { createInvestecAPIClient } from "../util/investec";
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

export class Client {
  public static async create(
    clientId: string,
    clientSecret: string,
    apiKey: string,
    baseUrl?: string
  ) {
    const client = new Client(
      createInvestecAPIClient(baseUrl),
      clientId,
      clientSecret,
      apiKey
    );
    await client.authenticate();
    return client;
  }
  get ApiClient(): ReturnType<typeof createInvestecAPIClient> {
    return this.apiClient;
  }

  public async authenticate() {
    let response: InvestecAuthResponse;
    if (this.token?.refresh_token) {
      response = await this.apiClient.refreshInvestecOAuthToken(
        this.clientId,
        this.clientSecret,
        this.token.refresh_token
      );
    } else {
      response = await this.apiClient.getInvestecToken(
        this.clientId,
        this.clientSecret,
        this.apiKey
      );
    }

    if (isResponseBad(response)) {
      throw new Error(`bad response from investec auth: ${response}`);
    }
    this.token = response;
  }

  public getAuthRedirect(redirectUrl: string, scope: Scope[]): string {
    return encodeURI(
      this.apiClient.getInvestecOAuthRedirectUrl(
        this.clientId,
        scope,
        redirectUrl
      )
    );
  }

  public getOAuthClientFromToken(token: InvestecToken) {
    return new Client(
      this.apiClient,
      this.clientId,
      this.clientSecret,
      this.apiKey,
      token
    );
  }

  public async getOAuthClient(
    authCode: string,
    redirectUri: string
  ): Promise<Client> {
    const response = await this.apiClient.getInvestecOAuthToken(
      this.clientId,
      this.clientSecret,
      this.apiKey,
      authCode,
      redirectUri
    );
    if (isResponseBad(response)) {
      throw new Error(`bad response from investec oauth: ${response}`);
    }
    return new Client(
      this.apiClient,
      this.clientId,
      this.clientSecret,
      this.apiKey,
      response
    );
  }

  public async getAccounts(realm: Realm = "private"): Promise<Account[]> {
    if (!this.token) {
      throw new Error("client is not set up");
    }
    const accounts = await this.apiClient.getInvestecAccounts(
      this.token.access_token,
      realm
    );
    if (isResponseBad(accounts)) {
      throw new Error(
        `not ok response from getting accounts: ${JSON.stringify(accounts)}`
      );
    }
    return accounts.data.accounts.map((a) => new Account(this, a, realm));
  }

  public async getCards(): Promise<Card[]> {
    if (!this.token) {
      throw new Error("client is not set up");
    }
    const cards = await this.apiClient.getInvestecCards(
      this.token.access_token
    );
    if (isResponseBad(cards)) {
      throw new Error("not ok response from getting cards: " + cards);
    }
    return cards.data.cards.map((c) => new Card(this, c));
  }

  public async getBeneficiaries(): Promise<InvestecBeneficiary[]> {
    if (!this.token) {
      throw new Error("client is not set up");
    }
    const beneficiaries = await this.apiClient.getInvestecBeneficiaries(
      this.token.access_token
    );
    if (isResponseBad(beneficiaries)) {
      throw new Error("not ok response from getting cards: " + beneficiaries);
    }
    return beneficiaries.data;
  }

  public async getBeneficiaryCategories(): Promise<
    InvestecBeneficiaryCategory[]
  > {
    if (!this.token) {
      throw new Error("client is not set up");
    }
    const beneficiaries = await this.apiClient.getInvestecBeneficiaryCategories(
      this.token.access_token
    );
    if (isResponseBad(beneficiaries)) {
      throw new Error("not ok response from getting cards: " + beneficiaries);
    }
    return beneficiaries.data;
  }

  private constructor(
    private apiClient: ReturnType<typeof createInvestecAPIClient>,
    private clientId: string,
    private clientSecret: string,
    private apiKey: string,
    public token?: InvestecToken
  ) {}
}
