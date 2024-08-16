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
exports.Card = void 0;
const investec_1 = require("../util/investec");
const model_1 = require("../util/model");
class Card {
    constructor(client, card) {
        this.client = client;
        this.CardKey = card.CardKey;
        this.CardNumber = card.CardNumber;
        this.IsProgrammable = card.IsProgrammable;
        this.Status = card.Status;
        this.CardTypeCode = card.CardTypeCode;
        this.AccountNumber = card.AccountNumber;
        this.AccountId = card.AccountId;
    }
    static getCountries(client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client.token) {
                throw new Error("client is not set up");
            }
            const response = yield (0, investec_1.getInvestecCardCountries)(client.token.access_token, client.baseUrl);
            if ((0, model_1.isResponseBad)(response)) {
                throw new Error(`error getting countries: ${{ response }}`);
            }
            return response.data.result;
        });
    }
    static getCurrencies(client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client.token) {
                throw new Error("client is not set up");
            }
            const response = yield (0, investec_1.getInvestecCardCurrencies)(client.token.access_token, client.baseUrl);
            if ((0, model_1.isResponseBad)(response)) {
                throw new Error(`error getting countries: ${{ response }}`);
            }
            return response.data.result;
        });
    }
    static getMerchants(client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client.token) {
                throw new Error("client is not set up");
            }
            const response = yield (0, investec_1.getInvestecCardMerchants)(client.token.access_token, client.baseUrl);
            if ((0, model_1.isResponseBad)(response)) {
                throw new Error(`error getting countries: ${{ response }}`);
            }
            return response.data.result;
        });
    }
    getSavedCode() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.token) {
                throw new Error("client is not set up");
            }
            const savedCode = yield (0, investec_1.getInvestecCardSavedCode)(this.client.token.access_token, this.CardKey, this.client.baseUrl);
            if ((0, model_1.isResponseBad)(savedCode)) {
                throw new Error(`not ok response while getting saved code: ${{
                    cardKey: this.CardKey,
                    response: savedCode,
                }}`);
            }
            return savedCode.data.result;
        });
    }
    getPublishedCode() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.token) {
                throw new Error("client is not set up");
            }
            const publishedCode = yield (0, investec_1.getInvestecCardPublishedCode)(this.client.token.access_token, this.CardKey, this.client.baseUrl);
            if ((0, model_1.isResponseBad)(publishedCode)) {
                throw new Error(`not ok response while getting published code: ${{
                    cardKey: this.CardKey,
                    response: publishedCode,
                }}`);
            }
            return publishedCode.data.result;
        });
    }
    updateSavedCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.token) {
                throw new Error("client is not set up");
            }
            const savedCode = yield (0, investec_1.postInvestecCardSaveCode)(this.client.token.access_token, this.CardKey, code, this.client.baseUrl);
            if ((0, model_1.isResponseBad)(savedCode)) {
                throw new Error(`not ok response while updating saved code: ${{
                    cardKey: this.CardKey,
                    response: savedCode,
                }}`);
            }
            return savedCode.data.result;
        });
    }
    publishSavedCode(codeId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.token) {
                throw new Error("client is not set up");
            }
            const publishedCode = yield (0, investec_1.postInvestecCardPublishSavedCode)(this.client.token.access_token, this.CardKey, codeId, this.client.baseUrl);
            if ((0, model_1.isResponseBad)(publishedCode)) {
                throw new Error(`not ok response while updating saved code: ${{
                    cardKey: this.CardKey,
                    response: publishedCode,
                }}`);
            }
            return publishedCode.data.result;
        });
    }
    simulateFunctionExecution(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.token) {
                throw new Error("client is not set up");
            }
            const execution = yield (0, investec_1.postInvestecSimulateExecuteFunctionCode)(this.client.token.access_token, this.CardKey, opts, this.client.baseUrl);
            if ((0, model_1.isResponseBad)(execution)) {
                throw new Error(`not ok response while updating saved code: ${{
                    cardKey: this.CardKey,
                    response: execution,
                }}`);
            }
            return execution.data.result;
        });
    }
    getExecutions() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.token) {
                throw new Error("client is not set up");
            }
            const execution = yield (0, investec_1.getInvestecCardExecutions)(this.client.token.access_token, this.CardKey, this.client.baseUrl);
            if ((0, model_1.isResponseBad)(execution)) {
                throw new Error(`not ok response while updating saved code: ${{
                    cardKey: this.CardKey,
                    response: execution,
                }}`);
            }
            return execution.data.result;
        });
    }
    getEnvironmentVariables() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.token) {
                throw new Error("client is not set up");
            }
            const execution = yield (0, investec_1.getInvestecCardEnvironmentVariables)(this.client.token.access_token, this.CardKey, this.client.baseUrl);
            if ((0, model_1.isResponseBad)(execution)) {
                throw new Error(`not ok response while updating saved code: ${{
                    cardKey: this.CardKey,
                    response: execution,
                }}`);
            }
            return execution.data.result;
        });
    }
    updateEnvironmentVariables(variables) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.token) {
                throw new Error("client is not set up");
            }
            const execution = yield (0, investec_1.postInvestecCardEnvironmentVariables)(this.client.token.access_token, this.CardKey, variables, this.client.baseUrl);
            if ((0, model_1.isResponseBad)(execution)) {
                throw new Error(`not ok response while updating saved code: ${{
                    cardKey: this.CardKey,
                    response: execution,
                }}`);
            }
            return execution.data.result;
        });
    }
}
exports.Card = Card;
//# sourceMappingURL=Card.js.map