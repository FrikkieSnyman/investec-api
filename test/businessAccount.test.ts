import { BusinessAccount } from "../lib/investec/BusinessAccount";
import { Client } from "../lib";
import { InvestecBusinessAccount } from "../lib/util/model";

const rawAccount: InvestecBusinessAccount = {
  accountId: "12",
  accountName: "Call Deposit",
  accountNumber: "123456789",
  accountType: "Call Accounts",
  electronicAccountNumber: null,
  nickName: "Call Deposit",
  availableBalance: 9.54,
  balance: 9.54,
  currencyCode: "ZAR",
};

const makeFakeClient = (apiClient: Record<string, jest.Mock>) =>
  ({
    token: { access_token: "token" },
    ApiClient: apiClient,
  } as unknown as Client);

describe("BusinessAccount", () => {
  it("exposes the account fields", () => {
    const account = new BusinessAccount(makeFakeClient({}), rawAccount);
    expect(account.accountId).toBe("12");
    expect(account.availableBalance).toBe(9.54);
    expect(account.currencyCode).toBe("ZAR");
  });

  it("returns transactions", async () => {
    const getInvestecBusinessTransactionsForAccount = jest
      .fn()
      .mockResolvedValue({
        data: { transactions: [{ transactionId: "t-1" }] },
        meta: {
          resultCount: 1,
          totalCount: 1,
          totalPages: 1,
          currentPage: 1,
          currentPageSize: 1,
        },
      });
    const account = new BusinessAccount(
      makeFakeClient({ getInvestecBusinessTransactionsForAccount }),
      rawAccount
    );
    const transactions = await account.getTransactions({ page: 1 });
    expect(transactions).toEqual([{ transactionId: "t-1" }]);
    expect(getInvestecBusinessTransactionsForAccount).toHaveBeenCalledWith(
      "token",
      { accountId: "12", fromDate: undefined, toDate: undefined, page: 1 }
    );
  });

  it("throws on a bad transactions response", async () => {
    const getInvestecBusinessTransactionsForAccount = jest
      .fn()
      .mockResolvedValue({ status: 403 });
    const account = new BusinessAccount(
      makeFakeClient({ getInvestecBusinessTransactionsForAccount }),
      rawAccount
    );
    await expect(account.getTransactions()).rejects.toThrow();
  });
});
