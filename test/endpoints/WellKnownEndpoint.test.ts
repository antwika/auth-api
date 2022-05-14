import { WellKnownEndpoint } from '../../src/endpoints/WellKnownEndpoint';

describe('WellKnownEndpoint', () => {
  it('can handle and respond to incoming requests', async () => {
    const wellKnownEndpoint = new WellKnownEndpoint();

    const req: any = { url: '/' };
    const res: any = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    const handlable = { req: () => req, res: () => res };

    await expect(wellKnownEndpoint.canHandle(handlable)).resolves.toBeTruthy();
    await wellKnownEndpoint.handle(handlable);
    expect(res.writeHead).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalledWith('This is well known!');
  });
});
