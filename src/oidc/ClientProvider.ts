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
  findClient: (id: string) => Promise<IClient>,
  findAllClients: () => Promise<IClient[]>,
}

export class ClientProvider implements IClientProvider {
  private readonly store: IStore;

  constructor(store: IStore) {
    this.store = store;

    // TODO: Avoid hard-coding stuff
    this.store.create<IClient>({
      id: randomUUID(),
      client_id: 'web',
      client_secret: 'app',
      grant_types: ['authorization_code'],
      response_types: ['code'],
      redirect_uris: [
        'http://localhost:3000/oidc/cb',
        'http://localhost:3000/en-US/oidc/cb',
        'http://localhost:3000/sv-SE/oidc/cb',
        'http://localhost:3000/ko-KR/oidc/cb',
      ],
      scope: 'openid',
      introspection_signed_response_alg: 'ES256',
    });
  }

  async findClient(id: string) {
    const client = await this.store.read<IClient>(id);
    return client;
  }

  async findAllClients() {
    return this.store.readAll<IClient>();
  }

  async findAllClientMetadata() {
    const allClients = await this.findAllClients();
    return allClients as unknown as ClientMetadata[];
  }
}
