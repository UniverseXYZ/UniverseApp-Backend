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
import { CreateNftEvent } from '../domain/createNftEvent.entity';

@Injectable()
export class EthEventsScraperService {
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
        @InjectRepository(CreateCollectionEvent)
        private createCollectionEventRepository: Repository<CreateCollectionEvent>,
        @InjectRepository(CreateNftEvent)
        private createNftEventRepository: Repository<CreateNftEvent>,
    ) {

    }

    //    @Cron(CronExpression.EVERY_DAY_AT_10PM)
    async syncCreateCollectionEvents() {
        const pendingNftCollections = await this.nftCollectionRepository.find({ where: { onChain: false } });
        const nftCollectionsToCheck = {};
        const txHashesToCheck = [];

        for (const pendingNftCollection of pendingNftCollections) {
            nftCollectionsToCheck[pendingNftCollection.txHash] = pendingNftCollection;
            txHashesToCheck.push(pendingNftCollection.txHash);
        }

        const createCollectionEvents = await this.createCollectionEventRepository.find({
            where: {
                tx_hash: In(txHashesToCheck)
            }
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

    async syncCreateNftEvents() {
        const pendingNfts = await this.nftRepository.find({ where: { onChain: false } });
        const nftsToCheck = {};
        const txHashesToCheck = [];

        for (const pendingNft of pendingNfts) {
            if (!nftsToCheck[pendingNft.txHash]) {
                nftsToCheck[pendingNft.txHash] = {}
            }
            nftsToCheck[pendingNft.txHash][pendingNft.token_uri] = pendingNft;
            if (txHashesToCheck.indexOf(pendingNft.txHash) === -1) {
                txHashesToCheck.push(pendingNft.txHash);
            }
        }

        const createNftEvents = await this.createNftEventRepository.find({
            where: {
                tx_hash: In(txHashesToCheck)
            }
        });

        for (const createNftEvent of createNftEvents) {
            if (nftsToCheck[createNftEvent.tx_hash][createNftEvent.token_uri]) {
                const nftToUpdate: Nft = nftsToCheck[createNftEvent.tx_hash][createNftEvent.token_uri];
                nftToUpdate.tokenId = `${createNftEvent.token_id}`; //id should be number?
                nftToUpdate.onChain = true;

                await this.nftRepository.save(nftToUpdate);
            }
        }
    }
}
