import { randomUUID } from 'crypto';
import { ClientMetadata, Configuration } from 'oidc-provider';
import { IAccountProvider } from './AccountProvider';
import { IClientProvider } from './ClientProvider';
import { ICookiesProvider } from './CookiesProvider';
import { IJwksProvider } from './JwksProvider';
import { IResourceIndicatorProvider } from './ResourceIndicatorProvider';

export interface IConfigurationProvider {
  getConfiguration: () => Promise<Configuration>;
}

export class ConfigurationProvider implements IConfigurationProvider {
  private configuration?: Configuration;

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
    clientProvider: IClientProvider,
    resourceIndicatorProvider: IResourceIndicatorProvider,
    cookiesProvider: ICookiesProvider,
  ) {
    this.baseUrl = baseUrl;
    this.jwksProvider = jwksProvider;
    this.accountProvider = accountProvider;
    this.clientProvider = clientProvider;
    this.resourceIndicatorProvider = resourceIndicatorProvider;
    this.cookiesProvider = cookiesProvider;
  }

  async getConfiguration() {
    if (this.configuration) return this.configuration;

    this.configuration = {
      cookies: await this.cookiesProvider.getCookies(),
      clients: await this.clientProvider.findAllClients() as unknown as ClientMetadata[],
      conformIdTokenClaims: false,
      pkce: {
        methods: ['S256'],
        required: () => true,
      },
      interactions: {
        url(_ctx: any, interaction: any) {
          return `/oidc/interaction/${interaction.uid}`;
        },
      },
      clientBasedCORS: () => true,
      /* // eslint-disable-next-line arrow-body-style
      clientBasedCORS: (ctx, origin, client) => {
        return origin === `http://${process.env.VITE_IP}:${process.env.VITE_PORT}`
      }, */
      findAccount: (_ctx: any, id: string) => this.accountProvider.findAccount(id),
      // eslint-disable-next-line arrow-body-style
      extraTokenClaims: async (_ctx: any, token: any) => {
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
          idFactory: (_ctx) => randomUUID(),
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

    return this.configuration;
  }

  private relativePath(relative: string): string {
    return new URL(`${this.baseUrl}/oidc${relative}`).pathname;
  }
}
