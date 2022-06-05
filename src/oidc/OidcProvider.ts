import { randomUUID } from 'crypto';
import { Provider, Configuration } from 'oidc-provider';
import { IAccountProvider } from './AccountProvider';
import { ClientProvider } from './ClientProvider';
import { CookiesProvider } from './CookiesProvider';
import { IJwksProvider } from './JwksProvider';
import { ResourceIndicatorProvider } from './ResourceIndicatorProvider';

export interface IOidcProvider {
  getProvider: () => Promise<Provider>
}

export class OidcProvider implements IOidcProvider {
  private provider: Provider | undefined;

  private readonly baseUrl;

  private readonly jwksProvider;

  private readonly accountProvider;

  private readonly clientProvider;

  private readonly resourceIndicatorProvider;

  private readonly cookiesProvider;

  constructor(
    baseUrl: string,
    jwksProvider: IJwksProvider,
    accountProvider: IAccountProvider,
    clientProvider: ClientProvider,
    resourceIndicatorProvider: ResourceIndicatorProvider,
    cookiesProvider: CookiesProvider,
  ) {
    this.baseUrl = baseUrl;
    this.jwksProvider = jwksProvider;
    this.accountProvider = accountProvider;
    this.clientProvider = clientProvider;
    this.resourceIndicatorProvider = resourceIndicatorProvider;
    this.cookiesProvider = cookiesProvider;
  }

  async getProvider() {
    if (this.provider) {
      return this.provider;
    }

    const configuration: Configuration = {
      cookies: await this.cookiesProvider.getCookies(),
      clients: await this.clientProvider.findAllClientMetadata(),
      conformIdTokenClaims: false,
      pkce: {
        methods: ['S256'],
        required: () => true,
      },
      interactions: {
        url(ctx, interaction) {
          return `/oidc/interaction/${interaction.uid}`;
        },
      },
      clientBasedCORS: () => true,
      /* // eslint-disable-next-line arrow-body-style
      clientBasedCORS: (ctx, origin, client) => {
        return origin === `http://${process.env.VITE_IP}:${process.env.VITE_PORT}`
      }, */
      findAccount: (ctx: any, id: string) => this.accountProvider.findAccount(id),
      // eslint-disable-next-line arrow-body-style
      extraTokenClaims: async (ctx, token) => {
        if (token.kind === 'AccessToken') {
          const account = await this.accountProvider.findAccount(token.accountId);
          const claims = await account.claims();
          return {
            firstName: claims.firstName,
            lastName: claims.lastName,
            email: claims.email,
          };
        }
        return undefined;
      },
      features: {
        devInteractions: { enabled: true },
        userinfo: { enabled: false },
        resourceIndicators: {
          enabled: true,
          defaultResource: async (ctx) => this.resourceIndicatorProvider.getDefaultResource(ctx),
          getResourceServerInfo: async (
            ctx,
            resourceIndicator,
            client,
          ) => this.resourceIndicatorProvider.getResourceServerInfo(
            ctx,
            resourceIndicator,
            client,
          ),
        },
        registration: {
          enabled: true,
          initialAccessToken: false,
          idFactory: (ctx) => randomUUID(),
        },
        dPoP: {
          enabled: true,
        },
      },
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
      jwks: await this.jwksProvider.getJwks(),
      clientDefaults: {
        id_token_signed_response_alg: 'ES256',
      },
    };

    this.provider = new Provider(`${this.baseUrl}/oidc`, configuration);
    this.provider.proxy = true;

    return this.provider;
  }

  private relativePath(relative: string): string {
    return new URL(`${this.baseUrl}/oidc${relative}`).pathname;
  }
}
