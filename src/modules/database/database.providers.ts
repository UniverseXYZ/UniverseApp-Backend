import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { AppConfig } from '../configuration/configuration.service';
import { User } from '../users/user.entity';
import { Nft } from '../nft/domain/nft.entity';
import { NftCollection } from '../nft/domain/collection.entity';
import { SavedNft } from '../nft/domain/saved-nft.entity';
import { RewardTier } from '../auction/domain/reward-tier.entity';
import { RewardTierNft } from '../auction/domain/reward-tier-nft.entity';
import { Auction } from '../auction/domain/auction.entity';
import { MintedNftEvent } from '../ethEventsScraper/domain/mintNftEvent';
import { DeployCollectionEvent } from '../ethEventsScraper/domain/deploy-collection-event';
import { MintingCollection } from '../nft/domain/minting-collection.entity';
import { LoginChallenge } from '../auth/model/login-challenge.entity';
import { MintingNft } from '../nft/domain/minting-nft.entity';
import { AuctionBid } from '../auction/domain/auction.bid.entity';
import { MonitoredNfts } from '../nft/domain/monitored-nfts';
import { MoralisLog } from '../moralis/domain/moralis-log.entity';
import { AuctionCreatedEvent } from '../ethEventsScraper/domain/create-auction-event';
import { Erc721DepositedEvent } from '../ethEventsScraper/domain/deposited-erc721-event';
import { AuctionCanceledEvent } from '../ethEventsScraper/domain/auction-canceled-event';

// TODO: Add db entities here
const entities = [
  User,
  Nft,
  NftCollection,
  SavedNft,
  RewardTier,
  RewardTierNft,
  Auction,
  MintedNftEvent,
  DeployCollectionEvent,
  MintingCollection,
  LoginChallenge,
  MintingNft,
  AuctionBid,
  MonitoredNfts,
  MoralisLog,
  AuctionBid,
  AuctionCreatedEvent,
  Erc721DepositedEvent,
  AuctionCanceledEvent,
];

@Injectable()
export class TypeOrmDefaultConfigService implements TypeOrmOptionsFactory {
  constructor(protected readonly config: AppConfig) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      autoLoadEntities: false,
      logging: false,
      entities,
      ...this.config.values.database,
    };
  }
}
