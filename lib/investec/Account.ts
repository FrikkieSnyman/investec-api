import { getAccountBalance } from "../util/investec";
import { InvestecAccount, InvestecToken, isResponseBad } from "../util/model";

export class Account implements InvestecAccount {
  constructor(
    private token: InvestecToken,
    public accountId: string,
    public accountNumber: string,
    public accountName: string,
    public referenceName: string,
    public productName: string
  ) {}

  async getBalance() {
    const balance = await getAccountBalance(
      this.token.access_token,
      this.accountId
    );
    if (isResponseBad(balance)) {
      throw new Error(
        `error while getting account balance: ${{
          accountId: this.accountId,
          response: balance,
        }}`
      );
    }
    return balance.data;
  }
}
