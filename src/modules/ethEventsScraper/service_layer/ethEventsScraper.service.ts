import { HttpService, Injectable, Logger } from '@nestjs/common';
import { AppConfig } from '../../configuration/configuration.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueService } from '../../queue/queue.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Nft } from '../../nft/domain/nft.entity';
import { NftCollection } from '../../nft/domain/collection.entity';

import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { DeployCollectionEvent } from '../domain/deploy-collection-event';
import { MintedNftEvent } from '../domain/mintNftEvent';
import { customAlphabet } from 'nanoid';
import { 
  NftCollectionStatusEnum, 
  NftStatusEnum,
  NftTransactionStatusEnum, 
} from 'src/common/constants/enums';
import { NftTransaction } from '../../nft/domain/nft-transaction.entity';
import { NftFile } from '../../nft/domain/nft-file.entity';
// import { SavedNft } from '../../nft/domain/saved-nft.entity';
// import { MintingCollection } from '../../nft/domain/minting-collection.entity';
// import { MintingNft } from 'src/modules/nft/domain/minting-nft.entity';

@Injectable()
export class EthEventsScraperService {
  private logger = new Logger(EthEventsScraperService.name);
  processing = false;

  constructor(
    private httpService: HttpService,
    @InjectRepository(Nft)
    private nftRepository: Repository<Nft>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(NftCollection)
    private nftCollectionRepository: Repository<NftCollection>,
    @InjectRepository(DeployCollectionEvent)
    private deployCollectionEventRepository: Repository<DeployCollectionEvent>,
    // @InjectRepository(MintingCollection)
    // private mintingCollectionRepository: Repository<MintingCollection>,
    @InjectRepository(MintedNftEvent)
    private createNftEventRepository: Repository<MintedNftEvent>,
    // @InjectRepository(MintingNft)
    // private mintingNftRepository: Repository<MintingNft>,
    @InjectRepository(NftTransaction)
    private nftTransactionRepository: Repository<NftTransaction>,
    @InjectRepository(NftFile)
    private nftFileRepository: Repository<NftFile>
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async syncCollectionAndNftEvents() {
    this.logger.log('start');
    try {
      if (this.processing) return;
      this.processing = true;
      await this.syncDeployCollectionEvents();
      await this.syncMintNftEvents();
      this.processing = false;
    } catch (e) {
      this.processing = false;
      console.log(e);
    }
    this.logger.log('end');
  }

  private async syncDeployCollectionEvents() {
    const events = await this.deployCollectionEventRepository.find({ where: { processed: false } });

    for (const event of events) {
      const deployingCollection = await this.nftCollectionRepository.findOne({ 
        where: { 
          txHash: event.tx_hash,
          status: NftCollectionStatusEnum.DEPLOYING,
        } 
      });

      if (!deployingCollection) continue;

      deployingCollection.address = event.contract_address?.toLowerCase();
      deployingCollection.owner = event.owner.toLowerCase();
      deployingCollection.creator = event.owner.toLowerCase();
      deployingCollection.name = event.token_name;
      deployingCollection.symbol = event.token_symbol;

      event.processed = true;
      await this.deployCollectionEventRepository.save(event);
      await this.nftCollectionRepository.save(deployingCollection);
    }
  }

  private async syncMintNftEvents() {
    const events = await this.createNftEventRepository.find({ where: { processed: false } });
    const tokenUriEventsMap = this.mapTokenUriToEvents(events);
    const tokenUris = Object.keys(tokenUriEventsMap);
    this.logger.log(`found ${tokenUris.length} token URIs`);

    for (const tokenUri of tokenUris) {
      await this.processTokenUri(tokenUri, tokenUriEventsMap[tokenUri]);
    }
  }

  private async processTokenUri(tokenUri: string, events: MintedNftEvent[]) {
    try {
      const editionUUID = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)();
      const response = await this.httpService.get(tokenUri).toPromise();

      for (const event of events) {
        const user = await this.userRepository.findOne({ where: { address: event.receiver.toLowerCase() } });
        const collection = await this.nftCollectionRepository.findOne({
          where: { 
            address: event.contract_address.toLowerCase(),
            status: NftCollectionStatusEnum.DEPLOYED,
          },
        });

        if (!user || !collection) continue;

        const mintingNft = await this.nftRepository.findOne({
          where: { 
            tokenUri: tokenUri, 
            status: NftStatusEnum.MINTING,
            collectionId: collection.id 
          },
        });
        if (!mintingNft) continue;

        mintingNft.userId = user.id;
        mintingNft.collectionId = collection.id;
        await this.attachNftEdition(collection, event, mintingNft, editionUUID);
        await this.attachNftDataFromEvent(mintingNft, event);
        await this.attachNftDataFromTokenUri(mintingNft, response);
        
        // await this.attachNftNumberOfEditions(nft, tokenUri, collection.id, mintingNft);
        mintingNft.numberOfEditions = mintingNft.numberOfEditions ? mintingNft.numberOfEditions + 1 : 1;

        mintingNft.status = NftStatusEnum.MINTED;

        event.processed = true;
        await this.createNftEventRepository.save(event);
        await this.nftRepository.save(mintingNft);
      }
    } catch (error) {
      this.logger.error(`processTokenUri ${tokenUri} ${JSON.stringify(error, undefined, '  ')}`);
    }
  }

  /**
   * @Deprecated
   * @param nft 
   * @param tokenUri 
   * @param collectionId 
   * @param mintingNft 
   */
  // private async attachNftNumberOfEditions(nft: Nft, tokenUri: string, collectionId: number, mintingNft: Nft) {
  //   nft.numberOfEditions = 1;

  //   if (mintingNft) {
  //     nft.numberOfEditions = mintingNft.numberOfEditions;
  //   } else {
  //     const nftsCountByTokenUri = await this.nftRepository.count({
  //       where: { collectionId, tokenUri },
  //     });
  //     if (nftsCountByTokenUri !== 0) {
  //       nft.numberOfEditions = nftsCountByTokenUri + 1;
  //       await this.nftRepository.update({ collectionId, tokenUri }, { numberOfEditions: nftsCountByTokenUri + 1 });
  //     }
  //   }
  // }

  private async attachNftEdition(collection: NftCollection, event: MintedNftEvent, nft: Nft, editionUUID: string) {
    const nftByTokenUri = await this.nftRepository.findOne({
      where: { 
        collectionId: collection.id, 
        tokenUri: event.token_uri, 
      },
    });
    nft.editionUUID = nftByTokenUri ? nftByTokenUri.editionUUID : editionUUID;
  }

  private async attachNftDataFromTokenUri(nft: Nft, response) {
    nft.name = response.data.name as string;
    nft.description = response.data.description as string;
    
    let nftFile = this.nftFileRepository.create();
//@TODO this has to be updated as universe nfts will support multiple files.    
    nftFile.order = 1;
    nftFile.type = this.getExtensionFromUrl(response.data.image_original_url);
    nftFile.url = response.data.image_original_url as string;
    nftFile.optimizedUrl = response.data.image_preview_url as string;
    nftFile.originalUrl = response.data.image_url as string;
    nftFile.nft = nft;
    await this.nftFileRepository.save(nftFile);
    
    nft.properties = response.data.attributes?.map((attributeObject) => ({
      [attributeObject.trait_type]: attributeObject.value,
    }));
    nft.royalties = response.data.royalties;
  }

  private async attachNftDataFromEvent(nft: Nft, event: MintedNftEvent) {
    let nftTransaction = this.nftTransactionRepository.create();
    nftTransaction.hash = event.tx_hash;
    nftTransaction.nft = nft; // - this nft already exists in the nft table so it's safe to assign it!
    //not sure if we have the status here
    //nftTransaction.status = NftTransactionStatusEnum.SUCCESS;
    await this.nftTransactionRepository.save(nftTransaction);

    nft.tokenId = event.token_id.toString();
    nft.tokenUri = event.token_uri;
    nft.creator = event.receiver?.toLowerCase();
    nft.owner = event.receiver?.toLowerCase();
  }

  private mapTokenUriToEvents(events: MintedNftEvent[]) {
    const tokenUriEventsMap = events.reduce((acc, event) => {
      const prevEventsForTokenUri = acc[event.token_uri] || [];
      return {
        ...acc,
        [event.token_uri]: [...prevEventsForTokenUri, event],
      };
    }, {} as Record<string, MintedNftEvent[]>);
    return tokenUriEventsMap;
  }

  private getExtensionFromUrl(url: string) {
    if (!url) {
      return undefined;
    }
    const urlComponents = url.split(/[.]+/);
    return urlComponents[urlComponents.length - 1];
  }

  //Todo: search for auctions with txHash and onChain flag false
  async syncCreateAuctionEvents() {}

  //We might need to rethink how things are stored in the database, don't know if the jsonb encoded data is ok
  //We might need to add a txHash to the nft table, and look for a specific transaction,
  //  downside is that the fe might be tricked by interacting directly with the contract
  //Todo: search for nfts associated with auctions not started and with a valid id (on chain)
  //build an id list, and search through the event list for events linked to these
  async syncDepositNftAuctionEvents() {}

  //Todo: search for nfts associated with auctions not started and with a valid id (on chain)
  //build an id list, and search through the event list for events linked to these
  async syncWithdrawNftAuctionEvents() {}
}
