import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, In, Repository } from 'typeorm';
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
import { CreateCollectionBody, GetNftTokenUriBody } from '../entrypoints/dto';
import { validateOrReject } from 'class-validator';
import { ProcessedFile } from '../../file-processing/model/ProcessedFile';
import { UploadResult } from '../../file-storage/model/UploadResult';
import { MintingCollection } from '../domain/minting-collection.entity';
import { MintingCollectionNotFoundException } from './exceptions/MintingCollectionNotFoundException';
import { MintingCollectionBadOwnerException } from './exceptions/MintingCollectionBadOwnerException';
import { SavedNftNotFoundException } from './exceptions/SavedNftNotFoundException';
import { SavedNftOwnerException } from './exceptions/SavedNftOwnerException';
import { User } from '../../users/user.entity';

type SaveNftParams = {
  userId: number;
  name: string;
  description?: string;
  numberOfEditions: number;
  properties?: any;
  royalties: { address: string, amount: number }[];
  collectionId?: number;
};

type EditSavedNftParams = {
  name?: string;
  description?: string;
  numberOfEditions?: number;
  properties?: any;
  royalties: { address: string, amount: number }[];
  txHash?: string;
  collectionId: number;
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

type EditMintingCollectionParams = {
  txHash?: string;
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
    @InjectRepository(MintingCollection)
    private mintingCollectionRepository: Repository<MintingCollection>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private fileProcessingService: FileProcessingService,
    private s3Service: S3Service,
    private arweaveService: ArweaveService,
    private config: AppConfig,
    private fileSystemService: FileSystemService,
  ) {}

  public async saveForLater(params: SaveNftParams) {
    const savedNft = this.savedNftRepository.create({
      name: params.name,
      description: params.description,
      numberOfEditions: params.numberOfEditions,
      properties: params.properties,
      royalties: params.royalties,
      userId: params.userId,
      collectionId: params.collectionId,
    });
    const dbSavedNft = await this.savedNftRepository.save(savedNft);
    const serialized = {
      id: dbSavedNft.id,
      collection: null,
      name: dbSavedNft.name,
      description: dbSavedNft.description,
      properties: dbSavedNft.properties,
      royalties: dbSavedNft.royalties,
      numberOfEditions: dbSavedNft.numberOfEditions,
      createdAt: dbSavedNft.createdAt,
    };

    if (typeof params.collectionId === 'number') {
      const collection = await this.nftCollectionRepository.findOne({ id: params.collectionId });

      if (collection) {
        serialized.collection = {
          id: collection.id,
          name: collection.name,
          symbol: collection.symbol,
          address: collection.address,
          coverUrl: collection.coverUrl,
        };
      }
    }

    return {
      savedNft: { ...serialized },
    };
  }

  // public async saveCollectionForLater(params: SaveCollectionParams) {
  //   const collectibles = params.collectibles.reduce((acc, collectible) => {
  //     return [...acc, ...this.createCollectible(collectible)];
  //   }, []);
  //   const collection = this.nftCollectionRepository.create({
  //     name: params.name,
  //     symbol: params.symbol,
  //     userId: params.userId,
  //     collectibles,
  //   });
  //
  //   const dbCollection = await this.nftCollectionRepository.save(collection);
  //
  //   return {
  //     id: dbCollection.id,
  //     name: dbCollection.name,
  //     symbol: dbCollection.symbol,
  //     collectibles: dbCollection.collectibles.map((collectible) => ({
  //       id: collectible.id,
  //       name: collectible.name,
  //       description: collectible.description,
  //       properties: collectible.properties,
  //       createdAt: collectible.createdAt,
  //     })),
  //     createdAt: dbCollection.createdAt,
  //   };
  // }

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
      nft.original_url = file.filename;
      nft.artworkType = file.mimetype.split('/')[1];

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

    const idxs = [...Array(savedNft.numberOfEditions).keys()];
    const tokenUri = await this.generateTokenUrisForSavedNft(savedNft);
    savedNft.tokenUri = tokenUri;
    await this.savedNftRepository.save(savedNft);
    return idxs.map(() => tokenUri);
  }

  public async getNftTokenURI(body, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        error: 'NoFileAttached',
        message: 'Please attach a file',
      });
    }
    const bodyClass = plainToClass(GetNftTokenUriBody, { ...body });
    await this.validateReqBody(bodyClass);

    const { optimisedFile, downsizedFile } = await this.processUploadedFile(file);
    const idxs = [...Array(bodyClass.numberOfEditions).keys()];
    const tokenUri = await this.generateTokenUriForNftBody(bodyClass, file, optimisedFile, downsizedFile);
    return idxs.map(() => tokenUri);
  }

  public async createCollection(userId: number, body: any, file: Express.Multer.File) {
    const bodyClass = plainToClass(CreateCollectionBody, { ...body });
    await this.validateReqBody(bodyClass);

    let s3Result: UploadResult;
    if (file) {
      s3Result = await this.s3Service.uploadDocument(file.path, file.filename);
    }

    let mintingCollection = this.mintingCollectionRepository.create({
      userId,
      name: bodyClass.name,
      description: bodyClass.description,
      symbol: bodyClass.symbol,
      coverUrl: s3Result.url,
      shortUrl: bodyClass.shortUrl,
    });
    mintingCollection = await this.mintingCollectionRepository.save(mintingCollection);

    return {
      id: mintingCollection.id,
    };
  }

  public async editMintingCollection(userId: number, id: number, params: EditMintingCollectionParams) {
    const mintingCollection = await this.mintingCollectionRepository.findOne({ where: { id } });

    if (!mintingCollection) {
      throw new MintingCollectionNotFoundException();
    }

    if (mintingCollection.userId !== userId) {
      throw new MintingCollectionBadOwnerException();
    }

    const filteredAttributes = this.filterObjectAttributes(params, ['txHash']);
    for (const attribute in filteredAttributes) {
      mintingCollection[attribute] = filteredAttributes[attribute];
    }
    await this.mintingCollectionRepository.save(mintingCollection);
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
      royalties: bodyClass.royalties,
      traits: bodyClass.properties,
    });
  }

  private async validateReqBody(body) {
    try {
      await validateOrReject(body, { validationError: { target: false } });
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
      'txHash',
      'collectionId',
    ]);

    for (const param in filteredParams) {
      savedNft[param] = filteredParams[param];
    }

    const updatedEntity = await this.savedNftRepository.save(savedNft);
    return updatedEntity;
  }

  public async getMyNfts(userId: number) {
    const nfts = await this.nftRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
    const groupedNfts = nfts.reduce((acc, nft) => {
      const previousNfts = acc[nft.editionUUID] || [];
      return {
        ...acc,
        [nft.editionUUID]: [...previousNfts, nft],
      };
    }, {} as Record<string, Nft[]>);
    const collectionIds = Object.keys(nfts.reduce((acc, nft) => ({ ...acc, [nft.collectionId]: true }), {}));
    const collections = await this.nftCollectionRepository.find({ where: { id: In(collectionIds) } });
    const collectionsMap = collections.reduce(
      (acc, collection) => ({ ...acc, [collection.id]: collection }),
      {} as Record<string, NftCollection>,
    );

    return {
      nfts: Object.values(groupedNfts).map((nfts) => {
        const {
          id,
          name,
          original_url,
          thumbnail_url,
          optimized_url,
          url,
          createdAt,
          artworkType,
          collectionId,
        } = nfts[0];
        const tokenIds = nfts.map((nft) => nft.tokenId);
        const collection = collectionsMap[collectionId] && {
          id: collectionsMap[collectionId].id,
          name: collectionsMap[collectionId].name,
          symbol: collectionsMap[collectionId].symbol,
          coverUrl: collectionsMap[collectionId].coverUrl,
        };

        return {
          id,
          name,
          original_url,
          thumbnail_url,
          optimized_url,
          url,
          artworkType,
          tokenIds,
          collection,
          createdAt,
        };
      }),
    };
  }

  public async getMyCollections(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const collections = await this.nftCollectionRepository.find({
      where: { owner: user.address },
    });

    return {
      collections: collections.map((collection) => {
        const { id, address, name, symbol, coverUrl } = collection;
        return { id, address, name, symbol, coverUrl };
      }),
    };
  }

  public async deleteSavedNft(id: number, userId: number) {
    const savedNft = await this.savedNftRepository.findOne({ where: { id } });

    if (!savedNft) {
      throw new SavedNftNotFoundException();
    }

    if (savedNft.userId !== userId) {
      throw new SavedNftOwnerException();
    }

    await this.savedNftRepository.delete({ id });

    return { id };
  }

  private async generateTokenUrisForSavedNft(savedNft: SavedNft) {
    const tokenUri = await this.arweaveService.store({
      name: savedNft.name,
      description: savedNft.description,
      image_url: this.s3Service.getUrl(savedNft.url),
      image_preview_url: this.s3Service.getUrl(savedNft.optimized_url),
      image_thumbnail_url: this.s3Service.getUrl(savedNft.thumbnail_url),
      image_original_url: this.s3Service.getUrl(savedNft.original_url),
      royalties: savedNft.royalties,
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
