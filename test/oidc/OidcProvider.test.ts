import { IOidcProvider, OidcProvider } from '../../src/oidc/OidcProvider';
import { IConfigurationProvider } from '../../src/oidc/ConfigurationProvider';

describe('OidcProvider', () => {
  let oidcProvider: IOidcProvider;
  let mockConfigurationProvider: IConfigurationProvider;

  beforeEach(() => {
    mockConfigurationProvider = {
      getConfiguration: jest.fn(),
    };

    oidcProvider = new OidcProvider(
      mockConfigurationProvider,
      'http://example.com',
    );
  });

  it('can lazily create a provider', async () => {
    const initialProvider = await oidcProvider.getProvider();
    expect(initialProvider).toBeDefined();
    const sameProvider = await oidcProvider.getProvider();
    expect(sameProvider).toBe(initialProvider);
  });
});
