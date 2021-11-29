import {
  getInvestecAccounts,
  getInvestecCards,
  getInvestecToken,
} from "../util/investec";
import { InvestecToken, isResponseBad } from "../util/model";
import { Account } from "./Account";
import { Card } from "./Card";

export class Client {
  public static async create(clientId: string, clientSecret: string) {
    const client = new Client(clientId, clientSecret);
    await client.authenticate();
    return client;
  }
  public token: InvestecToken | undefined;

  public async authenticate() {
    const response = await getInvestecToken(this.clientId, this.clientSecret);

    if (isResponseBad(response)) {
      throw new Error(`bad response from investect auth: ${response}`);
    }
    this.token = response;
  }
  public async getAccounts(): Promise<Account[]> {
    if (!this.token) {
      throw new Error("client is not set up");
    }
    const accounts = await getInvestecAccounts(this.token.access_token);
    if (isResponseBad(accounts)) {
      throw new Error("not ok response from getting accounts: " + accounts);
    }
    return accounts.data.accounts.map((a) => new Account(this, a));
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

  private constructor(private clientId: string, private clientSecret: string) {}
}
