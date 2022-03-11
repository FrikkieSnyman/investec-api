import { Client } from "..";
import {
  getAccountBalance,
  getInvestecTransactionsForAccount,
  postInvestecTransferMultiple,
} from "../util/investec";
import {
  InvestecAccount,
  InvestecTransaction,
  InvestecTransactionTransactionType,
  InvestecTransfer,
  isResponseBad,
  Realm,
} from "../util/model";

export class Account implements InvestecAccount {
  public accountId: string;
  public accountNumber: string;
  public accountName: string;
  public referenceName: string;
  public productName: string;
  public realm: Realm;
  constructor(private client: Client, account: InvestecAccount, realm: Realm) {
    this.accountId = account.accountId;
    this.accountNumber = account.accountNumber;
    this.accountName = account.accountName;
    this.referenceName = account.referenceName;
    this.productName = account.productName;
    this.realm = realm;
  }

  public async getBalance() {
    if (!this.client.token) {
      throw new Error("client is not set up");
    }
    const balance = await getAccountBalance(
      this.client.token.access_token,
      this.accountId,
      this.realm
    );
    if (isResponseBad(balance)) {
      throw new Error(
        `not ok response while getting account balance: ${{
          accountId: this.accountId,
          response: balance,
        }}`
      );
    }
    return balance.data;
  }

  public async getTransactions({
    fromDate,
    toDate,
    transactionType,
  }: {
    fromDate?: string;
    toDate?: string;
    transactionType?: InvestecTransactionTransactionType;
  }): Promise<InvestecTransaction[]> {
    if (!this.client.token) {
      throw new Error("client is not set up");
    }
    const transactions = await getInvestecTransactionsForAccount(
      this.client.token.access_token,
      { accountId: this.accountId, fromDate, toDate, transactionType },
      this.realm
    );
    if (isResponseBad(transactions)) {
      throw new Error(
        `not ok response while getting transactions for account: ${{
          accountId: this.accountId,
          response: transactions,
        }}`
      );
    }
    return transactions.data.transactions;
  }

  public async transfer(
    recipients: Array<{
      account: Account;
      myReference: string;
      theirReference: string;
      amount: number;
    }>
  ): Promise<InvestecTransfer[]> {
    if (!this.client.token) {
      throw new Error("client is not set up");
    }
    const transferResponse = await postInvestecTransferMultiple(
      this.client.token.access_token,
      {
        fromAccountId: this.accountId,
        toAccounts: recipients.map((r) => ({
          accountId: r.account.accountId,
          amount: r.amount,
          myReference: r.myReference,
          theirReference: r.theirReference,
        })),
      },
      this.realm
    );
    if (isResponseBad(transferResponse)) {
      throw new Error(
        `not ok response while performing transfer for account: ${{
          accountId: this.accountId,
          response: transferResponse,
        }}`
      );
    }
    return transferResponse.data.transferResponse.TransferResponses;
  }
}
