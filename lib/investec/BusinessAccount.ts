import { Client } from "..";
import {
  InvestecBusinessAccount,
  InvestecBusinessTransaction,
  isResponseBad,
} from "../util/model";

export class BusinessAccount implements InvestecBusinessAccount {
  public accountId: string;
  public accountName: string;
  public accountNumber: string;
  public accountType: string;
  public electronicAccountNumber: string | null;
  public nickName: string;
  public availableBalance: number;
  public balance: number;
  public currencyCode: string;
  constructor(private client: Client, account: InvestecBusinessAccount) {
    this.accountId = account.accountId;
    this.accountName = account.accountName;
    this.accountNumber = account.accountNumber;
    this.accountType = account.accountType;
    this.electronicAccountNumber = account.electronicAccountNumber;
    this.nickName = account.nickName;
    this.availableBalance = account.availableBalance;
    this.balance = account.balance;
    this.currencyCode = account.currencyCode;
  }

  public async getTransactions({
    fromDate,
    toDate,
    page,
  }: {
    fromDate?: string;
    toDate?: string;
    page?: number;
  } = {}): Promise<InvestecBusinessTransaction[]> {
    if (!this.client.token) {
      throw new Error("client is not set up");
    }
    const transactions =
      await this.client.ApiClient.getInvestecBusinessTransactionsForAccount(
        this.client.token.access_token,
        { accountId: this.accountId, fromDate, toDate, page }
      );
    if (isResponseBad(transactions)) {
      throw new Error(
        `not ok response while getting transactions for business account: ${JSON.stringify({
          accountId: this.accountId,
          response: transactions,
        })}`
      );
    }
    return transactions.data.transactions;
  }
}
