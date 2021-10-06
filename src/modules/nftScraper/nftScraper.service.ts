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

const MORALIS_APPLICATION_ID = process.env['MORALIS_APPLICATION_ID'] || 'jlvmvCLbkVYZdgOMeKvYCuK8awZLCQARSLRsVb5o';
const MORALIS_SERVER_URL = process.env['MORALIS_SERVER_URL'] || 'https://sv8erjsrz4wg.bigmoralis.com:2053/server';
const MORALIS_MASTER_KEY = process.env['MORALIS_MASTER_KEY'] || 'SXFHQTYXbcYWX1JnkHrTHfb0vN1RwfNxTSeNnjm3';

Moralis.serverURL = MORALIS_SERVER_URL;
Moralis.masterKey = MORALIS_MASTER_KEY;
Moralis.initialize(MORALIS_APPLICATION_ID);

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
    for (const user of users) {
      this.addUserToWatchEthEvent(user.address);
    }
  }

  getUserNFTs = async (userAddress: string) => {
    return Moralis.Cloud.run('getUserNFTs', { userAddress });
  };

  addUserToWatchEthEvent = async (userAddress: string) => {
    return Moralis.Cloud.run('watchEthAddress', { address: userAddress });
  };

  nftScraperHandler = async (input: any, cb: any) => {
    cb(null, true);
  }

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
