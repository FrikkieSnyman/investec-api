"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
const investec_1 = require("../util/investec");
const model_1 = require("../util/model");
const camelcaseKeys = require("camelcase-keys");
class Account {
    constructor(client, _account, realm) {
        this.client = client;
        const account = camelcaseKeys(_account);
        this.accountId = account.accountId;
        this.accountNumber = account.accountNumber;
        this.accountName = account.accountName;
        this.referenceName = account.referenceName;
        this.productName = account.productName;
        this.meta = Object.assign({}, _account);
        this.realm = realm;
    }
    getBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.token) {
                throw new Error("client is not set up");
            }
            const balance = yield (0, investec_1.getAccountBalance)(this.client.token.access_token, this.accountId, this.realm, this.client.baseUrl);
            if ((0, model_1.isResponseBad)(balance)) {
                throw new Error(`not ok response while getting account balance: ${{
                    accountId: this.accountId,
                    response: balance,
                }}`);
            }
            return balance.data;
        });
    }
    getTransactions({ fromDate, toDate, transactionType, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.token) {
                throw new Error("client is not set up");
            }
            const transactions = yield (0, investec_1.getInvestecTransactionsForAccount)(this.client.token.access_token, { accountId: this.accountId, fromDate, toDate, transactionType }, this.realm, this.client.baseUrl);
            if ((0, model_1.isResponseBad)(transactions)) {
                throw new Error(`not ok response while getting transactions for account: ${{
                    accountId: this.accountId,
                    response: transactions,
                }}`);
            }
            return transactions.data.transactions;
        });
    }
    transfer(recipients) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.token) {
                throw new Error("client is not set up");
            }
            const transferResponse = yield (0, investec_1.postInvestecTransferMultiple)(this.client.token.access_token, {
                fromAccountId: this.accountId,
                toAccounts: recipients.map((r) => ({
                    accountId: r.account.accountId,
                    amount: r.amount,
                    myReference: r.myReference,
                    theirReference: r.theirReference,
                })),
            }, this.realm, this.client.baseUrl);
            if ((0, model_1.isResponseBad)(transferResponse)) {
                throw new Error(`not ok response while performing transfer for account: ${{
                    accountId: this.accountId,
                    response: transferResponse,
                }}`);
            }
            return transferResponse.data.TransferResponses;
        });
    }
    pay(recipients) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.token) {
                throw new Error("client is not set up");
            }
            const transferResponse = yield (0, investec_1.postInvestecPayMultiple)(this.client.token.access_token, {
                fromAccountId: this.accountId,
                toBeneficiaries: recipients.map((r) => ({
                    beneficiaryId: r.beneficiary.beneficiaryId,
                    amount: r.amount,
                    myReference: r.myReference,
                    theirReference: r.theirReference,
                })),
            }, this.realm, this.client.baseUrl);
            if ((0, model_1.isResponseBad)(transferResponse)) {
                throw new Error(`not ok response while performing transfer for account: ${{
                    accountId: this.accountId,
                    response: transferResponse,
                }}`);
            }
            return transferResponse.data.TransferResponses;
        });
    }
}
exports.Account = Account;
//# sourceMappingURL=Account.js.map