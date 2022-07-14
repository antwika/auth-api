import { IStore } from '@antwika/store';

export interface IAccount {
  email: string,
  password: string,
  firstName: string,
  lastName: string,
}

export interface IAccountProvider {
  registerAccount: (account: IAccount) => Promise<{
    accountId: string,
    claims: () => Promise<{
      sub: string,
      email: string,
      firstName: string,
      lastName: string,
    }>,
  }>,
  findAccount: (id: string) => Promise<{
    accountId: string,
    claims: () => Promise<{
      sub: string,
      email: string,
      firstName: string,
      lastName: string,
    }>,
  }>,
  authenticate: (email: string, password: string) => Promise<boolean>,
}

export class AccountProvider implements IAccountProvider {
  private readonly store: IStore;

  constructor(store: IStore) {
    this.store = store;
  }

  async registerAccount(account: IAccount) {
    const created = await this.store.createWithoutId<IAccount>(account);
    return {
      accountId: created.id,
      claims: async () => ({
        sub: created.id,
        email: created.email,
        firstName: created.firstName,
        lastName: created.lastName,
      }),
    };
  }

  async findAccount(id: string) {
    const account = await this.store.read<IAccount>(id);
    return {
      accountId: account.id,
      claims: async () => ({
        sub: account.id,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
      }),
    };
  }

  async authenticate(email: string, password: string) {
    const all = await this.store.readAll<IAccount>();
    return all.some((account) => account.email === email && account.password === password);
  }
}
