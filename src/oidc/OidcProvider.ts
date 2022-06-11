import { Provider } from 'oidc-provider';
import { IConfigurationProvider } from './ConfigurationProvider';

export interface IOidcProvider {
  getProvider: () => Promise<Provider>
}

export class OidcProvider implements IOidcProvider {
  private provider: Provider | undefined;

  private readonly configurationProvider;

  private readonly baseUrl;

  constructor(
    configurationProvider: IConfigurationProvider,
    baseUrl: string,
  ) {
    this.configurationProvider = configurationProvider;
    this.baseUrl = baseUrl;
  }

  async getProvider() {
    if (this.provider) {
      return this.provider;
    }

    this.provider = new Provider(`${this.baseUrl}/oidc`, await this.configurationProvider.getConfiguration());
    this.provider.proxy = true;

    return this.provider;
  }
}
