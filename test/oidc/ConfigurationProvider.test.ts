import { IJwksProvider } from '../../src/oidc/JwksProvider';
import { IAccountProvider } from '../../src/oidc/AccountProvider';
import { IClientProvider } from '../../src/oidc/ClientProvider';
import { IResourceIndicatorProvider } from '../../src/oidc/ResourceIndicatorProvider';
import { ICookiesProvider } from '../../src/oidc/CookiesProvider';
import { ConfigurationProvider } from '../../src/oidc/ConfigurationProvider';

describe('ConfigurationProvider', () => {
  let configurationProvider: ConfigurationProvider;
  let mockJwksProvider: IJwksProvider;
  let mockAccountProvider: jest.Mocked<IAccountProvider>;
  let mockClientProvider: IClientProvider;
  let mockResourceIndicatorProvider: jest.Mocked<IResourceIndicatorProvider>;
  let mockCookiesProvider: ICookiesProvider;

  beforeEach(() => {
    jest.clearAllMocks();

    mockJwksProvider = {
      getKeys: jest.fn(),
      getJwks: jest.fn(),
    };
    mockAccountProvider = {
      registerAccount: jest.fn(),
      findAccount: jest.fn(),
    };
    mockClientProvider = {
      registerClient: jest.fn(),
      findClient: jest.fn(),
      findAllClients: jest.fn(),
    };
    mockResourceIndicatorProvider = {
      registerResourceServerInfo: jest.fn(),
      getDefaultResource: jest.fn(),
      getResourceServerInfo: jest.fn(),
    };
    mockCookiesProvider = {
      getCookieKeys: jest.fn(),
      getCookies: jest.fn(),
    };

    configurationProvider = new ConfigurationProvider(
      'http://example.com',
      mockJwksProvider,
      mockAccountProvider,
      mockClientProvider,
      mockResourceIndicatorProvider,
      mockCookiesProvider,
    );
  });

  it('can lazily create a configuration', async () => {
    const initialConfiguration = await configurationProvider.getConfiguration();
    expect(initialConfiguration).toBeDefined();
    const sameConfiguration = await configurationProvider.getConfiguration();
    expect(sameConfiguration).toStrictEqual(initialConfiguration);
  });

  it('can return PKCE requirement', async () => {
    const configuration = await configurationProvider.getConfiguration();
    expect(configuration.pkce!.required!('any-context' as any, 'any-client' as any)).toStrictEqual(true);
  });

  it('can produce an interaction url', async () => {
    const configuration = await configurationProvider.getConfiguration();
    expect(configuration.interactions!.url!('any-context' as any, { uid: 'abc123' } as any)).toBe('/oidc/interaction/abc123');
  });

  it('can produce clientBasedCORS setting', async () => {
    const configuration = await configurationProvider.getConfiguration();
    expect(configuration.clientBasedCORS!('any-context' as any, 'any-origin', {} as any)).toBeTruthy();
  });

  it('can find an existing account', async () => {
    mockAccountProvider.findAccount.mockImplementation((): any => ({ claims: async () => 'hello' }));

    const configuration = await configurationProvider.getConfiguration();
    expect(configuration.findAccount!('any-context' as any, 'any-id', {} as any)).toBeTruthy();
  });

  it('returns undefined when an account can not be found', async () => {
    const configuration = await configurationProvider.getConfiguration();
    expect(configuration.findAccount!('any-context' as any, 'any-id', {} as any)).toBeUndefined();
  });

  it('can produce extraTokenClaims based on access token', async () => {
    mockAccountProvider.findAccount.mockImplementation((): any => ({ claims: async () => ({ firstName: 'Foo', lastName: 'Bar', email: 'foo@bar.com' }) }));

    const configuration = await configurationProvider.getConfiguration();
    expect(await configuration.extraTokenClaims!('any-context' as any, { kind: 'AccessToken', accountId: '123' } as any)).toStrictEqual({
      firstName: 'Foo',
      lastName: 'Bar',
      email: 'foo@bar.com',
    });
  });

  it('does not produce extraTokenClaims based on client credential token', async () => {
    const configuration = await configurationProvider.getConfiguration();
    expect(await configuration.extraTokenClaims!('any-context' as any, { kind: 'ClientCredentials', accountId: '123' } as any)).toBeUndefined();
  });

  it('can produce a default resource', async () => {
    mockResourceIndicatorProvider.getDefaultResource.mockImplementation(async () => 'http://localhost:3000');

    const configuration = await configurationProvider.getConfiguration();
    expect(await configuration.features!.resourceIndicators!.defaultResource!('any-context' as any)).toBe('http://localhost:3000');
  });

  it('can produce a default resource server information', async () => {
    mockResourceIndicatorProvider.getResourceServerInfo.mockImplementation(async () => ({
      id: '57b23a80-989c-4840-8b63-9b48d9de9f4d',
      scope: 'openid',
      audience: 'test-client-id',
      accessTokenTTL: 7200,
      accessTokenFormat: 'jwt',
      jwt: {
        sign: {
          alg: 'ES256',
        },
      },
    }));

    const configuration = await configurationProvider.getConfiguration();

    expect(await configuration.features!.resourceIndicators!.getResourceServerInfo!('any-context' as any, 'any-resource-indicator' as any, { clientId: 'test-client-id' } as any)).toStrictEqual({
      id: '57b23a80-989c-4840-8b63-9b48d9de9f4d',
      scope: 'openid',
      audience: 'test-client-id',
      accessTokenTTL: 7200,
      accessTokenFormat: 'jwt',
      jwt: {
        sign: {
          alg: 'ES256',
        },
      },
    });
  });

  it('can generate random ids', async () => {
    const configuration = await configurationProvider.getConfiguration();

    const id1 = configuration.features!.registration!.idFactory!('any-context' as any);
    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(0);

    const id2 = configuration.features!.registration!.idFactory!('any-context' as any);
    expect(id2).not.toEqual(id1);
  });
});
