import { getInvestecToken } from "../util/investec";
import {
  InvestecAuthResponse,
  InvestecToken,
  isResponseBad,
} from "../util/model";

export class Client {
  public token: InvestecToken | undefined;
  constructor(private clientId: string, private clientSecret: string) {}

  public async init() {
    const response = await getInvestecToken(this.clientId, this.clientSecret);

    if (isResponseBad(response)) {
      throw new Error(`bad response from investect auth: ${response}`);
    }
    this.token = response;
  }
}
