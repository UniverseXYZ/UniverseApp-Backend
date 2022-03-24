import { Injectable, Logger } from '@nestjs/common';
import { AppConfig } from '../configuration/configuration.service';
import { ArweaveStore } from 'arweave-store';

@Injectable()
export class ArweaveService {
  private logger: Logger = new Logger(ArweaveService.name);

  constructor(private config: AppConfig) {}

  public async store(data: any) {
    const walletJson = this.config.values.arweave.wallet;
    const arweaveStore = new ArweaveStore(JSON.parse(walletJson), {
      host: 'arweave.net', // Hostname or IP address for a Arweave host
      port: 443, // Port
      protocol: 'https', // Network protocol http or https
      timeout: 150000, // Network request timeouts in milliseconds
      logging: false, // Enable network request logging
    });
    const wallet = await arweaveStore.wallet();
    const balance = await arweaveStore.balance(wallet);
    this.logger.log(`wallet : ${wallet} balance: ${balance}`);
    const url = await arweaveStore.store(Buffer.from(JSON.stringify(data)), 'application/json');
    return url;
  }

  public async storeData(data: any, mimeType: string) {
    const walletJson = this.config.values.arweave.wallet;
    const arweaveStore = new ArweaveStore(JSON.parse(walletJson), {
      host: 'arweave.net', // Hostname or IP address for a Arweave host
      port: 443, // Port
      protocol: 'https', // Network protocol http or https
      timeout: 150000, // Network request timeouts in milliseconds
      logging: false, // Enable network request logging
    });
    const wallet = await arweaveStore.wallet();
    const balance = await arweaveStore.balance(wallet);
    this.logger.log(`wallet : ${wallet} balance: ${balance}`);
    const url = await arweaveStore.store(data, mimeType);
    return url;
  }

  public async generateWallet() {
    const arweaveStore = new ArweaveStore();
    const key = await arweaveStore.generate_wallet();
    this.logger.log(JSON.stringify(key));
  }
}
