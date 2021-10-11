import { HttpService, Injectable, Logger } from '@nestjs/common';
import { AppConfig } from '../../configuration/configuration.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueService } from '../../queue/queue.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Nft } from '../../nft/domain/nft.entity';
import { NftCollection } from '../../nft/domain/collection.entity';

import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { DeployCollectionEvent } from '../domain/deploy-collection-event.entity';
import { MintedNftEvent } from '../domain/mintNftEvent.entity';
import { customAlphabet } from 'nanoid';
import { SavedNft } from '../../nft/domain/saved-nft.entity';
import { MintingCollection } from '../../nft/domain/minting-collection.entity';
import { MintingNft } from 'src/modules/nft/domain/minting-nft.entity';

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
    @InjectRepository(MintingCollection)
    private mintingCollectionRepository: Repository<MintingCollection>,
    @InjectRepository(MintedNftEvent)
    private createNftEventRepository: Repository<MintedNftEvent>,
    @InjectRepository(MintingNft)
    private mintingNftRepository: Repository<MintingNft>,
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
      const mintingCollection = await this.mintingCollectionRepository.findOne({ where: { txHash: event.tx_hash } });

      if (!mintingCollection) continue;

      const collection = this.nftCollectionRepository.create();
      collection.txHash = event.tx_hash;
      collection.address = event.contract_address?.toLowerCase();
      collection.owner = event.owner.toLowerCase();
      collection.creator = event.owner.toLowerCase();
      collection.name = event.token_name;
      collection.symbol = event.token_symbol;
      collection.shortUrl = mintingCollection.shortUrl;
      collection.coverUrl = mintingCollection.coverUrl;
      collection.description = mintingCollection.description;
      await this.mintingCollectionRepository.delete({ txHash: event.tx_hash });

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
        const user = await this.userRepository.findOne({ where: { address: event.receiver.toLowerCase() } });
        const collection = await this.nftCollectionRepository.findOne({
          where: { address: event.contract_address.toLowerCase() },
        });
        let mintingNft = await this.mintingNftRepository.findOne({
          where: { tokenUri, collectionId: collection.id },
        });

        if (!user || !collection) continue;

        const nft = this.nftRepository.create();
        nft.userId = user.id;
        nft.collectionId = collection.id;
        await this.attachNftEdition(collection, event, nft, editionUUID);
        this.attachNftDataFromEvent(nft, event);
        this.attachNftDataFromTokenUri(nft, response);
        await this.attachNftNumberOfEditions(nft, tokenUri, collection.id, mintingNft);

        event.processed = true;
        await this.createNftEventRepository.save(event);
        await this.nftRepository.save(nft);

        mintingNft.mintedEditions = mintingNft.mintedEditions + 1;
        if (mintingNft.mintedEditions === mintingNft.numberOfEditions) {
          await this.mintingNftRepository.delete({ tokenUri });
        } else {
          await this.mintingNftRepository.save(mintingNft);
        }
      }
    }
  }

  private async attachNftNumberOfEditions(nft: Nft, tokenUri: string, collectionId: number, mintingNft: MintingNft) {
    nft.numberOfEditions = 1;

    if (mintingNft) {
      nft.numberOfEditions = mintingNft.numberOfEditions;
    } else {
      const nftsCountByTokenUri = await this.nftRepository.count({
        where: { collectionId, tokenUri },
      });
      if (nftsCountByTokenUri !== 0) {
        nft.numberOfEditions = nftsCountByTokenUri + 1;
        await this.nftRepository.update({ collectionId, tokenUri }, { numberOfEditions: nftsCountByTokenUri + 1 });
      }
    }
  }

  private async attachNftEdition(collection: NftCollection, event: MintedNftEvent, nft: Nft, editionUUID: string) {
    const nftByTokenUri = await this.nftRepository.findOne({
      where: { collectionId: collection.id, tokenUri: event.token_uri },
    });
    nft.editionUUID = nftByTokenUri ? nftByTokenUri.editionUUID : editionUUID;
  }

  private attachNftDataFromTokenUri(nft: Nft, response) {
    nft.name = response.data.name as string;
    nft.description = response.data.description as string;
    nft.artworkType = this.getExtensionFromUrl(response.data.image_original_url);
    nft.url = response.data.image_original_url as string;
    nft.optimized_url = response.data.image_preview_url as string;
    nft.thumbnail_url = response.data.image_thumbnail_url as string;
    nft.original_url = response.data.image_url as string;
    nft.properties = response.data.attributes?.map((attributeObject) => ({
      [attributeObject.trait_type]: attributeObject.value,
    }));
    nft.royalties = response.data.royalties;
  }

  private attachNftDataFromEvent(nft: Nft, event: MintedNftEvent) {
    nft.txHash = event.tx_hash;
    nft.tokenId = event.token_id;
    nft.tokenUri = event.token_uri;
    nft.creator = event.receiver?.toLowerCase();
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
