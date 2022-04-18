import { TextEndpoint } from '../../src/endpoints/TextEndpoint';

describe('TestEndpoint', () => {
  it('can handle and respond to incoming requests', async () => {
    const textEndpoint = new TextEndpoint(200, 'OK');

    const req: any = { url: '/' };
    const res: any = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    const handlable = { req: () => req, res: () => res };

    await expect(textEndpoint.canHandle(handlable)).resolves.toBeTruthy();
    await textEndpoint.handle(handlable);
    expect(res.writeHead).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalledWith('OK');
  });
});
