import { InvestecBeneficiary, InvestecBeneficiaryCategory, InvestecToken, Realm, Scope } from "../util/model";
import { Account } from "./Account";
import { Card } from "./Card";
export declare class Client {
    private clientId;
    private clientSecret;
    private apiKey;
    token?: InvestecToken | undefined;
    private sandbox?;
    get baseUrl(): "https://openapisandbox.investec.com" | "https://openapi.investec.com";
    static create(clientId: string, clientSecret: string, apiKey: string, token: InvestecToken, sandbox: boolean): Promise<Client>;
    authenticate(): Promise<void>;
    getAuthRedirect(redirectUrl: string, scope: Scope[]): string;
    getOAuthClientFromToken(token: InvestecToken): Client;
    getOAuthClient(authCode: string, redirectUri: string): Promise<Client>;
    getAccounts(realm?: Realm): Promise<Account[]>;
    getCards(): Promise<Card[]>;
    getBeneficiaries(): Promise<InvestecBeneficiary[]>;
    getBeneficiaryCategories(): Promise<InvestecBeneficiaryCategory[]>;
    private constructor();
}
