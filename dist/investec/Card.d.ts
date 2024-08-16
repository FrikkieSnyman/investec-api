import { Client } from "..";
import { InvestecCard, InvestecCardCode, InvestecCardEnvironmentVariables, InvestecCardExecution, InvestecNameAndCode, InvestecSimulateExecutionInput } from "../util/model";
export declare class Card implements InvestecCard {
    private client;
    static getCountries(client: Client): Promise<InvestecNameAndCode[]>;
    static getCurrencies(client: Client): Promise<InvestecNameAndCode[]>;
    static getMerchants(client: Client): Promise<InvestecNameAndCode[]>;
    CardKey: string;
    CardNumber: string;
    IsProgrammable: boolean;
    Status: string;
    CardTypeCode: string;
    AccountNumber: string;
    AccountId: string;
    constructor(client: Client, card: InvestecCard);
    getSavedCode(): Promise<InvestecCardCode>;
    getPublishedCode(): Promise<InvestecCardCode>;
    updateSavedCode(code: string): Promise<InvestecCardCode>;
    publishSavedCode(codeId: string): Promise<InvestecCardCode>;
    simulateFunctionExecution(opts: InvestecSimulateExecutionInput): Promise<InvestecCardExecution[]>;
    getExecutions(): Promise<InvestecCardExecution[]>;
    getEnvironmentVariables(): Promise<InvestecCardEnvironmentVariables>;
    updateEnvironmentVariables(variables: {
        [key in string]: string | number | boolean | Object;
    }): Promise<InvestecCardEnvironmentVariables>;
}
