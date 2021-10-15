import { HttpService, Injectable, Logger } from '@nestjs/common';
import { AppConfig } from '../configuration/configuration.service';
//import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueService } from '../queue/queue.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Nft, NftSource } from '../nft/domain/nft.entity';
import { CollectionSource, NftCollection } from '../nft/domain/collection.entity';

import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import Moralis from 'moralis/node';

const MORALIS_NEW_NFT_QUEUE = 'MORALIS_NEW_NFT_QUEUE';

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
    this.addNewNFT({
      token: {
        name: 'Non Fungible Universe Core',
        symbol: 'NFUC',
        token_uri: 'https://arweave.net/zMTulcMuluxkaT4e6I5myCmKqOeLDlRg0AQn-R84MlU',
        token_id: '6370',
        token_address: '0xd3ccbb9f3e5b9678c5f4fef91055704df81a104c',
        owner_of: '0x72523054c174a6c8e961bd14a2cab9f059e507e8',
        block_number: 9423437,
        amount: '1',
        contract_type: 'ERC721',
        className: 'EthNFTOwners',
      },
    });
    console.log(`The module has been initialized.`);
  }

  addNewUserToWatchAddress = async (address: string) => {
    Moralis.Cloud.run('watchEthAddress', {
      address,
      chainId: '0x04',
      sync_historical: true,
    });
  };

  moralisNewNFTOwnerHandler = async (input: any, cb: any) => {
    const { token } = input;

    //--- fetch metadata

    if (token.token_uri) {
      token.metaData = await this.httpService.get(token.token_uri).toPromise();
    } else {
      token.metaData = {};
    }

    // const newRow = new Nft();
    // const user = await this.userRepository.findOne({ where: { address: token.owner_of } });  // Just need to ignore case-sensitive
    // if (!user) return;

    // newRow.userId = user.id;
    // newRow.tokenId = token.token_id;
    // newRow.name = token.name;
    // newRow.symbol = token.symbol;
    // newRow.tokenAddress = token.token_address;
    // newRow.blockNumber = token.block_number;

    // name: 'Non Fungible Universe Core',
    // universe-backend              |       symbol: 'NFUC',
    // universe-backend              |       token_uri: 'https://arweave.net/zMTulcMuluxkaT4e6I5myCmKqOeLDlRg0AQn-R84MlU',
    // universe-backend              |       token_id: '6370',
    // universe-backend              |       token_address: '0xd3ccbb9f3e5b9678c5f4fef91055704df81a104c',
    // universe-backend              |       owner_of: '0x72523054c174a6c8e961bd14a2cab9f059e507e8',
    // universe-backend              |       block_number: 9423437,
    // universe-backend              |       amount: '1',
    // universe-backend              |       contract_type: 'ERC721',
    // universe-backend              |       className: 'EthNFTOwners'

    // const limit = 10;
    // console.log(address, page);
    // const scraperResponse = await this.httpService
    //   .get(`https://api.opensea.io/api/v1/assets?owner=${address}&offset=${page * limit}&limit=${limit}`)
    //   .toPromise();

    // const user = await this.userRepository.findOne({ where: { address } });
    // if (!user) return;

    // const nfts = scraperResponse.data.assets;
    // if (nfts.length > 0) {
    //   this.queue.pushToQueue(MORALIS_NEW_NFT_QUEUE, { address, page: page + 1 });
    // }
    // for (const nft of nfts) {
    //   const nftDB = new Nft();
    //   nftDB.userId = user.id;
    //   nftDB.tokenId = nft.token_id;
    //   nftDB.name = nft.name;
    //   nftDB.description = nft.description;
    //   nftDB.properties = nft.attributes;
    //   nftDB.source = NftSource.SCRAPER;
    //   nftDB.url = nft.image_url;
    //   nftDB.optimized_url = nft.image_preview_url;
    //   nftDB.thumbnail_url = nft.image_thumbnail_url;
    //   nftDB.original_url = nft.image_original_url;

    //   let nftCollection = await this.nftCollectionRepository.findOne({
    //     where: { address: nft.asset_contract.address },
    //   });
    //   if (!nftCollection) {
    //     nftCollection = new NftCollection();
    //     nftCollection.address = nft.asset_contract.address;
    //     nftCollection.name = nft.asset_contract.name;
    //     nftCollection.symbol = nft.asset_contract.symbol;
    //     nftCollection.description = nft.asset_contract.description;
    //     nftCollection.source = CollectionSource.SCRAPER;
    //     await this.nftCollectionRepository.save(nftCollection);
    //   }
    //   nftDB.collectionId = nftCollection.id;
    //   nftDB.royalties = 0;

    //   await this.nftRepository.save(nftDB);
    // }

    cb(null, true);
  };

  async addNewNFT(token) {
    this.queue.pushToQueue(MORALIS_NEW_NFT_QUEUE, { token });
  }

  //   @Cron(CronExpression.EVERY_DAY_AT_10PM)
  //   async getNftsForUsers() {
  //     const users = await this.userRepository.find({ where: { isActive: true } });
  //     for (const user of users) {
  //       this.startNFT_OWNER_QUEUEForAddress(user.address);
  //     }
  //   }
}
