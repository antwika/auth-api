import { IHttpHandlable, IHttpHandler } from '@antwika/http';
import { Provider, Configuration} from 'oidc-provider';

export class OidcEndpoint implements IHttpHandler {
  private readonly baseUrl: string;

  private readonly provider: Provider;

  constructor() {
    this.baseUrl = 'http://localhost:3000';

    const configuration: Configuration = {
      routes: {
        authorization: this.relativePath('/auth'),
        backchannel_authentication: this.relativePath('/backchannel'),
        code_verification: this.relativePath('/device'),
        device_authorization: this.relativePath('/device/auth'),
        end_session: this.relativePath('/session/end'),
        introspection: this.relativePath('/token/introspection'),
        jwks: this.relativePath('/jwks'),
        pushed_authorization_request: this.relativePath('/request'),
        registration: this.relativePath('/reg'),
        revocation: this.relativePath('/token/revocation'),
        token: this.relativePath('/token'),
        userinfo: this.relativePath('/me'),
      },
      clients: [
        {
          client_id: 'foo',
          client_secret: 'bar',
          redirect_uris: ['http://lvh.me:8080/cb'],
        },
      ],
    };

    this.provider = new Provider(`${this.baseUrl}/oidc`, configuration);
  }

  async canHandle(handlable: IHttpHandlable) {
    return !!handlable;
  }

  async handle(handlable: IHttpHandlable) {
    const req = handlable.req();
    const res = handlable.res();
    const callback = this.provider.callback();
    return callback(req, res);
  }

  private relativePath(relative: string): string {
    return new URL(`${this.baseUrl}/oidc${relative}`).pathname;
  }
}
