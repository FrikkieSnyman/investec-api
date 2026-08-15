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

## Response validation

Every API response is checked against a zod schema derived from Investec's OpenAPI specs, since the spec and the live API have been known to drift.

```ts
const client = await Client.create(id, secret, apiKey, baseUrl, {
  validation: "warn", // "warn" (default) | "strict" | "off"
  onValidationWarning: (endpoint, issues) => {
    // default logs to console.warn
  },
});
```

- `warn` (default): mismatches are reported (endpoint + field path) and the data is returned as-is.
- `strict`: mismatches throw an `InvestecValidationError`.
- `off`: no validation.

Unknown extra fields never warn; only missing or wrongly-typed known fields do.

## Accounts (Private Banking)

### List accounts

```ts
const accounts = await client.getAccounts();
```

This returns an array of `Account` objects.

> **Breaking change**: `getAccounts` no longer takes a realm. Business (CIB) accounts are a separate domain with their own shape and endpoints; use `client.getBusinessAccounts()` instead.

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

## Business Banking (CIB)

### List business accounts

```ts
const accounts = await client.getBusinessAccounts(); // BusinessAccount[]
```

### Business account transactions

```ts
const transactions = await businessAccount.getTransactions({
  fromDate?: string;
  toDate?: string;
  page?: number;
});
```

### Initiate payment

Takes a PAIN.001 (ISO 20022) remittance payload and an idempotency key.

```ts
const { paymentId } = await client.initiateBusinessPayment(
  {
    format: "XMLPain NEWSTDD",
    payload: {
      body: {
        content: base64EncodedPain001File,
        contentEncoding: "base64",
      },
    },
  },
  idempotencyKey
);
```

### Payment status

```ts
const status = await client.getBusinessPaymentStatus(paymentId);
```

### List companies

```ts
const companies = await client.getBusinessCompanies();
```

## Cards

### List cards

```ts
const cards = await client.getCards();
```

### Create virtual card

```ts
const virtualCard = await Card.createVirtualCard(client, {
  accountNumber: string;
  embossName: string;
  embossName2?: string;
});
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

#### Get card detail

```ts
const detail = await card.getDetail();
```

#### Get card detail with sensitive information

Requires an RSA (2048) key pair; the API encrypts card number, expiry date and CVV with your public key (returned in `ExtendedDetails`).

```ts
const detail = await card.getSensitiveDetail({
  keyId: number;
  identifier: string;
  appName: string;
  modulus: string;
  exponent: string;
});
```

#### Toggle programmable feature

```ts
const enabled = await card.toggleProgrammableFeature(true | false);
```

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
const publishedCode = await card.publishSavedCode(codeId: string, code?: string);
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
