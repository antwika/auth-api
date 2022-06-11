import { IStore, MemoryStore } from '@antwika/store';
import { AccountProvider, IAccountProvider } from '../../src/oidc/AccountProvider';

describe('AccountProvider', () => {
  let accountProvider: IAccountProvider;
  let store: IStore;

  beforeEach(() => {
    store = new MemoryStore();
    accountProvider = new AccountProvider(store);
  });

  it('can register a new account', async () => {
    const registeredAccount = await accountProvider.registerAccount({
      id: 'FooBar',
      email: 'foo@bar.com',
      password: 'testpass',
      firstName: 'Foo',
      lastName: 'Bar',
    });

    expect(registeredAccount.accountId).toBe('FooBar');
    expect(await registeredAccount.claims()).toStrictEqual({
      sub: 'FooBar',
      email: 'foo@bar.com',
      firstName: 'Foo',
      lastName: 'Bar',
    });

    const foundAccount = await accountProvider.findAccount(registeredAccount.accountId);
    expect(foundAccount.accountId).toBe(registeredAccount.accountId);
    expect(await foundAccount.claims()).toStrictEqual(await registeredAccount.claims());
  });
});
