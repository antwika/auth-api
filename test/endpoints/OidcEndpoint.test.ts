import { OidcEndpoint } from '../../src/endpoints/OidcEndpoint';

describe('OidcEndpoint', () => {
  it('can handle and respond to incoming requests', async () => {
    const oidcEndpoint = new OidcEndpoint();

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

    await expect(oidcEndpoint.canHandle(handlable)).resolves.toBeTruthy();
    await oidcEndpoint.handle(handlable);
    expect(res.end).toHaveBeenCalledWith('OK');
  });
});
