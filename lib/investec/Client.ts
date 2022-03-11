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
  public static async create(clientId: string, clientSecret: string) {
    const client = new Client(clientId, clientSecret);
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
      response = await getInvestecToken(this.clientId, this.clientSecret);
    }

    if (isResponseBad(response)) {
      throw new Error(`bad response from investec auth: ${response}`);
    }
    console.log(response);
    this.token = response;
  }

  public getAuthRedirect(redirectUrl: string, scope: Scope[]): string {
    return encodeURI(
      getInvestecOAuthRedirectUrl(this.clientId, scope, redirectUrl)
    );
  }

  public getOAuthClientFromToken(token: InvestecToken) {
    return new Client(this.clientId, this.clientSecret, token);
  }

  public async getOAuthClient(
    authCode: string,
    redirectUri: string
  ): Promise<Client> {
    const response = await getInvestecOAuthToken(
      this.clientId,
      this.clientSecret,
      authCode,
      redirectUri
    );
    if (isResponseBad(response)) {
      throw new Error(`bad response from investec oauth: ${response}`);
    }
    return new Client(this.clientId, this.clientSecret, response);
  }

  public async getAccounts(realm: Realm = "private"): Promise<Account[]> {
    if (!this.token) {
      throw new Error("client is not set up");
    }
    const accounts = await getInvestecAccounts(this.token.access_token, realm);
    if (isResponseBad(accounts)) {
      throw new Error("not ok response from getting accounts: " + accounts);
    }
    return accounts.data.accounts.map((a) => new Account(this, a, realm));
  }

  public async getCards(): Promise<Card[]> {
    if (!this.token) {
      throw new Error("client is not set up");
    }
    const accounts = await getInvestecCards(this.token.access_token);
    if (isResponseBad(accounts)) {
      throw new Error("not ok response from getting cards: " + accounts);
    }
    return accounts.data.cards.map((c) => new Card(this, c));
  }

  private constructor(
    private clientId: string,
    private clientSecret: string,
    public token?: InvestecToken
  ) {}
}
