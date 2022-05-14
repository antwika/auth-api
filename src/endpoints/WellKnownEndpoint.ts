import { IHttpHandlable, IHttpHandler } from '@antwika/http';

export class WellKnownEndpoint implements IHttpHandler {
  async canHandle(handlable: IHttpHandlable) {
    return !!handlable;
  }

  async handle(handlable: IHttpHandlable) {
    const res = handlable.res();
    res.writeHead(200);
    res.end('This is well known!');
  }
}
