import { Account } from "../lib/investec/Account";
import { Client } from "../lib";
import { InvestecAccount, InvestecBeneficiary } from "../lib/util/model";

const rawAccount: InvestecAccount = {
  accountId: "acc-1",
  accountNumber: "10010206147",
  accountName: "Mr John Doe",
  referenceName: "My Account",
  productName: "Private Bank Account",
  kycCompliant: true,
  profileId: "prof-default",
  profileName: "My Profile",
  meta: {},
};

const makeFakeClient = (apiClient: Record<string, jest.Mock>) =>
  ({
    token: { access_token: "token" },
    ApiClient: apiClient,
  } as unknown as Client);

describe("Account", () => {
  it("exposes the account fields", () => {
    const account = new Account(makeFakeClient({}), rawAccount, "private");
    expect(account.accountId).toBe("acc-1");
    expect(account.accountNumber).toBe("10010206147");
    expect(account.productName).toBe("Private Bank Account");
  });

  it("returns balance data", async () => {
    const getAccountBalance = jest.fn().mockResolvedValue({
      data: { accountId: "acc-1", currentBalance: 100 },
    });
    const account = new Account(
      makeFakeClient({ getAccountBalance }),
      rawAccount,
      "private"
    );
    const balance = await account.getBalance();
    expect(balance).toEqual({ accountId: "acc-1", currentBalance: 100 });
    expect(getAccountBalance).toHaveBeenCalledWith(
      "token",
      "acc-1",
      "private"
    );
  });

  it("throws on a bad balance response", async () => {
    const getAccountBalance = jest.fn().mockResolvedValue({ status: 500 });
    const account = new Account(
      makeFakeClient({ getAccountBalance }),
      rawAccount,
      "private"
    );
    await expect(account.getBalance()).rejects.toThrow();
  });

  it("returns transactions", async () => {
    const getInvestecTransactionsForAccount = jest.fn().mockResolvedValue({
      data: { transactions: [{ accountId: "acc-1", amount: 5 }] },
    });
    const account = new Account(
      makeFakeClient({ getInvestecTransactionsForAccount }),
      rawAccount,
      "private"
    );
    const transactions = await account.getTransactions({});
    expect(transactions).toEqual([{ accountId: "acc-1", amount: 5 }]);
  });

  it("maps transfer recipients", async () => {
    const postInvestecTransferMultiple = jest.fn().mockResolvedValue({
      data: { TransferResponses: [], ErrorMessage: null },
    });
    const fakeClient = makeFakeClient({ postInvestecTransferMultiple });
    const account = new Account(fakeClient, rawAccount, "private");
    const target = new Account(
      fakeClient,
      { ...rawAccount, accountId: "acc-2" },
      "private"
    );
    await account.transfer([
      { account: target, amount: 10, myReference: "m", theirReference: "t" },
    ]);
    expect(postInvestecTransferMultiple).toHaveBeenCalledWith(
      "token",
      {
        fromAccountId: "acc-1",
        toAccounts: [
          { accountId: "acc-2", amount: 10, myReference: "m", theirReference: "t" },
        ],
        profileId: "prof-default",
      },
      "private"
    );
  });

  it("defaults transfers to the account's profileId", async () => {
    const postInvestecTransferMultiple = jest.fn().mockResolvedValue({
      data: { TransferResponses: [], ErrorMessage: null },
    });
    const fakeClient = makeFakeClient({ postInvestecTransferMultiple });
    const account = new Account(
      fakeClient,
      { ...rawAccount, profileId: "prof-1" },
      "private"
    );
    const target = new Account(
      fakeClient,
      { ...rawAccount, accountId: "acc-2" },
      "private"
    );
    await account.transfer([
      { account: target, amount: 10, myReference: "m", theirReference: "t" },
    ]);
    expect(postInvestecTransferMultiple.mock.calls[0][1].profileId).toBe(
      "prof-1"
    );

    await account.transfer(
      [{ account: target, amount: 10, myReference: "m", theirReference: "t" }],
      "prof-override"
    );
    expect(postInvestecTransferMultiple.mock.calls[1][1].profileId).toBe(
      "prof-override"
    );
  });

  it("maps the authorisation object to the API's authoriser fields", async () => {
    const postInvestecPayMultiple = jest.fn().mockResolvedValue({
      data: { TransferResponses: [], ErrorMessage: null },
    });
    const account = new Account(
      makeFakeClient({ postInvestecPayMultiple }),
      rawAccount,
      "private"
    );
    const beneficiary = { beneficiaryId: "ben-1" } as InvestecBeneficiary;
    await account.pay([
      {
        beneficiary,
        amount: 5,
        myReference: "m",
        theirReference: "t",
        authorisation: { aId: "auth-a", bId: "auth-b", periodId: "1" },
        fasterPayment: true,
      },
    ]);
    expect(
      postInvestecPayMultiple.mock.calls[0][1].toBeneficiaries[0]
    ).toEqual({
      beneficiaryId: "ben-1",
      amount: 5,
      myReference: "m",
      theirReference: "t",
      authoriserAId: "auth-a",
      authoriserBId: "auth-b",
      authPeriodId: "1",
      fasterPayment: true,
    });
  });

  it("maps payment recipients to beneficiary ids", async () => {
    const postInvestecPayMultiple = jest.fn().mockResolvedValue({
      data: { TransferResponses: [], ErrorMessage: null },
    });
    const account = new Account(
      makeFakeClient({ postInvestecPayMultiple }),
      rawAccount,
      "private"
    );
    const beneficiary = { beneficiaryId: "ben-1" } as InvestecBeneficiary;
    await account.pay([
      { beneficiary, amount: 5, myReference: "m", theirReference: "t" },
    ]);
    expect(postInvestecPayMultiple).toHaveBeenCalledWith(
      "token",
      {
        fromAccountId: "acc-1",
        toBeneficiaries: [
          { beneficiaryId: "ben-1", amount: 5, myReference: "m", theirReference: "t" },
        ],
      },
      "private"
    );
  });

  it("throws when the client has no token", async () => {
    const account = new Account(
      { token: undefined, ApiClient: {} } as unknown as Client,
      rawAccount,
      "private"
    );
    await expect(account.getBalance()).rejects.toThrow("client is not set up");
  });
});
