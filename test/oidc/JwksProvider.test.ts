import { IStore, MemoryStore } from '@antwika/store';
import { JwksProvider, IJwksProvider } from '../../src/oidc/JwksProvider';

describe('JwksProvider', () => {
  let jwksProvider: IJwksProvider;
  let store: IStore;

  beforeEach(() => {
    store = new MemoryStore();
    jwksProvider = new JwksProvider(store);
  });

  it('can lazily generate jwks', async () => {
    const initialJwks = await jwksProvider.getJwks();
    expect(initialJwks.keys).toHaveLength(1);
    const sameJwks = await jwksProvider.getJwks();
    expect(initialJwks).toStrictEqual(sameJwks);
  });
});
