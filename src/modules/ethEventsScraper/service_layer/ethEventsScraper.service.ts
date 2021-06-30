import { HttpService, Injectable, Logger } from '@nestjs/common';
import { AppConfig } from '../../configuration/configuration.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueService } from '../../queue/queue.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Nft, NftSource } from '../../nft/domain/nft.entity';
import { CollectionSource, NftCollection } from '../../nft/domain/collection.entity';

import { In, Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { CreateCollectionEvent } from '../domain/createCollectionEvent.entity';
import { MintedNftEvent } from '../domain/mintNftEvent.entity';
import { customAlphabet } from 'nanoid';
import axios from 'axios';
import { SavedNft } from '../../nft/domain/saved-nft.entity';

@Injectable()
export class EthEventsScraperService {
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
    @InjectRepository(CreateCollectionEvent)
    private createCollectionEventRepository: Repository<CreateCollectionEvent>,
    @InjectRepository(MintedNftEvent)
    private createNftEventRepository: Repository<MintedNftEvent>,
  ) {}

  //    @Cron(CronExpression.EVERY_DAY_AT_10PM)
  async syncCreateCollectionEvents() {
    const pendingNftCollections = await this.nftCollectionRepository.find({
      where: { onChain: false },
    });
    const nftCollectionsToCheck = {};
    const txHashesToCheck = [];

    for (const pendingNftCollection of pendingNftCollections) {
      nftCollectionsToCheck[pendingNftCollection.txHash] = pendingNftCollection;
      txHashesToCheck.push(pendingNftCollection.txHash);
    }

    const createCollectionEvents = await this.createCollectionEventRepository.find({
      where: {
        tx_hash: In(txHashesToCheck),
      },
    });

    for (const createCollectionEvent of createCollectionEvents) {
      if (nftCollectionsToCheck[createCollectionEvent.tx_hash]) {
        const nftCollectionToUpdate: NftCollection = nftCollectionsToCheck[createCollectionEvent.tx_hash];
        nftCollectionToUpdate.address = createCollectionEvent.contract_address;
        nftCollectionToUpdate.onChain = true;

        await this.nftCollectionRepository.save(nftCollectionToUpdate);
      }
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async syncCreateNftEvents() {
    if (this.processing) return;
    this.processing = true;

    const events = await this.createNftEventRepository.find({ where: { processed: false } });
    const txHashAndEventsMap = events.reduce((acc, event) => {
      const prevEventsForTxHash = acc[event.tx_hash] || [];
      return {
        ...acc,
        [event.tx_hash]: [...prevEventsForTxHash, event],
      };
    }, {} as Record<string, MintedNftEvent[]>);

    const txHashes = Object.keys(txHashAndEventsMap);

    for (const txHash of txHashes) {
      const editionUUID = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)();
      const events = txHashAndEventsMap[txHash];

      for (const event of events) {
        const response = await this.httpService.get(event.token_uri).toPromise();
        const artworkType = (response.data.image_url as string).split(/[.]+/);
        const user = await this.userRepository.findOne({ where: { address: event.receiver } });

        if (user) {
          const nft = this.nftRepository.create();
          nft.userId = user.id;
          nft.collectionId = null;
          nft.txHash = txHash;
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
          await this.nftRepository.save(nft);
          event.processed = true;
          await this.createNftEventRepository.save(event);
        }
      }
      await this.savedNftRepository.softDelete({ txHash });
    }

    this.processing = false;
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
