import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
import { filter } from 'rxjs/operators';
import { Multer } from 'multer';
import { plainToClass } from 'class-transformer';
import { GetNftTokenUriBody } from '../entrypoints/dto';
import { validateOrReject } from 'class-validator';
import { ProcessedFile } from '../../file-processing/model/ProcessedFile';

type SaveNftParams = {
  userId: number;
  name: string;
  description?: string;
  numberOfEditions: number;
  properties?: any;
  royalties: number;
};

type EditSavedNftParams = {
  name?: string;
  description?: string;
  numberOfEditions?: number;
  properties?: any;
  royalties?: number;
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
  private logger = new Logger(NftService.name);

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

      const { optimisedFile, downsizedFile } = await this.processUploadedFile(file);

      nft.url = file.filename;
      nft.optimized_url = optimisedFile.fullFilename();
      nft.thumbnail_url = downsizedFile.fullFilename();
      nft.artwork_type = file.mimetype.split('/')[1];

      return await this.savedNftRepository.save(nft);
    } catch (error) {
      this.fileSystemService.removeFile(file.path).catch(() => {});
      throw error;
    }
  }

  private async processUploadedFile(file: Express.Multer.File) {
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

    return { optimisedFile, downsizedFile };
  }

  public async getTokenURI(id: number) {
    const savedNft = await this.savedNftRepository.findOne({ where: { id } });

    if (!savedNft) {
      throw new NftNotFoundException();
    }

    await this.savedNftRepository.delete({ id: savedNft.id });
    const idxs = [...Array(savedNft.numberOfEditions).keys()];
    return await Promise.all(
      idxs.map(async () => {
        const tokenUri = await this.generateTokenUriForSavedNftEdition(savedNft);
        const nft = await this.createNftFromSavedNft(savedNft, tokenUri);
        return nft.token_uri;
      }),
    );
  }

  public async getNftTokenURI(body, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        error: 'NoFileAttached',
        message: 'Please attach a file',
      });
    }
    const bodyClass = plainToClass(GetNftTokenUriBody, { ...body });
    await this.validateGetNftTokenUriBody(bodyClass);

    const { optimisedFile, downsizedFile } = await this.processUploadedFile(file);
    const idxs = [...Array(bodyClass.numberOfEditions).keys()];

    return await Promise.all(
      idxs.map(() => this.generateTokenUriForNftBody(bodyClass, file, optimisedFile, downsizedFile)),
    );
  }

  private async generateTokenUriForNftBody(
    bodyClass: GetNftTokenUriBody,
    file: Express.Multer.File,
    optimisedFile: ProcessedFile,
    downsizedFile: ProcessedFile,
  ) {
    return this.arweaveService.store({
      name: bodyClass.name,
      description: bodyClass.description,
      image_url: this.s3Service.getUrl(file.filename),
      image_preview_url: this.s3Service.getUrl(optimisedFile.fullFilename()),
      image_thumbnail_url: this.s3Service.getUrl(downsizedFile.fullFilename()),
      image_original_url: this.s3Service.getUrl(file.filename),
      traits: bodyClass.properties,
    });
  }

  private async validateGetNftTokenUriBody(bodyClass: GetNftTokenUriBody) {
    try {
      await validateOrReject(bodyClass, { validationError: { target: false } });
    } catch (errors) {
      const error = new BadRequestException({
        error: 'ValidationFailed',
        message: 'Validation failed',
        errors,
      });
      this.logger.error(error);
      throw error;
    }
  }

  public async getSavedNfts(userId: number) {
    const savedNfts = await this.savedNftRepository.find({
      where: {
        userId,
      },
    });

    return savedNfts;
  }

  public async editSavedNft(id: number, userId: number, params: EditSavedNftParams) {
    const savedNft = await this.savedNftRepository.findOne({ where: { id, userId } });

    if (!savedNft) throw new NftNotFoundException();
    const filteredParams = this.filterObjectAttributes(params, [
      'name',
      'description',
      'numberOfEditions',
      'properties',
      'royalties',
    ]);

    for (const param in filteredParams) {
      savedNft[param] = filteredParams[param];
    }

    const updatedEntity = await this.savedNftRepository.save(savedNft);
    return updatedEntity;
  }

  private async createNftFromSavedNft(savedNft: SavedNft, tokenUri: any) {
    const nft = await this.nftRepository.create({
      name: savedNft.name,
      description: savedNft.description,
      token_uri: tokenUri,
      properties: savedNft.properties,
      royalties: savedNft.royalties,
      url: savedNft.url,
      optimized_url: savedNft.optimized_url,
      thumbnail_url: savedNft.thumbnail_url,
      original_url: savedNft.original_url,
      artwork_type: savedNft.artwork_type,
      userId: savedNft.userId,
      editionUUID: savedNft.editionUUID,
    });
    return this.nftRepository.save(nft);
  }

  private async generateTokenUriForSavedNftEdition(savedNft: SavedNft) {
    const tokenUri = await this.arweaveService.store({
      name: savedNft.name,
      description: savedNft.description,
      image_url: this.s3Service.getUrl(savedNft.url),
      image_preview_url: this.s3Service.getUrl(savedNft.optimized_url),
      image_thumbnail_url: this.s3Service.getUrl(savedNft.thumbnail_url),
      image_original_url: this.s3Service.getUrl(savedNft.original_url),
      traits: savedNft.properties,
    });
    return tokenUri;
  }

  private filterObjectAttributes(object: any, keys: string[]) {
    return keys.reduce((acc, key) => {
      return object.hasOwnProperty(key)
        ? {
            ...acc,
            [key]: object[key],
          }
        : acc;
    }, {});
  }
}
