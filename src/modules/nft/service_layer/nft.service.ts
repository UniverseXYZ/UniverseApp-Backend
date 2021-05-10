import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Nft } from '../domain/nft.entity';
import { Repository } from 'typeorm';

type SaveForLaterParams = {
  userId: number;
  name: string;
  description?: string;
  numberOfEditions: number;
  properties?: any;
  royalties: number;
};

@Injectable()
export class NftService {
  constructor(@InjectRepository(Nft) private nftRepository: Repository<Nft>) {}

  public async saveForLater(params: SaveForLaterParams) {
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
      updatedAt,
    } = savedNft;

    return {
      id,
      name,
      description,
      numberOfEditions,
      properties,
      royalties,
      createdAt,
      updatedAt,
    };
  }
}
