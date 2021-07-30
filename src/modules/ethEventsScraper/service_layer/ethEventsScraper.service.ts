import { HttpService, Injectable, Logger } from '@nestjs/common';
import { AppConfig } from '../../configuration/configuration.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueService } from '../../queue/queue.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Nft, NftSource } from '../../nft/domain/nft.entity';
import { CollectionSource, NftCollection } from '../../nft/domain/collection.entity';

import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { DeployCollectionEvent } from '../domain/deploy-collection-event.entity';
import { MintedNftEvent } from '../domain/mintNftEvent.entity';
import { customAlphabet } from 'nanoid';
import { SavedNft } from '../../nft/domain/saved-nft.entity';
import { MintingCollection } from '../../nft/domain/minting-collection.entity';

@Injectable()
export class EthEventsScraperService {
  private logger = new Logger(EthEventsScraperService.name);
  processing = false;

  constructor(
    private readonly config: AppConfig,
    private readonly queue: QueueService,
    private httpService: HttpService,
    @InjectRepository(Nft)
    private nftRepository: Repository<Nft>,
    @InjectRepository(SavedNft)
    private savedNftRepository: Repository<SavedNft>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(NftCollection)
    private nftCollectionRepository: Repository<NftCollection>,
    @InjectRepository(DeployCollectionEvent)
    private deployCollectionEventRepository: Repository<DeployCollectionEvent>,
    @InjectRepository(MintingCollection)
    private mintingCollectionRepository: Repository<MintingCollection>,
    @InjectRepository(MintedNftEvent)
    private createNftEventRepository: Repository<MintedNftEvent>,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
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
      const mintingCollection = await this.mintingCollectionRepository.findOne({ where: { txHash: event.tx_hash } });

      const collection = this.nftCollectionRepository.create();
      collection.txHash = event.tx_hash;
      collection.address = event.contract_address?.toLowerCase();
      collection.owner = event.owner.toLowerCase();
      collection.name = event.token_name;
      collection.symbol = event.token_symbol;

      if (mintingCollection) {
        collection.shortUrl = mintingCollection.shortUrl;
        collection.coverUrl = mintingCollection.coverUrl;
        collection.description = mintingCollection.description;
        await this.mintingCollectionRepository.delete({ txHash: event.tx_hash });
      }

      event.processed = true;
      await this.deployCollectionEventRepository.save(event);
      await this.nftCollectionRepository.save(collection);
    }
  }

  private async syncMintNftEvents() {
    const events = await this.createNftEventRepository.find({ where: { processed: false } });
    const tokenUriEventsMap = this.mapTokenUriToEvents(events);

    for (const tokenUri of Object.keys(tokenUriEventsMap)) {
      const editionUUID = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)();
      const events = tokenUriEventsMap[tokenUri];

      for (const event of events) {
        const response = await this.httpService.get(event.token_uri).toPromise();
        const artworkType = (response.data.image_url as string).split(/[.]+/);
        const user = await this.userRepository.findOne({ where: { address: event.receiver.toLowerCase() } });
        const collection = await this.nftCollectionRepository.findOne({
          where: { address: event.contract_address.toLowerCase() },
        });

        if (user && collection) {
          const nft = this.nftRepository.create();
          nft.userId = user.id;
          nft.collectionId = collection.id;
          nft.txHash = event.tx_hash;
          nft.editionUUID = editionUUID;
          nft.name = response.data.name as string;
          nft.description = response.data.description as string;
          nft.tokenId = event.token_id;
          nft.artworkType = artworkType[artworkType.length - 1];
          nft.url = response.data.image_url as string;
          nft.optimized_url = response.data.image_preview_url as string;
          nft.thumbnail_url = response.data.image_thumbnail_url as string;
          nft.original_url = response.data.image_original_url as string;
          nft.tokenUri = event.token_uri;
          nft.properties = response.data.traits;
          nft.royalties = response.data.royalties;

          event.processed = true;
          await this.createNftEventRepository.save(event);

          await this.nftRepository.save(nft);
        }
      }
      await this.savedNftRepository.softDelete({ tokenUri });
    }
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
