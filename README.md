# investec-api

An NPM module to interact with Investec's Open API

# Usage

(This module has types, so intellisense is your friend).

## Set up client

```
import { Client } from "investec-api";
const client = await Client.create(id, secret);
```

This creates an access token that the client will use to interact with the API.

If you start to get errors about the token no longer being valid, simply call:

```
await client.authenticate();
```

## Accounts

### List accounts

```
const accounts = await client.getAccounts();
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
const transactions = await account.getTransactions();
```

#### Transfer

_Early access_: This feature is early access, and you may need to request access to it.
(I don't have access yet, so I haven't tested this call 😇)

_Proceed with caution_

```
const transfer = await account.transfer([{recipientAccount: Account, amount: number, myReference: string, theirReference: string}]);
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
