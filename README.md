[![npm version](https://badge.fury.io/js/investec-api.svg)](https://badge.fury.io/js/investec-api)

# investec-api

An NPM module to interact with Investec's Open API

# Usage

(This module has types, so intellisense is your friend).

## Set up client

```
import { Client } from "investec-api";
const client = await Client.create(id, secret, apiKey);
```

This creates an access token that the client will use to interact with the API.

If you start to get errors about the token no longer being valid, simply call:

```
await client.authenticate();
```

## Accounts

### List accounts

```
const accounts = await client.getAccounts("private" | "business" = "private");
```

This returns an array of `Account` objects.

### Account functions

On an `Account` object, you can:

#### Get Balance

```
const balance = await account.getBalance();
```

#### Get transactions

```
const transactions = await account.getTransactions({
  fromDate: string;
  toDate: string;
  transactionType: string;
});
```

#### Transfer

```
const transfer = await account.transfer([
  {
    account: Account;
    amount: number;
    myReference: string;
    theirReference: string;
  }
]);
```

#### Payments

```
const payment = await account.pay([
  {
    beneficiary: InvestecBeneficiary;
    myReference: string;
    theirReference: string;
    amount: number;
   }
]);
```

## Beneficiaries

### List beneficiaries

```
const beneficiaries = await client.getBeneficiaries();
```

### List beneficiary categories

```
const beneficiaryCategories = await client.getBeneficiaryCategories();
```

## Cards

### List cards

```
const cards = await client.getCards();
```

### Get Card countries

```
const countries = await Card.getCountries();
```

### Get Card currencies

```
const countries = await Card.getCurrencies();
```

### Get Card merchants

```
const countries = await Card.getMerchants();
```

### Card functions

On a `Card` object, you can:

#### Get Saved code

```
const savedCode = await card.getSavedCode();
```

#### Get published code

```
const publishedCode = await card.getPublishedCode();
```

#### Update saved code

```
const updatedCode = await card.updateSavedCode(code: string);
```

#### Publish saved code

```
const publishedCode = await card.publishSavedCode(codeId: string);
```

#### Simulate functions execution

```
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

```
const executions = await card.getExecutions();
```

#### List environment variables

```
const variables = await card.getEnvironmentVariables();
```

#### Update environment variables

```
const variables = await card.updateEnvironmentVariables({...});
```

## Investec Programmable Banking Docs

You can read more about Investec's Programmable Banking here:  https://developer.investec.com/za/api-products/documentation/U0ElMjBQQiUyMEFjY291bnQlMjBJbmZvcm1hdGlvbg%3D%3D

This library is merely an interface yo the above.


