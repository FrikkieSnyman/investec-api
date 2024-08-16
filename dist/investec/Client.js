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
exports.Client = void 0;
const investec_1 = require("../util/investec");
const model_1 = require("../util/model");
const Account_1 = require("./Account");
const Card_1 = require("./Card");
const INVESTEC_BASE_URL = "https://openapi.investec.com";
const INVESTEC_SANDBOX_URL = "https://openapisandbox.investec.com";
function useBaseOrSandboxUrl(sandbox) {
    if (sandbox) {
        return INVESTEC_SANDBOX_URL;
    }
    return INVESTEC_BASE_URL;
}
class Client {
    constructor(clientId, clientSecret, apiKey, token, sandbox) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.apiKey = apiKey;
        this.token = token;
        this.sandbox = sandbox;
    }
    get baseUrl() {
        return useBaseOrSandboxUrl(this.sandbox);
    }
    static create(clientId, clientSecret, apiKey, token, sandbox) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new Client(clientId, clientSecret, apiKey, undefined, sandbox);
            yield client.authenticate();
            return client;
        });
    }
    authenticate() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            if ((_a = this.token) === null || _a === void 0 ? void 0 : _a.refresh_token) {
                response = yield (0, investec_1.refreshInvestecOAuthToken)(this.clientId, this.clientSecret, this.token.refresh_token, this.baseUrl);
            }
            else {
                response = yield (0, investec_1.getInvestecToken)(this.clientId, this.clientSecret, this.apiKey, this.baseUrl);
            }
            if ((0, model_1.isResponseBad)(response)) {
                throw new Error(`bad response from investec auth: ${response}`);
            }
            this.token = response;
        });
    }
    getAuthRedirect(redirectUrl, scope) {
        return encodeURI((0, investec_1.getInvestecOAuthRedirectUrl)(this.clientId, scope, redirectUrl, this.baseUrl));
    }
    getOAuthClientFromToken(token) {
        return new Client(this.clientId, this.clientSecret, this.apiKey, token);
    }
    getOAuthClient(authCode, redirectUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, investec_1.getInvestecOAuthToken)(this.clientId, this.clientSecret, this.apiKey, authCode, redirectUri, this.baseUrl);
            if ((0, model_1.isResponseBad)(response)) {
                throw new Error(`bad response from investec oauth: ${response}`);
            }
            return new Client(this.clientId, this.clientSecret, this.apiKey, response);
        });
    }
    getAccounts(realm = "private") {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.token) {
                throw new Error("client is not set up");
            }
            const accounts = yield (0, investec_1.getInvestecAccounts)(this.token.access_token, realm, this.baseUrl);
            if ((0, model_1.isResponseBad)(accounts)) {
                throw new Error(`not ok response from getting accounts: ${JSON.stringify(accounts)}`);
            }
            return accounts.data.accounts.map((a) => new Account_1.Account(this, a, realm));
        });
    }
    getCards() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.token) {
                throw new Error("client is not set up");
            }
            const cards = yield (0, investec_1.getInvestecCards)(this.token.access_token, this.baseUrl);
            if ((0, model_1.isResponseBad)(cards)) {
                throw new Error("not ok response from getting cards: " + cards);
            }
            return cards.data.cards.map((c) => new Card_1.Card(this, c));
        });
    }
    getBeneficiaries() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.token) {
                throw new Error("client is not set up");
            }
            const beneficiaries = yield (0, investec_1.getInvestecBeneficiaries)(this.token.access_token, this.baseUrl);
            if ((0, model_1.isResponseBad)(beneficiaries)) {
                throw new Error("not ok response from getting cards: " + beneficiaries);
            }
            return beneficiaries.data;
        });
    }
    getBeneficiaryCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.token) {
                throw new Error("client is not set up");
            }
            const beneficiaries = yield (0, investec_1.getInvestecBeneficiaryCategories)(this.token.access_token, this.baseUrl);
            if ((0, model_1.isResponseBad)(beneficiaries)) {
                throw new Error("not ok response from getting cards: " + beneficiaries);
            }
            return beneficiaries.data;
        });
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map