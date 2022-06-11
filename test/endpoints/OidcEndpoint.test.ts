import { OidcEndpoint } from '../../src/endpoints/OidcEndpoint';
import { IOidcProvider } from '../../src/oidc/OidcProvider';

describe('OidcEndpoint', () => {
  it('can handle and respond to incoming requests', async () => {
    const mockOidcProvider: jest.Mocked<IOidcProvider> = {
      getProvider: jest.fn(),
    };

    const oidcEndpoint = new OidcEndpoint(mockOidcProvider);

    const req: any = {
      url: '/oidc',
      headers: {
        accept: 'application/json',
      },
    };
    const res: any = {
      setHeader: jest.fn(),
      removeHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    const handlable = { req: () => req, res: () => res };

    const mockCallback = jest.fn().mockImplementation((req2: any, res2: any) => { res2.end('OK'); });

    const mockProvider = {
      callback: jest.fn().mockImplementation(() => mockCallback),
    };

    mockOidcProvider.getProvider.mockImplementation(async (): Promise<any> => mockProvider);

    await expect(oidcEndpoint.canHandle(handlable)).resolves.toBeTruthy();
    await oidcEndpoint.handle(handlable);
    expect(mockOidcProvider.getProvider).toHaveBeenCalledTimes(1);
    expect(mockProvider.callback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(res.end).toHaveBeenCalledWith('OK');
  });
});
