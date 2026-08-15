import { Card } from "../lib/investec/Card";
import { Client } from "../lib";
import { InvestecCard } from "../lib/util/model";

const rawCard: InvestecCard = {
  CardKey: "card-1",
  CardNumber: "402167XXXXXX1111",
  IsProgrammable: true,
  Status: "Active",
  CardTypeCode: "VGC",
  AccountNumber: "10011001100",
  AccountId: "acc-1",
};

const makeFakeClient = (apiClient: Record<string, jest.Mock>) =>
  ({
    token: { access_token: "token" },
    ApiClient: apiClient,
  } as unknown as Client);

describe("Card", () => {
  it("exposes the card fields", () => {
    const card = new Card(makeFakeClient({}), rawCard);
    expect(card.CardKey).toBe("card-1");
    expect(card.IsProgrammable).toBe(true);
  });

  it("returns saved code", async () => {
    const getInvestecCardSavedCode = jest.fn().mockResolvedValue({
      data: { result: { codeId: "code-1", code: "code" } },
    });
    const card = new Card(makeFakeClient({ getInvestecCardSavedCode }), rawCard);
    const savedCode = await card.getSavedCode();
    expect(savedCode).toEqual({ codeId: "code-1", code: "code" });
    expect(getInvestecCardSavedCode).toHaveBeenCalledWith("token", "card-1");
  });

  it("throws on a bad saved code response", async () => {
    const getInvestecCardSavedCode = jest
      .fn()
      .mockResolvedValue({ status: 403 });
    const card = new Card(makeFakeClient({ getInvestecCardSavedCode }), rawCard);
    await expect(card.getSavedCode()).rejects.toThrow();
  });

  it("updates environment variables", async () => {
    const postInvestecCardEnvironmentVariables = jest.fn().mockResolvedValue({
      data: { result: { variables: { key: "value" } } },
    });
    const card = new Card(
      makeFakeClient({ postInvestecCardEnvironmentVariables }),
      rawCard
    );
    const variables = await card.updateEnvironmentVariables({ key: "value" });
    expect(variables).toEqual({ variables: { key: "value" } });
    expect(postInvestecCardEnvironmentVariables).toHaveBeenCalledWith(
      "token",
      "card-1",
      { key: "value" }
    );
  });

  it("gets countries via the static helper", async () => {
    const getInvestecCardCountries = jest.fn().mockResolvedValue({
      data: { result: [{ Code: "ZA", Name: "South Africa" }] },
    });
    const countries = await Card.getCountries(
      makeFakeClient({ getInvestecCardCountries })
    );
    expect(countries).toEqual([{ Code: "ZA", Name: "South Africa" }]);
  });
});
