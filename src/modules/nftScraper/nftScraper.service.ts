import { HttpService, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import Moralis from 'moralis/node';

import { AppConfig } from '../configuration/configuration.service';
import { QueueService } from '../queue/queue.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Nft, NftSource } from '../nft/domain/nft.entity';
import { CollectionSource, NftCollection } from '../nft/domain/collection.entity';

import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

Moralis.serverURL = 'https://hvycejshzgpl.grandmoralis.com:2053/server';
Moralis.masterKey = 'xI5yKj7ZkR0tmxJTKEGJoyXBHqB1kOlymcFzQmCQ';
Moralis.initialize('PRy8GGFFj6DMeI6soQvoubHuJzzxOEXQ6VU7Jw2L');

@Injectable()
export class NftScraperService {
  constructor(
    private readonly config: AppConfig,
    private readonly queue: QueueService,
    private httpService: HttpService,
    @InjectRepository(Nft)
    private nftRepository: Repository<Nft>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(NftCollection)
    private nftCollectionRepository: Repository<NftCollection>,
  ) {}

  async onModuleInit() {
    this.queue.initQueue('nftScraper', this.nftScraperHandler, 3);
    console.log(`The module has been initialized.`);

    const users = await this.userRepository.find({ where: { isActive: true } });

    // for (let i = 0; i < users.length; i++) {
    //   const user = users[i];
    //   try {
    //     this.addUserToWatchEthEvent(user.address);
    //   } catch (error) {
    //     console.log('error: onModuleInit', error);
    //   }
    // }
    const response = await this.getUserNFTs(users[0].address);
    const ohyesok = await this.transformResponse(response);
    //console.log(formattedData);
  }

  /**
   * @summary Transform Data into DB Format
   * @param {Array} response: token array from the moralis sdk
   */
  private transformResponse = async (response) => {
    for (let i = 0; i < response.length; i++) {
      const data = response[i];
      console.log('data++++++++++', data);
    }
    return response;
  };

  /**
   * @summary Gets the NFTs owned by a given address
   * @param {string} address The owner address
   */
  private getUserNFTs = async (userAddress: string) => {
    return Moralis.Cloud.run('getUserNFTs', { userAddress: userAddress.toLowerCase() });
  };

  /**
   * @summary Add new user to watchEthEvent Table
   * @param {string} address The owner address
   */
  private addUserToWatchEthEvent = async (address: string) => {
    console.log(address);
    return Moralis.Cloud.run('watchEthAddress', {
      address: address.toLowerCase(),
      chainId: '0x4',
    });
  };

  nftScraperHandler = async (input: any, cb: any) => {
    cb(null, true);
  };

  // nftScraperHandler = async (input: any, cb: any) => {
  //   const { address, page } = input;
  //   const limit = 10;
  //   console.log(address, page);
  //   const scraperResponse = await this.httpService
  //     .get(`https://api.opensea.io/api/v1/assets?owner=${address}&offset=${page * limit}&limit=${limit}`)
  //     .toPromise();

  //   const user = await this.userRepository.findOne({ where: { address } });
  //   if (!user) return;

  //   const nfts = scraperResponse.data.assets;
  //   if (nfts.length > 0) {
  //     this.queue.pushToQueue('nftScraper', { address, page: page + 1 });
  //   }
  //   for (const nft of nfts) {
  //     const nftDB = new Nft();
  //     nftDB.userId = user.id;
  //     nftDB.tokenId = nft.token_id;
  //     nftDB.name = nft.name;
  //     nftDB.description = nft.description;
  //     nftDB.properties = nft.attributes;
  //     nftDB.source = NftSource.SCRAPER;
  //     nftDB.url = nft.image_url;
  //     nftDB.optimized_url = nft.image_preview_url;
  //     nftDB.thumbnail_url = nft.image_thumbnail_url;
  //     nftDB.original_url = nft.image_original_url;

  //     let nftCollection = await this.nftCollectionRepository.findOne({
  //       where: { address: nft.asset_contract.address },
  //     });
  //     if (!nftCollection) {
  //       nftCollection = new NftCollection();
  //       nftCollection.address = nft.asset_contract.address;
  //       nftCollection.name = nft.asset_contract.name;
  //       nftCollection.symbol = nft.asset_contract.symbol;
  //       nftCollection.description = nft.asset_contract.description;
  //       nftCollection.source = CollectionSource.SCRAPER;
  //       await this.nftCollectionRepository.save(nftCollection);
  //     }
  //     nftDB.collectionId = nftCollection.id;
  //     nftDB.royalties = 0;

  //     await this.nftRepository.save(nftDB);
  //   }

  //   cb(null, true);
  // };

  async startNftScraperForAddress(address: string) {
    this.queue.pushToQueue('nftScraper', { address, page: 0 });
  }

  @Cron(CronExpression.EVERY_DAY_AT_10PM)
  async getNftsForUsers() {
    const users = await this.userRepository.find({ where: { isActive: true } });
    for (const user of users) {
      this.startNftScraperForAddress(user.address);
    }
  }
}
