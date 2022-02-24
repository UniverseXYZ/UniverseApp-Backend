import { Injectable, Logger } from '@nestjs/common';
import { AppConfig } from '../configuration/configuration.service';
import Arweave from 'arweave';

@Injectable()
export class ArweaveService {
  
  private readonly arweave: Arweave;
  private readonly arweaveBaseUrl: string;
  private readonly minConfirmations: number;
  private readonly walletKey: any;

  private logger: Logger = new Logger(ArweaveService.name);

  constructor(appConfig: AppConfig) {
    // Pull out stuff relative to Arweave, only
    const config = appConfig.values.arweave;
    // Initialize our Arweave instance
    this.arweave = Arweave.init(config.clientConfig);
    // Build out baseUrl used for storage and for constructing URLs pointing to stored data
    this.arweaveBaseUrl = `${config.clientConfig.protocol}://${config.clientConfig.host}:${config.clientConfig.port}`;
    // How many confirmations to wait until we assume storage was successful
    this.minConfirmations = config.minConfirmations;
    // Wallet key
    this.walletKey = config.walletKey;
  }

  /*
   * Private members
   */

  private async confirmTransaction(transactionId : string) : Promise<boolean> {

    let confirmations = 0, response;
    
    // This might be too tight of a loop, will need to test to see
    while(confirmations < this.minConfirmations) {
      // Ask Arweave for tx status
      response = await this.arweave.transactions.getStatus(transactionId);
      
      if(200 <= response.status && response.status <= 300) { // Perhaps strictly 200?
        confirmations = response.number_of_confirmations;
      }
      else {
        this.logger.log(`Storing to Arweave returned unexpected response status ${response.status}, giving up!`);
        return false;
      }
    }
    
    return true;
  }

  private async initTransaction(data: any, mimeType?: any /* optional */) : Promise<any> {
    // Create tx
    let transaction = await this.arweave.createTransaction({ data }, this.walletKey);
    // Optionally add tag specifying content type
    if('undefined' !== typeof mimeType) {
      transaction.addTag('Content-Type', mimeType);
    }
    // Sign
    await this.arweave.transactions.sign(transaction, this.walletKey);
    return transaction;
  }

  private async doStore(transaction: any) : Promise<string> {
    // Grab an uploader for the tx so we can upload in chunks - can this fail?
    let uploader = await this.arweave.transactions.getUploader(transaction);
    // Upload the JSON
    while (!uploader.isComplete) {
        await uploader.uploadChunk();
    }
    // Done, now confirm tx status and wait til we've seen enough confirmations
    return await this.confirmTransaction(transaction.id)
      ? new URL(`/${transaction.id}`, this.arweaveBaseUrl).href
      : null;
  }

  private async storeJson(data: any) : Promise<string> {
    // Create buffer from json text
    const dataBuffer = Buffer.from(JSON.stringify(data));
    // Let storeData take it from here
    return await this.storeData(dataBuffer, 'application/json');
  }

  /*
   * Public members
   */

  public async storeData(data: any, mimeType: string) : Promise<string> {
    const transaction = await this.initTransaction(data, mimeType);
    // Store data on arweave
    return await this.doStore(transaction);
  }

  public async storeMetadata(data: any) : Promise<string> {
    return await this.storeJson(data);
  }

  // Unused?
  public async generateWallet() {
    const key = await this.arweave.wallets.generate();
    this.logger.log(JSON.stringify(key));
  }

}
