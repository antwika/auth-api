import {
  exportJWK,
  generateKeyPair,
  JWK,
  KeyLike,
} from 'jose';

export interface IJwksProvider {
  getKeys: () => Promise<{
    privateKey: KeyLike,
    publicKey: KeyLike,
    privateJwk: JWK,
    publicJwk: JWK,
  }>;
  getJwks: () => Promise<{ keys: JWK[]}>;
}

export class JwksProvider implements IJwksProvider {
  private privateKey: KeyLike | undefined;

  private publicKey: KeyLike | undefined;

  private privateJwk: JWK | undefined;

  private publicJwk: JWK | undefined;

  async getKeys() {
    if (!this.privateKey || !this.publicKey || !this.privateJwk || !this.publicJwk) {
      const { privateKey, publicKey } = await generateKeyPair('ES256');
      this.privateKey = privateKey;
      this.publicKey = publicKey;
      this.privateJwk = await exportJWK(privateKey);
      this.privateJwk.alg = 'ES256';
      this.privateJwk.use = 'sig';
      this.publicJwk = await exportJWK(publicKey);
      this.publicJwk.alg = 'ES256';
      this.publicJwk.use = 'sig';
    }

    return {
      privateKey: this.privateKey,
      publicKey: this.publicKey,
      privateJwk: this.privateJwk,
      publicJwk: this.publicJwk,
    };
  }

  async getJwks(): Promise<{ keys: JWK[]}> {
    const { privateJwk } = await this.getKeys();
    const jwks = { keys: [{ ...privateJwk }] };
    return jwks;
  }
}
