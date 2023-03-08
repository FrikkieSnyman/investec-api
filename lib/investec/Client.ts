import {
  getInvestecAccounts,
  getInvestecCards,
  getInvestecOAuthRedirectUrl,
  getInvestecOAuthToken,
  getInvestecToken,
  refreshInvestecOAuthToken,
} from "../util/investec";
import {
  InvestecAuthResponse,
  InvestecToken,
  isResponseBad,
  Realm,
  Scope,
} from "../util/model";
import { Account } from "./Account";
import { Card } from "./Card";

export class Client {
  public static async create(clientId: string, clientSecret: string, apiKey: string) {
    const client = new Client(clientId, clientSecret, apiKey);
    await client.authenticate();
    return client;
  }

  public async authenticate() {
    let response: InvestecAuthResponse;
    if (this.token?.refresh_token) {
      response = await refreshInvestecOAuthToken(
        this.clientId,
        this.clientSecret,
        this.token.refresh_token
      );
    } else {
      response = await getInvestecToken(this.clientId, this.clientSecret, this.apiKey);
    }

    if (isResponseBad(response)) {
      throw new Error(`bad response from investec auth: ${response}`);
    }
    this.token = response;
  }

  public getAuthRedirect(redirectUrl: string, scope: Scope[]): string {
    return encodeURI(
      getInvestecOAuthRedirectUrl(this.clientId, scope, redirectUrl)
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
      redirectUri
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
    const accounts = await getInvestecAccounts(this.token.access_token, realm);
    if (isResponseBad(accounts)) {
      throw new Error(`not ok response from getting accounts: ${JSON.stringify(accounts)}`);
    }
    return accounts.data.accounts.map((a) => new Account(this, a, realm));
  }

  public async getCards(): Promise<Card[]> {
    if (!this.token) {
      throw new Error("client is not set up");
    }
    const cards = await getInvestecCards(this.token.access_token);
    if (isResponseBad(cards)) {
      throw new Error("not ok response from getting cards: " + cards);
    }
    return cards.data.cards.map((c) => new Card(this, c));
  }

  private constructor(
    private clientId: string,
    private clientSecret: string,
    private apiKey: string,
    public token?: InvestecToken
  ) {}
}
