import { Client } from "..";
import { InvestecAccount, InvestecBeneficiary, InvestecPayment, InvestecTransaction, InvestecTransactionTransactionType, InvestecTransfer, Realm } from "../util/model";
export declare class Account implements InvestecAccount {
    private client;
    accountId: string;
    accountNumber: string;
    accountName: string;
    referenceName: string;
    productName: string;
    realm: Realm;
    meta: any;
    constructor(client: Client, _account: InvestecAccount, realm: Realm);
    getBalance(): Promise<import("..").InvestecAccountBalance>;
    getTransactions({ fromDate, toDate, transactionType, }: {
        fromDate?: string;
        toDate?: string;
        transactionType?: InvestecTransactionTransactionType;
    }): Promise<InvestecTransaction[]>;
    transfer(recipients: Array<{
        account: Account;
        myReference: string;
        theirReference: string;
        amount: number;
    }>): Promise<InvestecTransfer[]>;
    pay(recipients: Array<{
        beneficiary: InvestecBeneficiary;
        myReference: string;
        theirReference: string;
        amount: number;
    }>): Promise<InvestecPayment[]>;
}
