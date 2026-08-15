import {
  createInvestecAPIClient,
  InvestecValidationError,
} from "../lib/util/investec";

const fetch = jest.fn();
global.fetch = fetch as unknown as typeof global.fetch;

const okJson = (data: unknown) => ({
  status: 200,
  json: async () => data,
});

const validCard = {
  CardKey: "card-1",
  CardNumber: "402167XXXXXX1111",
  IsProgrammable: true,
  Status: "Active",
  CardTypeCode: "VGC",
  AccountNumber: "10011001100",
  AccountId: "acc-1",
  EmbossedName: "JOHN SMITH",
  IsVirtualCard: false,
};

const validCardsResponse = {
  data: { cards: [validCard] },
  links: { self: null },
  meta: { totalPages: 1 },
};

const invalidCardsResponse = {
  data: { cards: [{ ...validCard, IsProgrammable: "yes" }] },
};

describe("response validation", () => {
  beforeEach(() => {
    fetch.mockReset();
  });

  it("does not warn on a valid response", async () => {
    const onValidationWarning = jest.fn();
    const api = createInvestecAPIClient(undefined, { onValidationWarning });
    fetch.mockResolvedValue(okJson(validCardsResponse));
    const response = await api.getInvestecCards("token");
    expect(onValidationWarning).not.toHaveBeenCalled();
    expect(response).toEqual(validCardsResponse);
  });

  it("warns with endpoint and field path by default, but still returns the data", async () => {
    const onValidationWarning = jest.fn();
    const api = createInvestecAPIClient(undefined, { onValidationWarning });
    fetch.mockResolvedValue(okJson(invalidCardsResponse));
    const response = await api.getInvestecCards("token");
    expect(onValidationWarning).toHaveBeenCalledWith(
      "getInvestecCards",
      expect.arrayContaining([
        expect.objectContaining({ path: "data.cards.0.IsProgrammable" }),
      ])
    );
    expect(response).toEqual(invalidCardsResponse);
  });

  it("logs through console.warn when no callback is given", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const api = createInvestecAPIClient();
    fetch.mockResolvedValue(okJson(invalidCardsResponse));
    await api.getInvestecCards("token");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("getInvestecCards")
    );
    warnSpy.mockRestore();
  });

  it("throws an InvestecValidationError in strict mode", async () => {
    const api = createInvestecAPIClient(undefined, { validation: "strict" });
    fetch.mockResolvedValue(okJson(invalidCardsResponse));
    await expect(api.getInvestecCards("token")).rejects.toThrow(
      InvestecValidationError
    );
  });

  it("skips validation entirely when off", async () => {
    const onValidationWarning = jest.fn();
    const api = createInvestecAPIClient(undefined, {
      validation: "off",
      onValidationWarning,
    });
    fetch.mockResolvedValue(okJson(invalidCardsResponse));
    const response = await api.getInvestecCards("token");
    expect(onValidationWarning).not.toHaveBeenCalled();
    expect(response).toEqual(invalidCardsResponse);
  });

  it("does not validate non-200 responses", async () => {
    const onValidationWarning = jest.fn();
    const api = createInvestecAPIClient(undefined, { onValidationWarning });
    fetch.mockResolvedValue({ status: 429, json: async () => ({}) });
    const response = await api.getInvestecCards("token");
    expect(response).toEqual({ status: 429 });
    expect(onValidationWarning).not.toHaveBeenCalled();
  });

  it("accepts unknown extra fields without warning", async () => {
    const onValidationWarning = jest.fn();
    const api = createInvestecAPIClient(undefined, { onValidationWarning });
    fetch.mockResolvedValue(
      okJson({
        ...validCardsResponse,
        data: { cards: [{ ...validCard, SomeNewInvestecField: 42 }] },
      })
    );
    await api.getInvestecCards("token");
    expect(onValidationWarning).not.toHaveBeenCalled();
  });
});
