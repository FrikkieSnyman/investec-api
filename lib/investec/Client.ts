import { getInvestecToken } from "../util/investec";
import { InvestecAuthResponse } from "../util/model";

export class Client {
  public token: InvestecAuthResponse | undefined;
  constructor(private clientId: string, private clientSecret: string) {}

  public async init() {
    const response = await getInvestecToken(this.clientId, this.clientSecret);
    this.token = response;
  }
}
