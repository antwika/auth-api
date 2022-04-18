import { IHttpHandler, IHttpHandlable } from '@antwika/http';

export class TextEndpoint implements IHttpHandler {
  private readonly code: number;

  private readonly text: string;

  constructor(code: number, text: string) {
    this.code = code;
    this.text = text;
  }

  async canHandle(handlable: IHttpHandlable) {
    return !!handlable;
  }

  async handle(handlable: IHttpHandlable) {
    const res = handlable.res();
    res.writeHead(this.code);
    res.end(this.text);
  }
}
