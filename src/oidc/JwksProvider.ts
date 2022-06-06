import { Data, IStore } from '@antwika/store';
import { randomUUID } from 'crypto';
import {
  exportJWK,
  generateKeyPair,
  JWK,
  KeyLike,
} from 'jose';

export type KeyPair = Data & {
  privateJwk: JWK,
  publicJwk: JWK,
};

export interface IJwksProvider {
  getKeys: () => Promise<KeyPair[]>;
  getJwks: () => Promise<{ keys: JWK[]}>;
}

export class JwksProvider implements IJwksProvider {
  private readonly store: IStore;

  constructor(store: IStore) {
    this.store = store;
  }

  async getKeys() {
    const result = await this.store.readAll<KeyPair>();

    if (result.length > 0) {
      const keyPair = result; // TODO: What if there are many keys?
      return keyPair;
    }

    const { privateKey, publicKey } = await generateKeyPair('ES256');
    const keyPair: KeyPair = {
      id: randomUUID(),
      privateJwk: { ...await exportJWK(privateKey), alg: 'ES256', use: 'sig' },
      publicJwk: { ...await exportJWK(publicKey), alg: 'ES256', use: 'sig' },
    };

    return [await this.store.create(keyPair)];
  }

  async getJwks(): Promise<{ keys: JWK[]}> {
    const keyPairs = await this.getKeys();
    const keys = keyPairs.map((keyPair) => ({ ...keyPair.privateJwk }));
    const jwks = { keys };
    return jwks;
  }
}
