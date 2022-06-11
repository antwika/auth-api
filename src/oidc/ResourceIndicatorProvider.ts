import { Data, IStore } from '@antwika/store';
import { ResourceServer } from 'oidc-provider';

export interface IResourceServerInfo extends Data {
  scope: string,
  audience: string,
  accessTokenTTL: number,
  accessTokenFormat: string,
  jwt: {
    sign: {
      alg: string,
    },
  },
}

export interface IResourceIndicatorProvider {
  registerResourceServerInfo: (
    resourceServerInfo: IResourceServerInfo,
  ) => Promise<IResourceServerInfo>,
  getDefaultResource: (ctx: any) => Promise<string>,
  getResourceServerInfo: (
    ctx: any,
    resourceIndicator: string,
    client: any,
  ) => Promise<ResourceServer>,
}

export class ResourceIndicatorProvider implements IResourceIndicatorProvider {
  private readonly store: IStore;

  constructor(store: IStore) {
    this.store = store;
  }

  async registerResourceServerInfo(resourceServerInfo: IResourceServerInfo) {
    return this.store.create(resourceServerInfo);
  }

  async getDefaultResource(_ctx: any) {
    return 'http://localhost:3000';
  }

  async getResourceServerInfo(_ctx: any, _resourceIndicator: string, client: any) {
    const all = await this.store.readAll<IResourceServerInfo>();
    const found = all.filter((a) => a.audience === client.clientId);
    if (found.length === 0) throw new Error('Did not find any suitable resource server info');
    return found[0] as unknown as ResourceServer;
  }
}
