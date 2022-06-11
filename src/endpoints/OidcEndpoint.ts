import { IHttpHandlable, IHttpHandler } from '@antwika/http';
import { IOidcProvider } from '../oidc/OidcProvider';

export class OidcEndpoint implements IHttpHandler {
  private readonly oidcProvider: IOidcProvider;

  constructor(oidcProvider: IOidcProvider) {
    this.oidcProvider = oidcProvider;
  }

  async canHandle(handlable: IHttpHandlable) {
    return !!handlable;
  }

  async handle(handlable: IHttpHandlable) {
    const req = handlable.req();
    const res = handlable.res();
    const provider = await this.oidcProvider.getProvider();
    const callback = provider.callback();
    return callback(req, res);
  }
}
