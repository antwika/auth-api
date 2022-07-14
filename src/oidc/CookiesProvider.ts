import { IStore } from '@antwika/store';
import { randomBytes } from 'crypto';

type CookieKey = { secret: string };

export interface ICookiesProvider {
  getCookieKeys: () => Promise<string[]>;
  getCookies: () => Promise<{
    long: { signed: boolean, maxAge: number },
    short: { signed: boolean },
    keys: string[],
  }>;
}

export class CookiesProvider implements ICookiesProvider {
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
    await this.store.createWithoutId<CookieKey>({
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
