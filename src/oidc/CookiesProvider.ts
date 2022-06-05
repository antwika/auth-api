import { Data, IStore } from '@antwika/store';
import { randomBytes, randomUUID } from 'crypto';

type CookieKey = Data & { secret: string };

export interface ICookieProvider {
  getCookieKeys: () => Promise<CookieKey[]>;
  getCookies: () => Promise<any>;
}

export class CookiesProvider {
  private readonly store: IStore;

  constructor(store: IStore) {
    this.store = store;
  }

  async getCookieKeys() {
    const cookieKeys = await this.store.readAll<CookieKey>();
    if (cookieKeys.length > 0) {
      return cookieKeys.map((key) => key.secret);
    }

    const secret = randomBytes(64).toString('hex');
    await this.store.create<CookieKey>({
      id: randomUUID(),
      secret,
    });

    return [secret];
  }

  async getCookies() {
    return {
      long: { signed: true, maxAge: 86400000 },
      short: { signed: true },
      keys: await this.getCookieKeys(),
    };
  }
}
