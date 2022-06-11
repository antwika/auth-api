import { Data, IStore } from '@antwika/store';

export interface IClient extends Data {
  client_id: string,
  client_secret: string,
  grant_types: string[],
  response_types: string[],
  redirect_uris: string[],
  scope: string,
  introspection_signed_response_alg: string,
}

export interface IClientProvider {
  registerClient: (client: IClient) => Promise<IClient>,
  findClient: (id: string) => Promise<IClient>,
  findAllClients: () => Promise<IClient[]>,
}

export class ClientProvider implements IClientProvider {
  private readonly store: IStore;

  constructor(store: IStore) {
    this.store = store;
  }

  async registerClient(client: IClient) {
    return this.store.create<IClient>(client);
  }

  async findClient(id: string) {
    return this.store.read<IClient>(id);
  }

  async findAllClients() {
    return this.store.readAll<IClient>();
  }
}
