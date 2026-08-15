import { isResponseBad } from "../lib/util/model";

describe("isResponseBad", () => {
  it("treats an error status as bad", () => {
    expect(isResponseBad({ status: 404 })).toBe(true);
    expect(isResponseBad({ status: 500 })).toBe(true);
  });

  it("treats a data response as good", () => {
    expect(
      isResponseBad({ data: {}, links: { self: null }, meta: { totalPages: 1 } })
    ).toBe(false);
  });
});
