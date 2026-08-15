[![npm version](https://badge.fury.io/js/investec-api.svg)](https://badge.fury.io/js/investec-api)

# investec-api

An NPM module to interact with Investec's Open API

# Usage

(This module has types, so intellisense is your friend).

## Set up client

```ts
import { Client } from "investec-api";
const client = await Client.create(id, secret, apiKey, baseUrl?);
```

| Param   | Required | Description                                                                                                                                      |
| ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`      | `true`     | Your API key ID issued by Investec.                                                                                                              |
| `secret`  | `true`     | The corresponding API key secret.                                                                                                                |
| `apiKey`  | `true`     | The corresponding API key.                                                                                                                       |
| `baseUrl` | `false`    | Optional base URL that will be used when interacting with the Investec Open API. If none is passed, then "https://openapi.investec.com" is used. |

This creates an access token that the client will use to interact with the API.

If you start to get errors about the token no longer being valid, simply call:

```ts
await client.authenticate();
```

## Accounts

### List accounts

```ts
const accounts = await client.getAccounts("private" | "business" = "private");
```

This returns an array of `Account` objects.

### Account functions

On an `Account` object, you can:

#### Get Balance

```ts
const balance = await account.getBalance();
```

#### Get transactions

```ts
const transactions = await account.getTransactions({
  fromDate: string;
  toDate: string;
  transactionType: string;
  includePending: boolean;
});
```

#### Get pending transactions

```ts
const pendingTransactions = await account.getPendingTransactions();
```

#### Get documents

```ts
const documents = await account.getDocuments("2023-04-01", "2023-06-01");
```

#### Get document (PDF)

```ts
const pdf = await account.getDocument(documentType, documentDate); // Buffer
```

#### Transfer

```ts
const transfer = await account.transfer(
  [
    {
      account: Account;
      amount: number;
      myReference: string;
      theirReference: string;
    }
  ],
  profileId? // optional; defaults to the account's own profileId
);
```

#### Payments

```ts
const payment = await account.pay([
  {
    beneficiary: InvestecBeneficiary;
    myReference: string;
    theirReference: string;
    amount: number;
    // optional, for payments requiring authorisation
    // (ids come from client.getAuthorisationSetupDetails):
    authorisation?: { aId?: string; bId?: string; periodId?: string };
    fasterPayment?: boolean;
   }
]);
```

## Beneficiaries

### List beneficiaries

```ts
const beneficiaries = await client.getBeneficiaries();
```

### List beneficiary categories

```ts
const beneficiaryCategories = await client.getBeneficiaryCategories();
```

## Profiles

### List profiles

```ts
const profiles = await client.getProfiles();
```

### List profile accounts

```ts
const accounts = await client.getProfileAccounts(profileId);
```

### Get authorisation setup details

```ts
const details = await client.getAuthorisationSetupDetails(profileId, accountId);
```

### List profile beneficiaries

```ts
const beneficiaries = await client.getProfileBeneficiaries(profileId, accountId);
```

## Cards

### List cards

```ts
const cards = await client.getCards();
```

### Get Card countries

```ts
const countries = await Card.getCountries();
```

### Get Card currencies

```ts
const countries = await Card.getCurrencies();
```

### Get Card merchants

```ts
const countries = await Card.getMerchants();
```

### Card functions

On a `Card` object, you can:

#### Get Saved code

```ts
const savedCode = await card.getSavedCode();
```

#### Get published code

```ts
const publishedCode = await card.getPublishedCode();
```

#### Update saved code

```ts
const updatedCode = await card.updateSavedCode(code: string);
```

#### Publish saved code

```ts
const publishedCode = await card.publishSavedCode(codeId: string);
```

#### Simulate functions execution

```ts
const execution = await card.simulateFunctionExecution({
  code: string;
  centsAmount: string;
  currencyCode: string;
  merchantCode: number;
  merchantCity: string;
  countryCode: string;
});
```

#### Get previous executions

```ts
const executions = await card.getExecutions();
```

#### List environment variables

```ts
const variables = await card.getEnvironmentVariables();
```

#### Update environment variables

```ts
const variables = await card.updateEnvironmentVariables({...});
```

## Investec Programmable Banking Docs

You can read more about Investec's Programmable Banking [here](https://developer.investec.com/za/api-products/documentation/U0ElMjBQQiUyMEFjY291bnQlMjBJbmZvcm1hdGlvbg%3D%3D).

This library is merely an interface to the above.
