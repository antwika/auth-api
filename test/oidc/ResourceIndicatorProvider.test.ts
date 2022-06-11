import { IStore, MemoryStore } from '@antwika/store';
import { ResourceIndicatorProvider, IResourceIndicatorProvider } from '../../src/oidc/ResourceIndicatorProvider';

describe('ResourceIndicatorProvider', () => {
  let resourceIndicatorProvider: IResourceIndicatorProvider;
  let store: IStore;

  beforeEach(() => {
    store = new MemoryStore();
    resourceIndicatorProvider = new ResourceIndicatorProvider(store);
  });

  it('throws if resource server info is missing', async () => {
    await expect(() => resourceIndicatorProvider.getResourceServerInfo('mock-context', 'mock-resource-indicator', { clientId: 'test-unknown-client-id' })).rejects.toThrow();
  });

  it('can return a default resource', async () => {
    const defaultResource = await resourceIndicatorProvider.getDefaultResource('mock-context');
    expect(defaultResource).toBe('http://localhost:3000');
  });

  it('can register a new resource server info', async () => {
    await resourceIndicatorProvider.registerResourceServerInfo({
      id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      scope: 'openid',
      audience: 'test-client-id',
      accessTokenTTL: 7200,
      accessTokenFormat: 'jwt',
      jwt: { sign: { alg: 'ES256' } },
    });
    const rsi = await resourceIndicatorProvider.getResourceServerInfo('mock-context', 'mock-resource-indicator', { clientId: 'test-client-id' });
    expect(rsi).toStrictEqual({
      accessTokenFormat: 'jwt',
      accessTokenTTL: 7200,
      audience: 'test-client-id',
      id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      jwt: { sign: { alg: 'ES256' } },
      scope: 'openid',
    });
  });
});
