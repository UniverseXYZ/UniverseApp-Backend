import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Nft } from '../domain/nft.entity';
import { Connection, Repository } from 'typeorm';
import { NftCollection } from '../domain/collection.entity';

type SaveNftParams = {
  userId: number;
  name: string;
  description?: string;
  numberOfEditions: number;
  properties?: any;
  royalties: number;
};

type SaveCollectibleParams = {
  name: string;
  description?: string;
  numberOfEditions: number;
  properties?: any;
};

type SaveCollectionParams = {
  name: string;
  tokenName: string;
  userId: number;
  collectibles: SaveCollectibleParams[];
};

@Injectable()
export class NftService {
  constructor(
    @InjectRepository(Nft) private nftRepository: Repository<Nft>,
    @InjectRepository(NftCollection)
      private nftCollectionRepository: Repository<NftCollection>,
    private connection: Connection,
  ) {}

  public async saveForLater(params: SaveNftParams) {
    const nft = this.nftRepository.create(params);
    const savedNft = await this.nftRepository.save(nft);
    const {
      id,
      name,
      description,
      numberOfEditions,
      properties,
      royalties,
      createdAt,
    } = savedNft;

    return {
      id,
      name,
      description,
      numberOfEditions,
      properties,
      royalties,
      createdAt,
    };
  }

  public async saveCollectionForLater(params: SaveCollectionParams) {
    const collectibles = params.collectibles.map((collectible) =>
      this.nftRepository.create({
        ...collectible,
        userId: params.userId,
      }),
    );
    const collection = this.nftCollectionRepository.create({
      name: params.name,
      tokenName: params.tokenName,
      collectibles,
    });

    const dbCollection = await this.nftCollectionRepository.save(collection);

    return {
      id: dbCollection.id,
      name: dbCollection.name,
      tokenName: dbCollection.tokenName,
      collectibles: dbCollection.collectibles.map((collectible) => ({
        id: collectible.id,
        name: collectible.name,
        description: collectible.description,
        numberOfEditions: collectible.numberOfEditions,
        properties: collectible.properties,
        createdAt: collectible.createdAt,
      })),
      createdAt: dbCollection.createdAt,
    }
  }
}
