import { Client } from "..";
import {
  InvestecAccount,
  InvestecBeneficiary,
  InvestecDocument,
  InvestecPayment,
  InvestecPaymentAuthorisationOptions,
  InvestecPendingTransaction,
  InvestecTransaction,
  InvestecTransactionTransactionType,
  InvestecTransfer,
  isResponseBad,
} from "../util/model";
// PB returns camelCase keys, BB v1 returns PascalCase; normalise to camelCase
const camelizeKeys = (obj: Record<string, any>): Record<string, any> =>
  Object.keys(obj).reduce((acc, key) => {
    acc[key.charAt(0).toLowerCase() + key.slice(1)] = obj[key];
    return acc;
  }, {} as Record<string, any>);

export class Account implements InvestecAccount {
  public accountId: string;
  public accountNumber: string;
  public accountName: string;
  public referenceName: string;
  public productName: string;
  public kycCompliant: boolean;
  public profileId: string;
  public profileName: string;
  public meta: any;
  constructor(private client: Client, _account: InvestecAccount) {
    const account = camelizeKeys(_account) as InvestecAccount;
    this.accountId = account.accountId;
    this.accountNumber = account.accountNumber;
    this.accountName = account.accountName;
    this.referenceName = account.referenceName;
    this.productName = account.productName;
    this.kycCompliant = account.kycCompliant;
    this.profileId = account.profileId;
    this.profileName = account.profileName;
    this.meta = { ..._account };
  }

  public async getBalance() {
    if (!this.client.token) {
      throw new Error("client is not set up");
    }
    const balance = await this.client.ApiClient.getAccountBalance(
      this.client.token.access_token,
      this.accountId
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
    includePending,
  }: {
    fromDate?: string;
    toDate?: string;
    transactionType?: InvestecTransactionTransactionType;
    includePending?: boolean;
  }): Promise<InvestecTransaction[]> {
    if (!this.client.token) {
      throw new Error("client is not set up");
    }
    const transactions =
      await this.client.ApiClient.getInvestecTransactionsForAccount(
        this.client.token.access_token,
        {
          accountId: this.accountId,
          fromDate,
          toDate,
          transactionType,
          includePending,
        }
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

  public async getPendingTransactions(): Promise<
    InvestecPendingTransaction[]
  > {
    if (!this.client.token) {
      throw new Error("client is not set up");
    }
    const transactions =
      await this.client.ApiClient.getInvestecPendingTransactionsForAccount(
        this.client.token.access_token,
        this.accountId
      );
    if (isResponseBad(transactions)) {
      throw new Error(
        `not ok response while getting pending transactions for account: ${{
          accountId: this.accountId,
          response: transactions,
        }}`
      );
    }
    return transactions.data.transactions;
  }

  public async getDocuments(
    fromDate: string,
    toDate: string
  ): Promise<InvestecDocument[]> {
    if (!this.client.token) {
      throw new Error("client is not set up");
    }
    const documents = await this.client.ApiClient.getInvestecDocuments(
      this.client.token.access_token,
      this.accountId,
      fromDate,
      toDate
    );
    if (isResponseBad(documents)) {
      throw new Error(
        `not ok response while getting documents for account: ${{
          accountId: this.accountId,
          response: documents,
        }}`
      );
    }
    return documents.data;
  }

  public async getDocument(
    documentType: string,
    documentDate: string
  ): Promise<Buffer> {
    if (!this.client.token) {
      throw new Error("client is not set up");
    }
    const document = await this.client.ApiClient.getInvestecDocument(
      this.client.token.access_token,
      this.accountId,
      documentType,
      documentDate
    );
    if (isResponseBad(document)) {
      throw new Error(
        `not ok response while getting document for account: ${{
          accountId: this.accountId,
          response: document,
        }}`
      );
    }
    return document as Buffer;
  }

  public async transfer(
    recipients: Array<{
      account: Account;
      myReference: string;
      theirReference: string;
      amount: number;
    }>,
    profileId?: string
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
          profileId: profileId ?? this.profileId,
        }
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
      authorisation?: InvestecPaymentAuthorisationOptions;
      fasterPayment?: boolean;
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
            authoriserAId: r.authorisation?.aId,
            authoriserBId: r.authorisation?.bId,
            authPeriodId: r.authorisation?.periodId,
            fasterPayment: r.fasterPayment,
          })),
        }
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
