import { Client } from "..";
import {
  InvestecAccount,
  InvestecBeneficiary,
  InvestecPayment,
  InvestecTransaction,
  InvestecTransactionTransactionType,
  InvestecTransfer,
  isResponseBad,
  Realm,
} from "../util/model";
import * as camelcaseKeys from "camelcase-keys";
export class Account implements InvestecAccount {
  public accountId: string;
  public accountNumber: string;
  public accountName: string;
  public referenceName: string;
  public productName: string;
  public realm: Realm;
  public meta: any;
  constructor(private client: Client, _account: InvestecAccount, realm: Realm) {
    const account = camelcaseKeys(_account);
    this.accountId = account.accountId;
    this.accountNumber = account.accountNumber;
    this.accountName = account.accountName;
    this.referenceName = account.referenceName;
    this.productName = account.productName;
    this.meta = { ..._account };
    this.realm = realm;
  }

  public async getBalance() {
    if (!this.client.token) {
      throw new Error("client is not set up");
    }
    const balance = await this.client.ApiClient.getAccountBalance(
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
    const transactions =
      await this.client.ApiClient.getInvestecTransactionsForAccount(
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
    const transferResponse =
      await this.client.ApiClient.postInvestecTransferMultiple(
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
    return transferResponse.data.TransferResponses;
  }

  public async pay(
    recipients: Array<{
      beneficiary: InvestecBeneficiary;
      myReference: string;
      theirReference: string;
      amount: number;
    }>
  ): Promise<InvestecPayment[]> {
    if (!this.client.token) {
      throw new Error("client is not set up");
    }
    const transferResponse =
      await this.client.ApiClient.postInvestecPayMultiple(
        this.client.token.access_token,
        {
          fromAccountId: this.accountId,
          toBeneficiaries: recipients.map((r) => ({
            beneficiaryId: r.beneficiary.beneficiaryId,
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
    return transferResponse.data.TransferResponses;
  }
}
