"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvestecCardMerchants = exports.getInvestecCardCurrencies = exports.getInvestecCardCountries = exports.postInvestecCardEnvironmentVariables = exports.getInvestecCardEnvironmentVariables = exports.getInvestecCardExecutions = exports.postInvestecSimulateExecuteFunctionCode = exports.postInvestecCardPublishSavedCode = exports.postInvestecCardSaveCode = exports.getInvestecCardPublishedCode = exports.getInvestecCardSavedCode = exports.getInvestecCards = exports.getInvestecBeneficiaryCategories = exports.getInvestecBeneficiaries = exports.postInvestecPayMultiple = exports.postInvestecTransferMultiple = exports.getInvestecTransactionsForAccount = exports.getAccountBalance = exports.getInvestecAccounts = exports.getInvestecOAuthRedirectUrl = exports.refreshInvestecOAuthToken = exports.getInvestecOAuthToken = exports.getInvestecToken = void 0;
const node_fetch_1 = require("node-fetch");
const RealmSelector = {
    business: "bb",
    private: "pb",
};
const getBasicHeaders = (token) => {
    return {
        Authorization: `Bearer ${token}`,
    };
};
const safeResponse = (response) => {
    if (response.status !== 200) {
        return { status: response.status };
    }
    return response.json();
};
const getInvestecToken = (clientId, clientSecret, apiKey, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(baseUrl);
    const tokenResponse = yield (0, node_fetch_1.default)(`${baseUrl}/identity/v2/oauth2/token`, {
        method: "POST",
        body: `grant_type=client_credentials&scope=accounts`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic  ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")} `,
            "x-api-key": apiKey,
        },
    });
    return safeResponse(tokenResponse);
});
exports.getInvestecToken = getInvestecToken;
const getInvestecOAuthToken = (clientId, clientSecret, apiKey, authCode, redirectUri, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenResponse = yield (0, node_fetch_1.default)(`${baseUrl}/identity/v2/oauth2/token`, {
        method: "POST",
        body: `grant_type=authorization_code&code=${authCode}&redirect_uri=${redirectUri}`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic  ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")} `,
            "x-api-key": apiKey,
        },
    });
    return safeResponse(tokenResponse);
});
exports.getInvestecOAuthToken = getInvestecOAuthToken;
const refreshInvestecOAuthToken = (clientId, clientSecret, refreshToken, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenResponse = yield (0, node_fetch_1.default)(`${baseUrl}/identity/v2/oauth2/token`, {
        method: "POST",
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic  ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")} `,
        },
    });
    return safeResponse(tokenResponse);
});
exports.refreshInvestecOAuthToken = refreshInvestecOAuthToken;
const getInvestecOAuthRedirectUrl = (clientId, scope, redirectUri, baseUrl) => {
    return `${baseUrl}/identity/v2/oauth2/authorize?scope=${scope.join(" ")}&client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
};
exports.getInvestecOAuthRedirectUrl = getInvestecOAuthRedirectUrl;
const getInvestecAccounts = (token, realm = "private", baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const accountsResponse = yield (0, node_fetch_1.default)(`${baseUrl}/za/${RealmSelector[realm]}/v1/accounts`, {
        headers: Object.assign({}, getBasicHeaders(token)),
    });
    return safeResponse(accountsResponse);
});
exports.getInvestecAccounts = getInvestecAccounts;
const getAccountBalance = (token, accountId, realm = "private", baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const balanceResponse = yield (0, node_fetch_1.default)(`${baseUrl}/za/${RealmSelector[realm]}/v1/accounts/${accountId}/balance`, {
        headers: Object.assign({}, getBasicHeaders(token)),
    });
    return safeResponse(balanceResponse);
});
exports.getAccountBalance = getAccountBalance;
const getInvestecTransactionsForAccount = (token, { accountId, fromDate, toDate, transactionType, }, realm = "private", baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const transactionsResponse = yield (0, node_fetch_1.default)(`${baseUrl}/za/${RealmSelector[realm]}/v1/accounts/${accountId}/transactions?${fromDate ? ` &fromDate=${fromDate}` : ""}${toDate ? `&toDate=${toDate}` : ""}
      ${transactionType ? `&transactionType=${transactionType}` : ""}`, {
        headers: Object.assign({}, getBasicHeaders(token)),
    });
    return safeResponse(transactionsResponse);
});
exports.getInvestecTransactionsForAccount = getInvestecTransactionsForAccount;
const postInvestecTransferMultiple = (token, { fromAccountId, toAccounts, }, realm = "private", baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const body = {
        transferList: toAccounts.map((t) => ({
            beneficiaryAccountId: t.accountId,
            amount: t.amount,
            myReference: t.myReference,
            theirReference: t.theirReference,
        })),
    };
    const transferResponse = yield (0, node_fetch_1.default)(`${baseUrl}/za/${RealmSelector[realm]}/v1/accounts/${fromAccountId}/transfermultiple`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: Object.assign({ "Content-Type": "application/json" }, getBasicHeaders(token)),
    });
    return safeResponse(transferResponse);
});
exports.postInvestecTransferMultiple = postInvestecTransferMultiple;
const postInvestecPayMultiple = (token, { fromAccountId, toBeneficiaries, }, realm = "private", baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const body = {
        paymentList: toBeneficiaries
    };
    const transferResponse = yield (0, node_fetch_1.default)(`${baseUrl}/za/${RealmSelector[realm]}/v1/accounts/${fromAccountId}/paymultiple`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: Object.assign({ "Content-Type": "application/json" }, getBasicHeaders(token)),
    });
    return safeResponse(transferResponse);
});
exports.postInvestecPayMultiple = postInvestecPayMultiple;
const getInvestecBeneficiaries = (token, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const beneficiariesResponse = yield (0, node_fetch_1.default)(`${baseUrl}/za/pb/v1/accounts/beneficiaries`, {
        headers: Object.assign({}, getBasicHeaders(token)),
    });
    return safeResponse(beneficiariesResponse);
});
exports.getInvestecBeneficiaries = getInvestecBeneficiaries;
const getInvestecBeneficiaryCategories = (token, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const beneficiariesResponse = yield (0, node_fetch_1.default)(`${baseUrl}/za/pb/v1/accounts/beneficiarycategories`, {
        headers: Object.assign({}, getBasicHeaders(token)),
    });
    return safeResponse(beneficiariesResponse);
});
exports.getInvestecBeneficiaryCategories = getInvestecBeneficiaryCategories;
const getInvestecCards = (token, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const cardsResponse = yield (0, node_fetch_1.default)(`${baseUrl}/za/v1/cards`, {
        headers: Object.assign({}, getBasicHeaders(token)),
    });
    return safeResponse(cardsResponse);
});
exports.getInvestecCards = getInvestecCards;
const getInvestecCardSavedCode = (token, cardKey, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const cardsResponse = yield (0, node_fetch_1.default)(`${baseUrl}/za/v1/cards/${cardKey}/code`, {
        headers: Object.assign({}, getBasicHeaders(token)),
    });
    return safeResponse(cardsResponse);
});
exports.getInvestecCardSavedCode = getInvestecCardSavedCode;
const getInvestecCardPublishedCode = (token, cardKey, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const cardsResponse = yield (0, node_fetch_1.default)(`${baseUrl}/za/v1/cards/${cardKey}/publishedcode`, {
        headers: Object.assign({}, getBasicHeaders(token)),
    });
    return safeResponse(cardsResponse);
});
exports.getInvestecCardPublishedCode = getInvestecCardPublishedCode;
const postInvestecCardSaveCode = (token, cardKey, code, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const body = { code };
    const response = yield (0, node_fetch_1.default)(`${baseUrl}/za/v1/cards/${cardKey}/code`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: Object.assign({ "Content-Type": "application/json" }, getBasicHeaders(token)),
    });
    return safeResponse(response);
});
exports.postInvestecCardSaveCode = postInvestecCardSaveCode;
const postInvestecCardPublishSavedCode = (token, cardKey, codeId, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const body = { codeid: codeId, code: "" };
    const response = yield (0, node_fetch_1.default)(`${baseUrl}/za/v1/cards/${cardKey}/code`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: Object.assign({ "Content-Type": "application/json" }, getBasicHeaders(token)),
    });
    return safeResponse(response);
});
exports.postInvestecCardPublishSavedCode = postInvestecCardPublishSavedCode;
const postInvestecSimulateExecuteFunctionCode = (token, cardKey, opts, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const body = Object.assign({}, opts);
    const response = yield (0, node_fetch_1.default)(`${baseUrl}/za/v1/cards/${cardKey}/code/execute`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: Object.assign({ "Content-Type": "application/json" }, getBasicHeaders(token)),
    });
    return safeResponse(response);
});
exports.postInvestecSimulateExecuteFunctionCode = postInvestecSimulateExecuteFunctionCode;
const getInvestecCardExecutions = (token, cardKey, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const cardsResponse = yield (0, node_fetch_1.default)(`${baseUrl}/za/v1/cards/${cardKey}/code/executions`, {
        headers: Object.assign({}, getBasicHeaders(token)),
    });
    return safeResponse(cardsResponse);
});
exports.getInvestecCardExecutions = getInvestecCardExecutions;
const getInvestecCardEnvironmentVariables = (token, cardKey, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const envResponse = yield (0, node_fetch_1.default)(`${baseUrl}/za/v1/cards/${cardKey}/environmentvariables`, {
        headers: Object.assign({}, getBasicHeaders(token)),
    });
    return safeResponse(envResponse);
});
exports.getInvestecCardEnvironmentVariables = getInvestecCardEnvironmentVariables;
const postInvestecCardEnvironmentVariables = (token, cardKey, variables, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const body = { variables };
    const response = yield (0, node_fetch_1.default)(`${baseUrl}/za/v1/cards/${cardKey}/environmentvariables`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: Object.assign({ "Content-Type": "application/json" }, getBasicHeaders(token)),
    });
    return safeResponse(response);
});
exports.postInvestecCardEnvironmentVariables = postInvestecCardEnvironmentVariables;
const getInvestecCardCountries = (token, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const envResponse = yield (0, node_fetch_1.default)(`${baseUrl}/za/v1/cards/countries`, {
        headers: Object.assign({}, getBasicHeaders(token)),
    });
    return safeResponse(envResponse);
});
exports.getInvestecCardCountries = getInvestecCardCountries;
const getInvestecCardCurrencies = (token, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const envResponse = yield (0, node_fetch_1.default)(`${baseUrl}/za/v1/cards/currencies`, {
        headers: Object.assign({}, getBasicHeaders(token)),
    });
    return safeResponse(envResponse);
});
exports.getInvestecCardCurrencies = getInvestecCardCurrencies;
const getInvestecCardMerchants = (token, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const envResponse = yield (0, node_fetch_1.default)(`${baseUrl}/za/v1/cards/merchants`, {
        headers: Object.assign({}, getBasicHeaders(token)),
    });
    return safeResponse(envResponse);
});
exports.getInvestecCardMerchants = getInvestecCardMerchants;
//# sourceMappingURL=investec.js.map