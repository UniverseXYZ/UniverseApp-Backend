import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { customAlphabet } from 'nanoid';
import { Nft } from '../domain/nft.entity';
import { NftCollection } from '../domain/collection.entity';
import { NftNotFoundException } from './exceptions/NftNotFoundException';
import { FileProcessingService } from '../../file-processing/file-processing.service';
import { S3Service } from '../../file-storage/s3.service';
import { AppConfig } from '../../configuration/configuration.service';
import { FileSystemService } from '../../file-system/file-system.service';
import { ArweaveService } from '../../file-storage/arweave.service';
import { SavedNft } from '../domain/saved-nft.entity';

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
  symbol: string;
  userId: number;
  collectibles: SaveCollectibleParams[];
};

@Injectable()
export class NftService {
  constructor(
    @InjectRepository(Nft) private nftRepository: Repository<Nft>,
    @InjectRepository(NftCollection)
    private nftCollectionRepository: Repository<NftCollection>,
    @InjectRepository(SavedNft)
    private savedNftRepository: Repository<SavedNft>,
    private fileProcessingService: FileProcessingService,
    private s3Service: S3Service,
    private arweaveService: ArweaveService,
    private config: AppConfig,
    private fileSystemService: FileSystemService,
  ) {}

  public async saveForLater(params: SaveNftParams) {
    const uuid = customAlphabet('1234567890abcdef', 10)();
    const savedNft = this.savedNftRepository.create({
      name: params.name,
      description: params.description,
      numberOfEditions: params.numberOfEditions,
      properties: params.properties,
      royalties: params.royalties,
      userId: params.userId,
      editionUUID: uuid,
    });
    const dbSavedNft = await this.savedNftRepository.save(savedNft);

    return {
      savedNft: {
        id: dbSavedNft.id,
        name: dbSavedNft.name,
        description: dbSavedNft.description,
        properties: dbSavedNft.properties,
        royalties: dbSavedNft.royalties,
        numberOfEditions: dbSavedNft.numberOfEditions,
        createdAt: dbSavedNft.createdAt,
      },
    };
  }

  public async saveCollectionForLater(params: SaveCollectionParams) {
    const collectibles = params.collectibles.reduce((acc, collectible) => {
      return [...acc, ...this.createCollectible(collectible)];
    }, []);
    const collection = this.nftCollectionRepository.create({
      name: params.name,
      symbol: params.symbol,
      userId: params.userId,
      collectibles,
    });

    const dbCollection = await this.nftCollectionRepository.save(collection);

    return {
      id: dbCollection.id,
      name: dbCollection.name,
      symbol: dbCollection.symbol,
      collectibles: dbCollection.collectibles.map((collectible) => ({
        id: collectible.id,
        name: collectible.name,
        description: collectible.description,
        properties: collectible.properties,
        createdAt: collectible.createdAt,
      })),
      createdAt: dbCollection.createdAt,
    };
  }

  private createCollectible(collectible: SaveCollectibleParams) {
    const nfts = [];
    const idxs = [...Array(collectible.numberOfEditions).keys()];

    for (const idx of idxs) {
      nfts.push(this.nftRepository.create(collectible));
    }

    return nfts;
  }

  public async uploadMediaFile(id: number, file: Express.Multer.File) {
    try {
      const nft = await this.savedNftRepository.findOne({ where: { id } });

      if (!nft) {
        throw new NftNotFoundException();
      }

      const optimisedFile = await this.fileProcessingService.optimiseFile(file.path, file.mimetype);
      const downsizedFile = await this.fileProcessingService.downsizeFile(file.path, file.mimetype);
      const uniqueFiles = [optimisedFile, downsizedFile].filter((fileItem) => fileItem.path !== file.path);

      await Promise.all([
        this.s3Service.uploadDocument(file.path, `${file.filename}`),
        ...uniqueFiles.map((fileItem) => this.s3Service.uploadDocument(fileItem.path, `${fileItem.fullFilename()}`)),
      ]);

      await Promise.all(
        [file.path, ...uniqueFiles.map((file) => file.path)].map((path) => this.fileSystemService.removeFile(path)),
      );

      nft.url = file.filename;
      nft.optimized_url = optimisedFile.fullFilename();
      nft.thumbnail_url = downsizedFile.fullFilename();
      nft.artwork_type = file.mimetype.split('/')[1];

      const dbSavedNft = await this.savedNftRepository.save(nft);

      return {
        savedNft: {
          id: dbSavedNft.id,
          name: dbSavedNft.name,
          description: dbSavedNft.description,
          properties: dbSavedNft.properties,
          royalties: dbSavedNft.royalties,
          numberOfEditions: dbSavedNft.numberOfEditions,
          url: dbSavedNft.url,
          optimized_url: dbSavedNft.optimized_url,
          thumbnail_url: dbSavedNft.thumbnail_url,
          artwork_type: dbSavedNft.artwork_type,
          createdAt: dbSavedNft.createdAt,
        },
      };
    } catch (error) {
      this.fileSystemService.removeFile(file.path).finally(() => {});
      throw error;
    }
  }

  public async getTokenURI(id: number) {
    const nft = await this.nftRepository.findOne({ where: { id } });

    if (!nft) {
      throw new NftNotFoundException();
    }

    const tokenUri = await this.arweaveService.store({
      name: nft.name,
      description: nft.description,
      image_url: nft.url,
      image_preview_url: nft.optimized_url,
      image_thumbnail_url: nft.thumbnail_url,
      image_original_url: nft.original_url,
      traits: nft.properties,
    });

    nft.token_uri = tokenUri;
    await this.nftRepository.save(nft);

    return nft.token_uri;
  }
}
