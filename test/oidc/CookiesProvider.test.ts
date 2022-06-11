import { IStore, MemoryStore } from '@antwika/store';
import { CookiesProvider, ICookiesProvider } from '../../src/oidc/CookiesProvider';

describe('CookiesProvider', () => {
  let cookiesProvider: ICookiesProvider;
  let store: IStore;

  beforeEach(() => {
    store = new MemoryStore();
    cookiesProvider = new CookiesProvider(store);
  });

  it('can lazily generate cookies', async () => {
    const initialCookies = await cookiesProvider.getCookies();
    expect(initialCookies.keys).toHaveLength(1);
    const sameCookies = await cookiesProvider.getCookies();
    expect(sameCookies).toStrictEqual(initialCookies);
  });
});
