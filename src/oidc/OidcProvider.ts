import { randomUUID } from 'crypto';
import { Provider, Configuration } from 'oidc-provider';
import { Account } from './Account';
import { IJwksProvider } from './JwksProvider';

export interface IOidcProvider {
  getProvider: () => Promise<Provider>
}

export class OidcProvider implements IOidcProvider {
  private provider: Provider | undefined;

  private readonly baseUrl;

  private readonly jwksProvider;

  constructor(baseUrl: string, jwksProvider: IJwksProvider) {
    this.baseUrl = baseUrl;
    this.jwksProvider = jwksProvider;
  }

  async getProvider() {
    if (this.provider) {
      return this.provider;
    }

    const configuration: Configuration = {
      clients: [
        {
          client_id: 'web',
          client_secret: 'app',
          grant_types: ['authorization_code'],
          response_types: ['code'],
          redirect_uris: [
            'http://localhost:3000/oidc/cb',
            'http://localhost:3000/en-US/oidc/cb',
            'http://localhost:3000/sv-SE/oidc/cb',
            'http://localhost:3000/ko-KR/oidc/cb',
          ],
          scope: 'openid',
          introspection_signed_response_alg: 'ES256',
        },
      ],
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
      findAccount: Account.findAccount,
      // eslint-disable-next-line arrow-body-style
      extraTokenClaims: async (ctx, token) => {
        if (token.kind === 'AccessToken') {
          const account = await Account.findAccount(ctx, token.accountId);
          if (!account) return undefined;

          const claims = await account.claims();
          return ({
            firstName: claims.firstName,
            lastName: claims.lastName,
            email: claims.email,
          });
        }
        return undefined;
      },
      features: {
        devInteractions: { enabled: true },
        userinfo: { enabled: false },
        resourceIndicators: {
          enabled: true,
          defaultResource: (ctx) => 'http://localhost:3000',
          getResourceServerInfo: (ctx, resourceIndicator, client) => ({
            scope: 'openid',
            audience: 'web',
            accessTokenTTL: 2 * 60 * 60, // 2 hours
            accessTokenFormat: 'jwt',
            jwt: {
              sign: { alg: 'ES256' },
            },
          }),
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
