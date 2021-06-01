import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Nft } from '../domain/nft.entity';
import { Connection, Repository } from 'typeorm';
import { NftCollection } from '../domain/collection.entity';
import { NftNotFoundException } from './exceptions/NftNotFoundException';
import { FileProcessingService } from '../../file-processing/file-processing.service';
import { S3Service } from '../../s3/s3.service';
import { AppConfig } from '../../configuration/configuration.service';
import { FileSystemService } from '../../file-system/file-system.service';

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
    private fileProcessingService: FileProcessingService,
    private s3Service: S3Service,
    private config: AppConfig,
    private fileSystemService: FileSystemService,
  ) {}

  public async saveForLater(params: SaveNftParams) {
    const nft = this.nftRepository.create(params);
    const savedNft = await this.nftRepository.save(nft);
    const { id, name, description, properties, royalties, createdAt } = savedNft;

    return {
      id,
      name,
      description,
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

  public async uploadMediaFile(id: number, file: Express.Multer.File) {
    try {
      const nft = await this.nftRepository.findOne({ where: { id } });

      if (!nft) {
        throw new NftNotFoundException();
      }

      const optimisedFile = await this.fileProcessingService.optimiseFile(file.path, file.mimetype);
      const downsizedFile = await this.fileProcessingService.downsizeFile(file.path, file.mimetype);
      const uniqueFiles = [optimisedFile, downsizedFile].filter((fileItem) => fileItem.path !== file.path);

      await Promise.all([
        this.s3Service.uploadDocument(file.path, `${this.config.values.aws.pathPrefix}/nfts/${file.filename}`),
        ...uniqueFiles.map((fileItem) =>
          this.s3Service.uploadDocument(
            fileItem.path,
            `${this.config.values.aws.pathPrefix}/nfts/${fileItem.fullFilename()}`,
          ),
        ),
      ]);

      await Promise.all(
        [file.path, ...uniqueFiles.map((file) => file.path)].map((path) => this.fileSystemService.removeFile(path)),
      );

      nft.original_url = file.filename;
      nft.optimized_url = optimisedFile.fullFilename();
      nft.thumbnail_url = downsizedFile.fullFilename();

      await this.nftRepository.save(nft);
    } catch (error) {
      throw error;
      this.fileSystemService.removeFile(file.path);
    }
  }
}
