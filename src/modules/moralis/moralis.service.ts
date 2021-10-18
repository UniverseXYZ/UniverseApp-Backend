import { HttpService, Injectable, Logger } from '@nestjs/common';
import { AppConfig } from '../configuration/configuration.service';
//import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueService } from '../queue/queue.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Nft, NftSource } from '../nft/domain/nft.entity';
import { CollectionSource, NftCollection } from '../nft/domain/collection.entity';

import { Repository, ILike } from 'typeorm';
import { User } from '../users/user.entity';
import Moralis from 'moralis/node';

const MORALIS_NEW_NFT_QUEUE = 'MORALIS_NEW_NFT_QUEUE';

Moralis.serverURL = process.env.MORALIS_SERVERURL;
Moralis.masterKey = process.env.MORALIS_MASTER_KEY;
Moralis.initialize(process.env.MORALIS_APPLICATION_ID);

function fixURL(url) {
  if (url.startsWith('ipfs')) {
    return 'https://ipfs.moralis.io:2053/ipfs/' + url.split('ipfs://ipfs/').slice(-1)[0];
  } else {
    return url + '?format=json';
  }
}

@Injectable()
export class MoralisService {
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
    this.queue.initQueue(MORALIS_NEW_NFT_QUEUE, this.moralisNewNFTOwnerHandler, 3);
    console.log(`The module has been initialized.`);
  }

  addNewUserToWatchAddress = async (address: string) => {
    Moralis.Cloud.run('watchEthAddress', {
      address,
      chainId: process.env.NODE_ENV === 'development' ? '0x4' : '0x1',
      sync_historical: true,
    });
  };

  moralisNewNFTOwnerHandler = async (input: any, cb: any) => {
    const { token } = input;

    //--- fetch metadata
    if (token.token_uri) {
      const response = await this.httpService.get(fixURL(token.token_uri)).toPromise();
      token.metaData = response.data ? response.data : {};
    } else {
      token.metaData = {};
    }

    const foundToken = await this.nftRepository.findOne({ where: { tokenId: token.token_id } });
    const user = await this.userRepository.findOne({ where: { address: token.owner_of } }); // Just need to ignore case-sensitive

    if (foundToken && !user) {
      await this.nftRepository.remove(foundToken);
      return;
    } else if (foundToken && user) {
      foundToken.userId = user.id;
      return;
    } else if (!user) return;

    const newRow = new Nft();

    newRow.userId = user.id;
    newRow.tokenId = token.token_id;
    newRow.name = token.name;
    newRow.tokenUri = token.token_uri;
    newRow.collectionId = 1;

    await this.nftRepository.save(newRow);

    cb(null, true);
  };

  async addNewNFT(token) {
    this.queue.pushToQueue(MORALIS_NEW_NFT_QUEUE, { token });
  }
}
