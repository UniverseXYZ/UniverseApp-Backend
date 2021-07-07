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
import { MintedNftEvent } from '../ethEventsScraper/domain/mintNftEvent.entity';
import { DeployCollectionEvent } from '../ethEventsScraper/domain/deploy-collection-event.entity';
import { MintingCollection } from '../nft/domain/minting-collection.entity';
import { LoginChallenge } from '../auth/model/login-challenge.entity';

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
