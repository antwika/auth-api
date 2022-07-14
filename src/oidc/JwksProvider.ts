import { IStore } from '@antwika/store';
import { randomUUID } from 'crypto';
import { exportJWK, generateKeyPair, JWK } from 'jose';

export type KeyPair = {
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
    const keyPairs = await this.store.readAll<KeyPair>();

    if (keyPairs.length > 0) {
      return keyPairs;
    }

    const { privateKey, publicKey } = await generateKeyPair('ES256');
    const keyPair: KeyPair = {
      privateJwk: { ...await exportJWK(privateKey), alg: 'ES256', use: 'sig' },
      publicJwk: { ...await exportJWK(publicKey), alg: 'ES256', use: 'sig' },
    };

    return [await this.store.createWithoutId(keyPair)];
  }

  async getJwks(): Promise<{ keys: JWK[]}> {
    const keyPairs = await this.getKeys();
    const keys = keyPairs.map((keyPair) => ({ ...keyPair.privateJwk }));
    return { keys };
  }
}
