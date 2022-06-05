import { Data, IStore } from '@antwika/store';

export interface IAccount extends Data {
  email: string,
  password: string,
  firstName: string,
  lastName: string,
}

export interface IAccountProvider {
  findAccount: (id: string) => Promise<{
    accountId: string,
    claims: () => Promise<{
      sub: string,
      email: string,
      firstName: string,
      lastName: string,
    }>,
  }>,
}

export class AccountProvider implements IAccountProvider {
  private readonly store: IStore;

  constructor(store: IStore) {
    this.store = store;

    // TODO: Avoid hard-coding stuff
    this.store.create<IAccount>({
      id: 'JohnTheDoe',
      email: 'john@doe.com',
      password: 'doe',
      firstName: 'John',
      lastName: 'Doe',
    });
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
}
