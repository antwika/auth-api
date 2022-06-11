import { Data, IStore } from '@antwika/store';
import { randomUUID } from 'crypto';
import { ClientMetadata } from 'oidc-provider';

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
    const client = await this.store.read<IClient>(id);
    return client;
  }

  async findAllClients() {
    return this.store.readAll<IClient>();
  }
}
