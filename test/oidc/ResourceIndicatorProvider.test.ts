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
    const resourceServerInfo = {
      scope: 'openid',
      audience: 'test-client-id',
      accessTokenTTL: 7200,
      accessTokenFormat: 'jwt',
      jwt: { sign: { alg: 'ES256' } },
    };
    const { id } = await resourceIndicatorProvider.registerResourceServerInfo(resourceServerInfo);
    const rsi = await resourceIndicatorProvider.getResourceServerInfo('mock-context', 'mock-resource-indicator', { clientId: 'test-client-id' });
    expect(rsi).toStrictEqual({ ...resourceServerInfo, id });
  });
});
