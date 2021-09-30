import { UserNotFoundException } from './../../users/service-layer/exceptions/UserNotFoundException';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Nft } from '../domain/nft.entity';
import { NftCollection } from '../domain/collection.entity';
import { NftNotFoundException } from './exceptions/NftNotFoundException';
import { FileProcessingService } from '../../file-processing/file-processing.service';
import { S3Service } from '../../file-storage/s3.service';
import { AppConfig } from '../../configuration/configuration.service';
import { FileSystemService } from '../../file-system/file-system.service';
import { ArweaveService } from '../../file-storage/arweave.service';
import { SavedNft } from '../domain/saved-nft.entity';
import { classToPlain, plainToClass } from 'class-transformer';
import {
  CreateCollectionBody,
  EditCollectionBody,
  EditMintingCollectionBody,
  EditMintingNftBody,
  GetNftTokenUriBody,
} from '../entrypoints/dto';
import { validateOrReject } from 'class-validator';
import { ProcessedFile } from '../../file-processing/model/ProcessedFile';
import { UploadResult } from '../../file-storage/model/UploadResult';
import { MintingCollection } from '../domain/minting-collection.entity';
import { MintingCollectionNotFoundException } from './exceptions/MintingCollectionNotFoundException';
import { MintingCollectionBadOwnerException } from './exceptions/MintingCollectionBadOwnerException';
import { SavedNftNotFoundException } from './exceptions/SavedNftNotFoundException';
import { SavedNftOwnerException } from './exceptions/SavedNftOwnerException';
import { User } from '../../users/user.entity';
import { UsersService } from 'src/modules/users/users.service';
import { NftCollectionNotFoundException } from './exceptions/NftCollectionNotFoundException';
import { NftCollectionBadOwnerException } from './exceptions/NftCollectionBadOwnerException';
import { RewardTierNft } from 'src/modules/auction/domain/reward-tier-nft.entity';
import { MintingNft } from '../domain/minting-nft.entity';

type SaveNftParams = {
  userId: number;
  name: string;
  description?: string;
  numberOfEditions: number;
  properties?: any;
  royalties: { address: string; amount: number }[];
  collectionId?: number;
};

type EditSavedNftParams = {
  name?: string;
  description?: string;
  numberOfEditions?: number;
  properties?: any;
  royalties: { address: string; amount: number }[];
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
    @InjectRepository(MintingNft)
    private mintingNftRepository: Repository<MintingNft>,
    @InjectRepository(RewardTierNft)
    private rewardTierNftRepository: Repository<RewardTierNft>,
    private usersService: UsersService,
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
    const collection = await this.nftCollectionRepository.findOne({ id: params.collectionId });

    return {
      savedNft: {
        ...classToPlain(dbSavedNft),
        collection: classToPlain(collection),
      },
    };
  }

  public async uploadSavedNftFile(id: number, userId: number, file: Express.Multer.File) {
    try {
      const nft = await this.savedNftRepository.findOne({ where: { id } });

      if (!nft) {
        throw new NftNotFoundException();
      }

      if (nft.userId !== userId) {
        throw new SavedNftOwnerException();
      }

      const { optimisedFile, downsizedFile } = await this.processUploadedFile(file);
      nft.url = this.s3Service.getUrl(file.filename);
      nft.optimizedUrl = this.s3Service.getUrl(optimisedFile.fullFilename());
      nft.thumbnailUrl = this.s3Service.getUrl(downsizedFile.fullFilename());
      nft.originalUrl = this.s3Service.getUrl(file.filename);
      nft.artworkType = file.mimetype.split('/')[1];
      const dbSavedNft = await this.savedNftRepository.save(nft);

      return classToPlain(dbSavedNft);
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

  public async getSavedNftTokenURI(id: number) {
    const savedNft = await this.savedNftRepository.findOne({ where: { id } });

    if (!savedNft) {
      throw new NftNotFoundException();
    }

    const idxs = [...Array(savedNft.numberOfEditions).keys()];
    const tokenUri = await this.generateTokenUri({
      name: savedNft.name,
      description: savedNft.description,
      attributes: savedNft.properties,
      imageUrl: savedNft.url,
      imageOriginalUrl: savedNft.originalUrl,
      imagePreviewUrl: savedNft.optimizedUrl,
      imageThumbnailUrl: savedNft.thumbnailUrl,
      royalties: savedNft.royalties,
    });
    savedNft.tokenUri = tokenUri;
    await this.savedNftRepository.save(savedNft);
    const mintingNft = await this.createMintingNftFromSavedNft(savedNft);

    return {
      mintingNft: {
        id: mintingNft.id,
      },
      tokenUris: idxs.map(() => tokenUri),
    };
  }

  private async createMintingNftFromSavedNft(savedNft: SavedNft) {
    let mintingNft = this.mintingNftRepository.create();
    mintingNft.collectionId = savedNft.collectionId;
    mintingNft.userId = savedNft.userId;
    mintingNft.savedNftId = savedNft.id;
    mintingNft.numberOfEditions = savedNft.numberOfEditions;
    mintingNft.tokenUri = savedNft.tokenUri;
    mintingNft.name = savedNft.name;
    mintingNft.description = savedNft.description;
    mintingNft.artworkType = savedNft.artworkType;
    mintingNft.url = savedNft.name;
    mintingNft.originalUrl = savedNft.originalUrl;
    mintingNft.optimizedUrl = savedNft.optimizedUrl;
    mintingNft.thumbnailUrl = savedNft.thumbnailUrl;
    mintingNft.properties = savedNft.properties;
    mintingNft.royalties = savedNft.royalties;

    mintingNft = await this.mintingNftRepository.save(mintingNft);
    return mintingNft;
  }

  public async getNftTokenURI(userId: number, body, file: Express.Multer.File) {
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
    const tokenUri = await this.generateTokenUri({
      name: bodyClass.name,
      description: bodyClass.description,
      royalties: bodyClass.royalties,
      attributes: bodyClass.properties,
      imageUrl: this.s3Service.getUrl(file.filename),
      imagePreviewUrl: this.s3Service.getUrl(optimisedFile.fullFilename()),
      imageThumbnailUrl: this.s3Service.getUrl(downsizedFile.fullFilename()),
      imageOriginalUrl: this.s3Service.getUrl(file.filename),
    });
    let mintingNft = this.mintingNftRepository.create();
    mintingNft.collectionId = bodyClass.collectionId;
    mintingNft.userId = userId;
    mintingNft.numberOfEditions = bodyClass.numberOfEditions;
    mintingNft.tokenUri = tokenUri;
    mintingNft.name = bodyClass.name;
    mintingNft.description = bodyClass.description;
    mintingNft.artworkType = this.getExtensionFromUrl(this.s3Service.getUrl(file.filename));
    mintingNft.url = this.s3Service.getUrl(file.filename);
    mintingNft.originalUrl = this.s3Service.getUrl(file.filename);
    mintingNft.optimizedUrl = this.s3Service.getUrl(optimisedFile.fullFilename());
    mintingNft.thumbnailUrl = this.s3Service.getUrl(downsizedFile.fullFilename());
    mintingNft.properties = bodyClass.properties;
    mintingNft.royalties = bodyClass.royalties;

    mintingNft = await this.mintingNftRepository.save(mintingNft);

    return {
      mintingNft: {
        id: mintingNft.id,
      },
      tokenUris: idxs.map(() => tokenUri),
    };
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
    });
    mintingCollection = await this.mintingCollectionRepository.save(mintingCollection);

    return {
      id: mintingCollection.id,
    };
  }

  public async editMintingCollection(userId: number, id: number, data: EditMintingCollectionBody) {
    const mintingCollection = await this.mintingCollectionRepository.findOne({ where: { id } });

    if (!mintingCollection) {
      throw new MintingCollectionNotFoundException();
    }

    if (mintingCollection.userId !== userId) {
      throw new MintingCollectionBadOwnerException();
    }

    if (data.txHash) {
      mintingCollection.txHash = data.txHash;
      mintingCollection.txStatus = 'pending';
    }

    await this.mintingCollectionRepository.save(mintingCollection);

    return {
      id: mintingCollection.id,
      txHash: mintingCollection.txHash,
    };
  }

  public async changeCollectionCoverImage(id: number, userId: number, file: Express.Multer.File) {
    const user = await this.usersService.getById(userId, true);
    const collection = await this.nftCollectionRepository.findOne({ where: { id } });

    if (collection.owner !== user.address) {
      throw new NftCollectionBadOwnerException();
    }

    let s3Result: UploadResult;

    if (file) {
      s3Result = await this.s3Service.uploadDocument(file.path, file.filename);
      collection.coverUrl = s3Result.url;
      await this.nftCollectionRepository.save(collection);
    }

    return classToPlain(collection);
  }

  public async changeCollectionBannerImage(id: number, userId: number, file: Express.Multer.File) {
    const user = await this.usersService.getById(userId, true);
    const collection = await this.nftCollectionRepository.findOne({ where: { id } });

    if (collection.owner !== user.address) {
      throw new NftCollectionBadOwnerException();
    }

    let s3Result: UploadResult;

    if (file) {
      s3Result = await this.s3Service.uploadDocument(file.path, file.filename);
      collection.bannerUrl = s3Result.url;
      await this.nftCollectionRepository.save(collection);
    }

    return classToPlain(collection);
  }

  public async editCollection(id: number, userId: number, data: EditCollectionBody) {
    const user = await this.usersService.getById(userId, true);
    const collection = await this.nftCollectionRepository.findOne({ where: { id } });

    if (collection.owner !== user.address) {
      throw new NftCollectionBadOwnerException();
    }

    const filteredAttributes = this.filterObjectAttributes(data, ['description']);
    for (const attribute in filteredAttributes) {
      collection[attribute] = filteredAttributes[attribute];
    }

    await this.nftCollectionRepository.save(collection);
    return classToPlain(collection);
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

  public async editMintingNft(id: number, userId: number, body: EditMintingNftBody) {
    const mintingNft = await this.mintingNftRepository.findOne({ where: { id, userId } });
    if (!mintingNft) throw new NftNotFoundException();

    mintingNft.txHash = body.txHash;
    mintingNft.txStatus = 'pending';
    if (mintingNft.savedNftId) {
      await this.savedNftRepository.delete({ id: mintingNft.savedNftId });
    }
    await this.mintingNftRepository.save(mintingNft);
  }

  public getNftPage = async (collectionAddress: string, tokenId: number, moreNftsCount = 4) => {
    const collection = await this.nftCollectionRepository.findOne({ where: { address: collectionAddress } });
    if (!collection) {
      throw new NftCollectionNotFoundException();
    }
    const nft = await this.nftRepository.findOne({ where: { collectionId: collection.id, id: tokenId } });

    if (!nft) {
      throw new NftNotFoundException();
    }

    const [owner, creator, moreFromCollection] = await Promise.all([
      this.userRepository.findOne({ id: nft.userId }),
      this.userRepository.findOne({ address: collection.creator }),
      this.nftRepository
        .createQueryBuilder('nft')
        .where('nft.editionUUID != :edition', { edition: nft.editionUUID })
        .andWhere('nft.collectionId = :collectionId', { collectionId: collection.id })
        .leftJoinAndSelect(User, 'user', 'user.id = nft.userId')
        .distinctOn(['nft.editionUUID'])
        .take(moreNftsCount)
        .orderBy('nft.editionUUID')
        .getRawMany(),
    ]);

    const mappedNfts = moreFromCollection.map((nft) => this.mapNftWithUserInfo(nft, 'owner'));

    return {
      nft: classToPlain(nft),
      collection: classToPlain(collection),
      creator: classToPlain(creator),
      owner: classToPlain(owner),
      moreFromCollection: classToPlain(mappedNfts),
    };
  };

  private mapNftWithUserInfo = (nft: any, userKey: string) => {
    const mappedNft = {
      nft: {
        id: nft.nft_id,
        collectionId: nft.nft_collectionId,
        source: nft.nft_source,
        txHash: nft.nft_txHash,
        editionUUID: nft.nft_editionUUID,
        name: nft.nft_name,
        description: nft.nft_description,
        tokenId: nft.nft_tokenId,
        artworkType: nft.nft_artworkType,
        url: nft.nft_url,
        optimized_url: nft.nft_optimized_url,
        thumbnail_url: nft.nft_thumbnail_url,
        original_url: nft.nft_original_url,
        tokenUri: nft.nft_tokenUri,
        properties: nft.nft_properties,
        royalties: nft.nft_royalties,
        numberOfEditions: nft.nft_numberOfEditions,
        refreshed: nft.nft_refreshed,
        createdAt: nft.nft_createdAt,
        updatedAt: nft.nft_updatedAt,
      },
    };
    mappedNft[userKey] = {
      id: nft.user_id,
      address: nft.user_address,
      profileImageUrl: `${this.config.values.aws.s3BaseUrl}/${nft.user_profileImageName}`,
      logoImageName: nft.user_logoImageName,
      displayName: nft.user_displayName,
      universePageUrl: nft.user_universePageUrl,
      about: nft.user_about,
      instagramUser: nft.user_instagramUser,
      twitterUser: nft.user_twitterUser,
    };
    return mappedNft;
  };

  private mapNftWithUserInfo = (nft: any, userKey: string) => {
    const mappedNft = {
      nft: {
        id: nft.nft_id,
        collectionId: nft.nft_collectionId,
        source: nft.nft_source,
        txHash: nft.nft_txHash,
        editionUUID: nft.nft_editionUUID,
        name: nft.nft_name,
        description: nft.nft_description,
        tokenId: nft.nft_tokenId,
        artworkType: nft.nft_artworkType,
        url: nft.nft_url,
        optimized_url: nft.nft_optimized_url,
        thumbnail_url: nft.nft_thumbnail_url,
        original_url: nft.nft_original_url,
        tokenUri: nft.nft_tokenUri,
        properties: nft.nft_properties,
        royalties: nft.nft_royalties,
        numberOfEditions: nft.nft_numberOfEditions,
        refreshed: nft.nft_refreshed,
        createdAt: nft.nft_createdAt,
        updatedAt: nft.nft_updatedAt,
      },
    };
    mappedNft[userKey] = {
      id: nft.user_id,
      address: nft.user_address,
      profileImageUrl: `${this.config.values.aws.s3BaseUrl}/${nft.user_profileImageName}`,
      logoImageName: nft.user_logoImageName,
      displayName: nft.user_displayName,
      universePageUrl: nft.user_universePageUrl,
      about: nft.user_about,
      instagramUser: nft.user_instagramUser,
      twitterUser: nft.user_twitterUser,
    };
    return mappedNft;
  };

  /**
   * This function returns an array of NFTs grouped by edition.
   * The NFTs are reduced to a single object, but differentiating attributes are reduced into a new one (eg. tokenIds)
   */
  private async reduceNftsByEdition(userId: number) {
    const [nfts, owner] = await Promise.all([
      this.nftRepository.find({ where: { userId: userId }, order: { createdAt: 'DESC' } }),
      this.userRepository.findOne({ where: { id: userId } }),
    ]);

    const editionNFTsMap = this.groupNftsByEdition(nfts);
    const collectionIds = Object.keys(nfts.reduce((acc, nft) => ({ ...acc, [nft.collectionId]: true }), {}));
    const collections = await this.nftCollectionRepository.find({ where: { id: In(collectionIds) } });

    const collectionsMap: Record<string, NftCollection> = collections.reduce(
      (acc, collection) => ({ ...acc, [collection.id]: collection }),
      {},
    );

    return {
      nfts: Object.values(editionNFTsMap).map((nfts) => {
        const tokenIds = nfts.map((nft) => nft.tokenId);
        const collection = collectionsMap[nfts[0].collectionId] && classToPlain(collectionsMap[nfts[0].collectionId]);

        return {
          ...classToPlain(nfts[0]),
          collection,
          tokenIds,
          owner: classToPlain(owner),
        };
      }),
    };
  }

  public async getMyNfts(userId: number) {
    return this.reduceNftsByEdition(userId);
  }

  public async getUserNfts(username: string) {
    const user = await this.userRepository.findOne({ where: { universePageUrl: username } });

    if (!user) {
      throw new UserNotFoundException();
    }

    return this.reduceNftsByEdition(user.id);
  }

  public async getMyNftsAvailability(userId: number) {
    const nfts = await this.nftRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
    const nftsIds = nfts.map((nft) => nft.id);
    const editionNFTsMap = this.groupNftsByEdition(nfts);
    const collectionIds = Object.keys(nfts.reduce((acc, nft) => ({ ...acc, [nft.collectionId]: true }), {}));
    const collections = await this.nftCollectionRepository.find({ where: { id: In(collectionIds) } });
    const collectionsMap: Record<string, NftCollection> = collections.reduce(
      (acc, collection) => ({ ...acc, [collection.id]: collection }),
      {},
    );
    const rewardTiers = await this.rewardTierNftRepository.find({ where: { nftId: In(nftsIds) } });
    const nftRewardTierIdMap = rewardTiers.reduce((acc, rewardTier) => ({ ...acc, [rewardTier.nftId]: rewardTier.id }));

    const mappedNfts = Object.values(editionNFTsMap).map((nfts) => {
      return {
        nfts: nfts.map((nft) => ({ ...classToPlain(nft), rewardTierId: nftRewardTierIdMap[nft.id] })),
        collection: nfts.length > 0 && classToPlain(collectionsMap[nfts[0].collectionId]),
      };
    });

    return {
      nfts: mappedNfts,
    };
  }

  public async getMyCollections(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const collections = await this.nftCollectionRepository.find({
      where: { owner: user.address },
    });

    return {
      collections: collections.map((collection) => classToPlain(collection)),
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

  public async getCollectionPage(address: string) {
    const collection = await this.nftCollectionRepository.findOne({ where: { address } });

    if (!collection) {
      throw new NftCollectionNotFoundException();
    }

    const nfts = await this.nftRepository.find({
      where: { collectionId: collection.id },
      order: { createdAt: 'DESC' },
    });
    const editionNFTsMap: Record<string, Nft[]> = this.groupNftsByEdition(nfts);
    let formattedNfts = [];

    if (Object.keys(editionNFTsMap).length > 0) {
      formattedNfts = Object.values(editionNFTsMap).map((nfts) => ({
        ...classToPlain(nfts[0]),
        tokenIds: nfts.map((nft) => nft.tokenId),
      }));
    }

    return {
      collection: classToPlain(collection),
      nfts: formattedNfts,
    };
  }

  public async getMyNftsPage(userId: number) {
    const mintedNfts = await this.reduceNftsByEdition(userId);

    return {
      nfts: mintedNfts.nfts,
      pagination: {},
    };
  }

  public async getMyNftsPendingPage(userId) {
    const mintingNfts = await this.mintingNftRepository.find({
      where: { userId, txStatus: 'pending' },
      order: { createdAt: 'DESC' },
    });
    const collectionIds = mintingNfts.map((nft) => nft.collectionId);
    const uniqueCollectionIds = new Set(collectionIds);
    const collections = await this.nftCollectionRepository.find({ where: { id: In(Array.from(uniqueCollectionIds)) } });
    const idCollectionMap = collections.reduce((acc, collection) => ({ ...acc, [collection.id]: collection }), {});

    return {
      mintingNfts: mintingNfts.map((nft) => ({
        ...classToPlain(nft),
        collection: classToPlain(idCollectionMap[nft.collectionId]),
      })),
      pagination: {},
    };
  }

  private groupNftsByEdition(nfts: Nft[]): Record<string, Nft[]> {
    return nfts.reduce((acc, nft) => ({ ...acc, [nft.editionUUID]: [...(acc[nft.editionUUID] || []), nft] }), {});
  }

  private async generateTokenUri({
    name,
    description,
    imageUrl,
    imagePreviewUrl,
    imageThumbnailUrl,
    imageOriginalUrl,
    royalties,
    attributes,
  }) {
    const tokenUri: string = await this.arweaveService.store({
      name,
      description,
      image_url: imageUrl,
      image_preview_url: imagePreviewUrl,
      image_thumbnail_url: imageThumbnailUrl,
      image_original_url: imageOriginalUrl,
      royalties: royalties,
      attributes: attributes?.map((propertyItem) => ({
        trait_type: Object.keys(propertyItem)[0],
        value: Object.values(propertyItem)[0],
      })),
    });
    return tokenUri;
  }

  public async getMyCollectionsPendingPage(userId: number) {
    const mintingCollections = await this.mintingCollectionRepository.find({
      where: { userId, txStatus: 'pending' },
      order: { createdAt: 'DESC' },
    });

    return {
      collections: mintingCollections.map((mintingCollection) => classToPlain(mintingCollection)),
      // TODO: Future object which will container pagination information
      pagination: {},
    };
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

  private getExtensionFromUrl(url: string) {
    if (!url) {
      return undefined;
    }
    const urlComponents = url.split(/[.]+/);
    return urlComponents[urlComponents.length - 1];
  }
}
