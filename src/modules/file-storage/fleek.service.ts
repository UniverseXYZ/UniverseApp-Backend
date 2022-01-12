import { Injectable, Logger } from '@nestjs/common';
import { AppConfig } from '../configuration/configuration.service';
import fleek from '@fleekhq/fleek-storage-js';
import * as crypto from 'crypto';

/**
 * IpfsData - repeats the structure of the object returned by fleek.upload()
 */
type IpfsData = {
  hash: string;
  hashV0: string;
  key: string;
  bucket: string;
  publicUrl: string;
}

/**
 * Decorator class for the Fleek npm package @fleekhq/fleek-storage-js
 * @See https://docs.fleek.co/storage/fleek-storage-js/
 */
@Injectable()
export class FleekService {
  private logger: Logger = new Logger(FleekService.name);

  constructor(private config: AppConfig) {}

  /**
   * Uploads content described by data to ipfs using Fleek.
   * This method is intended for uploading files to IPFS using fleek.
   * @param {Object} data - Object returned by fs.readFile() (file buffer)
   * @param {Express.Multer.File} file - file metadata
   * @returns {Object} - Response from Fleek.
   * {
   *   hash: 'bafybeidrowxmabdegcftk47p3lmvdn2dlfhgyz3lr2jlixsse6ifs24xwi',
   *   hashV0: 'QmVyYrkD1vYuaG6Wm2mTWgxopuSjdZGdomRSZuy9vBP1RK',
   *   key: 'universe-1637788826695-ceb6bb4233f065f4a8df35a167456c849136ace79ee4ab897f9ee88f961a6f18',
   *   bucket: 'af0e958f-6b9a-40df-b6b8-8b0612514958-bucket',
   *   publicUrl: 'https://storageapi.fleek.co/af0e958f-6b9a-40df-b6b8-8b0612514958-bucket/universe-1637788826695-ceb6bb4233f065f4a8df35a167456c849136ace79ee4ab897f9ee88f961a6f18'
   * }
   */
  public async upload(data: any, file: Express.Multer.File): Promise<IpfsData> {
    let value: IpfsData;

    try {
      value = await fleek.upload({
        apiKey: this.config.values.fleek.apiKey,
        apiSecret: this.config.values.fleek.apiSecret,
        key: 'universe-' + Date.now() + '-' + file.filename,
        bucket: this.config.values.fleek.bucket,
        data: data,
      });
      this.logger.log(`Uploaded file to Fleek, hash: ${value.hash} publicUrl: ${value.publicUrl}`);
    } catch(e) {
      this.logger.log(`Could not upload file (${file.filename}) to Fleek: ${e.message}`);
    }
  
    return value;
  }

  /**
   * Uploads content described by data to ipfs using Fleek.
   * This method is intended for uploading NFT metadata to ipfs using Fleek.
   * @param {Object} data - NFT metadata
   * @returns {Object} - Response from Fleek.
   * {
   *   hash: 'bafybeidrowxmabdegcftk47p3lmvdn2dlfhgyz3lr2jlixsse6ifs24xwi',
   *   hashV0: 'QmVyYrkD1vYuaG6Wm2mTWgxopuSjdZGdomRSZuy9vBP1RK',
   *   key: 'universe-1637788826695-ceb6bb4233f065f4a8df35a167456c849136ace79ee4ab897f9ee88f961a6f18',
   *   bucket: 'af0e958f-6b9a-40df-b6b8-8b0612514958-bucket',
   *   publicUrl: 'https://storageapi.fleek.co/af0e958f-6b9a-40df-b6b8-8b0612514958-bucket/universe-1637788826695-ceb6bb4233f065f4a8df35a167456c849136ace79ee4ab897f9ee88f961a6f18'
   * }
   */
  public async uploadMetadata(data: Object): Promise<IpfsData> {
    let value: IpfsData;
    const content = JSON.stringify(data);
    
    try {
      value = await fleek.upload({
        apiKey: this.config.values.fleek.apiKey,
        apiSecret: this.config.values.fleek.apiSecret,
        key: 'universe-' + Date.now() + '-' + crypto.createHash('md5').update(content).digest('hex') + '.json',
        bucket: this.config.values.fleek.bucket,
        data: content,
      });
      this.logger.log(`Uploaded json file to Fleek, hash: ${value.hash} publicUrl: ${value.publicUrl}`);
    } catch(e) {
      this.logger.error(`Could not upload json file to Fleek: ${e.message}`);
    }
    
    return value;
  }

  /**
   * This method deletes a pinned file from the Fleek Storage
   * by the file key and bucket.
   * @param {Object} ipfsData - Object of type IpfsData or null
   * @returns void
   */
  public async delete(ipfsData: any) {
    try {
      if(null !== ipfsData 
        && ipfsData.hasOwnProperty('key')
        && ipfsData.hasOwnProperty('bucket')
        && ipfsData.key.length > 0
        && ipfsData.bucket.length > 0
      ) {
        await fleek.deleteFile({
          apiKey: this.config.values.fleek.apiKey,
          apiSecret: this.config.values.fleek.apiSecret,
          key: ipfsData.key,
          bucket: ipfsData.bucket,
        });
        this.logger.log(`Successfully deleted a file with key ${ipfsData.key} from Fleek.`);
      }
    } catch(e) {
      this.logger.error(`Could not delete file with key ${ipfsData.key} from Fleek: ${e.message}`);
    }
  }

}