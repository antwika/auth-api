import { IStore, MemoryStore } from '@antwika/store';
import { ClientProvider, IClientProvider } from '../../src/oidc/ClientProvider';

describe('ClientProvider', () => {
  let clientProvider: IClientProvider;
  let store: IStore;

  beforeEach(() => {
    store = new MemoryStore();
    clientProvider = new ClientProvider(store);
  });

  it('can register a new client', async () => {
    const client = {
      id: '1234',
      client_id: 'test-id',
      client_secret: 'test-secret',
      grant_types: ['test-grant-type'],
      response_types: ['test-type'],
      redirect_uris: ['test-redirect-uri'],
      scope: 'test-scope',
      introspection_signed_response_alg: 'test-alg',
    };

    const registeredClient = await clientProvider.registerClient(client);

    expect(registeredClient).toStrictEqual(client);

    const foundClient = await clientProvider.findClient(registeredClient.id);
    expect(foundClient).toStrictEqual(client);

    const allClients = await clientProvider.findAllClients();
    expect(allClients.length).toBe(1);
    expect(allClients[0]).toStrictEqual(client);
  });
});
