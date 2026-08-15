import { getDateISO8601String } from "../lib/util/date";

describe("getDateISO8601String", () => {
  it("formats a date as yyyy-mm-dd", () => {
    expect(getDateISO8601String(new Date("2024-03-05T13:45:00Z"))).toBe(
      "2024-03-05"
    );
  });
});
