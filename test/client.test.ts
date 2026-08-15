import { Client } from "../lib";

const fetch = jest.fn();
global.fetch = fetch as unknown as typeof global.fetch;

const okJson = (data: unknown) => ({
  status: 200,
  json: async () => data,
});

const token = {
  access_token: "token",
  token_type: "Bearer",
  expires_in: 1799,
  scope: "accounts",
};

const profilesResponse = {
  data: [
    { profileId: "prof-2", profileName: "Other", defaultProfile: false },
    { profileId: "prof-1", profileName: "Mine", defaultProfile: true },
  ],
};

const liveCategoriesResponse = {
  data: [
    {
      CategoryId: "cat-1",
      DefaultCategory: "true",
      CategoryName: "Not Categorised",
    },
  ],
};

describe("Client.getBeneficiaryCategories", () => {
  beforeEach(() => {
    fetch.mockReset();
  });

  it("resolves the default profile when no profileId is given and normalises the live shape", async () => {
    fetch
      .mockResolvedValueOnce(okJson(token))
      .mockResolvedValueOnce(okJson(profilesResponse))
      .mockResolvedValueOnce(okJson(liveCategoriesResponse));
    const client = await Client.create("id", "secret", "key");
    const categories = await client.getBeneficiaryCategories();
    expect(fetch.mock.calls[2][0]).toBe(
      "https://openapi.investec.com/za/pb/v1/accounts/beneficiarycategories?profileId=prof-1"
    );
    expect(categories).toEqual([
      { id: "cat-1", isDefault: "true", name: "Not Categorised" },
    ]);
  });

  it("uses an explicit profileId without fetching profiles", async () => {
    fetch
      .mockResolvedValueOnce(okJson(token))
      .mockResolvedValueOnce(
        okJson({
          data: [{ id: "cat-1", isDefault: "true", name: "Not Categorised" }],
        })
      );
    const client = await Client.create("id", "secret", "key");
    const categories = await client.getBeneficiaryCategories("prof-9");
    expect(fetch.mock.calls[1][0]).toBe(
      "https://openapi.investec.com/za/pb/v1/accounts/beneficiarycategories?profileId=prof-9"
    );
    expect(categories).toEqual([
      { id: "cat-1", isDefault: "true", name: "Not Categorised" },
    ]);
  });

  it("throws a readable error including the response body", async () => {
    fetch
      .mockResolvedValueOnce(okJson(token))
      .mockResolvedValueOnce(okJson(profilesResponse))
      .mockResolvedValueOnce({
        status: 400,
        text: async () => '{"profileId":["The profileId field is required."]}',
      });
    const client = await Client.create("id", "secret", "key");
    await expect(client.getBeneficiaryCategories()).rejects.toThrow(
      /beneficiary categories.*profileId field is required/
    );
  });
});
