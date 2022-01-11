import { UserNotFoundException } from './../../users/service-layer/exceptions/UserNotFoundException';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Nft } from '../domain/nft.entity';
import { NftCollection } from '../domain/collection.entity';
import { NftFile } from '../domain/nft-file.entity';
import { NftNotFoundException } from './exceptions/NftNotFoundException';
import { NftNoAssetException } from './exceptions/NftNoAssetException';
import { NftIPFSUploadException } from './exceptions/NftIPFSUploadException';
import { FileProcessingService } from '../../file-processing/file-processing.service';
import { S3Service } from '../../file-storage/s3.service';
import { AppConfig } from '../../configuration/configuration.service';
import { FileSystemService } from '../../file-system/file-system.service';
import { ArweaveService } from '../../file-storage/arweave.service';
import { FleekService } from '../../file-storage/fleek.service';
// import { SavedNft } from '../domain/saved-nft.entity';
import { classToPlain, plainToClass } from 'class-transformer';
import {
  CreateCollectionBody,
  UpdateCollectionBody,
  EditMintingCollectionBody,
  EditMintingNftBody,
  GetNftTokenUriBody,
} from '../entrypoints/dto';
import { validateOrReject } from 'class-validator';
import { UploadResult } from '../../file-storage/model/UploadResult';
// import { MintingCollection } from '../domain/minting-collection.entity';
import { MintingCollectionNotFoundException } from './exceptions/MintingCollectionNotFoundException';
import { MintingCollectionBadOwnerException } from './exceptions/MintingCollectionBadOwnerException';
import { SavedNftNotFoundException } from './exceptions/SavedNftNotFoundException';
import { SavedNftOwnerException } from './exceptions/SavedNftOwnerException';
import { User } from '../../users/user.entity';
import { UsersService } from 'src/modules/users/users.service';
import { NftCollectionNotFoundException } from './exceptions/NftCollectionNotFoundException';
import { NftCollectionBadOwnerException } from './exceptions/NftCollectionBadOwnerException';
import { RewardTierNft } from 'src/modules/auction/domain/reward-tier-nft.entity';
// import { MintingNft } from '../domain/minting-nft.entity';
import { constants } from '../../../common/constants';
import {
  MetadataStorageEnum, 
  NftCollectionStatusEnum, 
  NftStatusEnum 
} from '../../../common/constants/enums';
import { promises as fs } from 'fs';

type CreateNftParams = {
  userId: number;
  name: string;
  description?: string;
  numberOfEditions: number;
  properties?: any;
  royalties: { address: string; amount: number }[];
  collectionId: number;
  metadataStorage: MetadataStorageEnum;
  licenseUri?: string;
};

type UpdateNftParams = {
  name?: string;
  description?: string;
  numberOfEditions?: number;
  properties?: any;
  royalties: { address: string; amount: number }[];
  // txHash?: string;
  collectionId: number;
};

type UploadNftFileParams = {
  order: number;
  name?: string;
  description?: string;
}

type GetNftsParams = {
  userId: number;
  status: NftStatusEnum;
}

type NftAdditionalData = {
  collection: boolean;
  owner: boolean;
  creator: boolean;
};

type NftPrefetchData = {
  owner?: User;
  creator?: User;
};


@Injectable()
export class NftService {
  private logger = new Logger(NftService.name);

  constructor(
    @InjectRepository(Nft) 
    private nftRepository: Repository<Nft>,
    @InjectRepository(NftCollection)
    private nftCollectionRepository: Repository<NftCollection>,
    // @InjectRepository(MintingCollection)
    // private mintingCollectionRepository: Repository<MintingCollection>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RewardTierNft)
    private rewardTierNftRepository: Repository<RewardTierNft>,
    @InjectRepository(NftFile)
    private nftFileRepository: Repository<NftFile>,
    private usersService: UsersService,
    private fileProcessingService: FileProcessingService,
    private s3Service: S3Service,
    private arweaveService: ArweaveService,
    private fleekService: FleekService,
    private config: AppConfig,
    private fileSystemService: FileSystemService,
  ) {}

  /**
   * Creates an entry in the nft table.
   * This methid creates an nft with the "saved" status.
   * @param params
   * @returns {Object}
   * @throws {NftCollectionBadOwnerException}
   */
  public async createNft(params: CreateNftParams) {
    const collection = await this.nftCollectionRepository.findOne({
      id: params.collectionId,
    });
    if(!collection) {
      throw new NftCollectionNotFoundException();
    }
    
    const userOwnsCollection = await this.userOwnsCollection(params.userId, params.collectionId);
    if (!userOwnsCollection) {
      this.logger.error(`User id ${params.userId} tried to create an NFT with collection id ${params.collectionId} which they do not own!`);
      throw new NftCollectionBadOwnerException();
    }

// no support for  mint to other wallet!!??

    let newNft = this.nftRepository.create({
      name: params.name,
      description: params.description,
      numberOfEditions: params.numberOfEditions,
      properties: params.properties,
      royalties: params.royalties,
      userId: params.userId,
      collectionId: params.collectionId,
    });
    newNft = await this.nftRepository.save(newNft);

    return {
      ...classToPlain(newNft),
      collection: classToPlain(collection),
    };
  }

  /**
   * Updates an existing entry in the nft table
   * @param id 
   * @param userId 
   * @param params 
   * @returns {Object}
   * @throws {NftNotFoundException|NftCollectionBadOwnerException}
   */
  public async updateNft(id: number, userId: number, params: UpdateNftParams) {
    const existingNft = await this.nftRepository.findOne({
        where: { 
            id: id, 
            userId: userId, // never remove this check!
            status: NftStatusEnum.SAVED, // only allowing to update saved nfts.
        } 
    });

    if (!existingNft) {
      throw new NftNotFoundException();
    }

    if(params.hasOwnProperty('collectionId') && params.collectionId) {
        const userOwnsCollection = await this.userOwnsCollection(userId, params.collectionId);
        if(!userOwnsCollection) {
          this.logger.error(`User id ${userId} tried to update an NFT id ${id} with collection id ${params.collectionId} which they do not own!`);
          throw new NftCollectionBadOwnerException();
        }
    }

    const filteredParams = this.filterObjectAttributes(params, [
      'name',
      'description',
      'numberOfEditions',
      'properties',
      'royalties',
      'collectionId',
      'metadataStorage',
      'licenseUri'
    ]);

    for (const param in filteredParams) {
        existingNft[param] = filteredParams[param];
    }

    const updatedNft = await this.nftRepository.save(existingNft);
    return updatedNft;
  }

  /**
   * Creates an entry in the nft_file table for the uploaded NFT file.
   * Also creates the optimized version and the thumbnail.
   * The file and its versions are uploaded to S3.
   * This method does not allow replacing existing files.
   * In case of an exception - removes the file being uploaded from S3.
   * @param nftId 
   * @param userId 
   * @param params - params.order - the order of the file for sorting.
   * @param file 
   * @returns {Object}
   * @throws {BadRequestException|NftNotFoundException}
   */
  public async uploadNftFile(nftId: number, userId: number, params: UploadNftFileParams, file: Express.Multer.File) {
    //file may be undefined here and this check must be outside of the try catch block
    if (!file) {
      throw new BadRequestException({
        error: 'NoFileAttached',
        message: 'Please attach a file',
      });
    }

    try {
      const order = Math.floor(params.order);
      if(order <= 0) {
        throw new BadRequestException({
          error: 'Wrong order',
          message: 'Order has to be a positive integer.',
        });
      }
      const existingNft = await this.nftRepository.findOne({
        where: {
          id: nftId,
          userId: userId,
          status: NftStatusEnum.SAVED, // only allowing to update saved nfts.
        },
        relations: [
          'files',
        ]
      });
      if(!existingNft) {
        this.logger.error(`user id ${userId} tried to upload a file to a NFT id ${nftId} which they do not own or the NFT does not exist!`);
        throw new NftNotFoundException();
      }
      //If a file for certain NFT with certain order already exists, then we need to
      //delete that file first. and it has to be done via a separate api call so that users
      //explicitly know what is going on. we can't implicitly remove content here.
      for(const existingFile of existingNft.files) {
        if(order == existingFile.order) {
          throw new BadRequestException({
            error: 'OrderAlreadyTaken',
            message: 'A file with this order number already exists.',
          });
        }
      }

      const {
        optimisedFile, 
        downsizedFile, 
        // arweaveUrl,
        // ipfsData,
      } = await this.processUploadedFile(file);
      let newFile = this.nftFileRepository.create();
      newFile.nft = existingNft;
      newFile.order = order;
      newFile.name = params.name;
      newFile.description = params.description;
      newFile.url = this.s3Service.getUrl(file.filename);
      newFile.optimizedUrl = this.s3Service.getUrl(optimisedFile.fullFilename());
      newFile.thumbnailUrl = this.s3Service.getUrl(downsizedFile.fullFilename());
      // newFile.originalUrl = arweaveUrl;
      newFile.type = file.mimetype.split('/')[1];
      // newFile.ipfs = ipfsData;
      //savedNft.ipfsHash = ipfsData.hash;
      newFile = await this.nftFileRepository.save(newFile);

      return classToPlain(newFile);
    } catch(e) {
      //async call is ok here
      this.fileSystemService.removeFile(file.path).catch(() => {});
      throw e;
    }
  }

  /**
   * Deletes an nfts with status = saved (i.e. not minting or minted).
   * Also deletes related files from the nft_file table.
   * @param nftId 
   * @param userId 
   * @returns {Object} { id } - id of the deleted nft
   * @throws {BadRequestException}
   */
  public async deleteSavedNft(nftId, userId) {
    const existingNft = await this.nftRepository.findOne({
      where: {
        id: nftId,
        userId: userId,
        status: NftStatusEnum.SAVED,
      },
      relations: [
        'files',
      ]
    });
    if(!existingNft) {
      throw new NftNotFoundException();
    }

    try {
      //delete connected files first!
      for(const file of existingNft.files) {
        await this.deleteNftFile(file);
      }

      //no need to do anything with nft_transaction as this function only deletes SAVED nfts
      //and even there's an existing transaction, the relation woudl not allow deleting 
      //this nfts and this method would throw an exception.

      await this.nftRepository.delete({
        id: nftId,
      });
      return { nftId }

    } catch(e) {
      this.logger.error(`Error deleting saved nft: ${e}`);
      throw new BadRequestException({
        error: 'ErrorDeletingNft',
        message: 'Unknown error.',
      });
    }
  }

  /**
   * Returns array of nfts from the nft table filtered by params.
   * @param params 
   * @returns {Nft[]}
   */
  public async getNfts(params: GetNftsParams) {
    const nfts = await this.nftRepository.find({
      where: {
        userId: params.userId,
        status: params.status,
      },
      relations: [
        'files',
      ]
    });

    return nfts;
  }

  /**
   * Returns user's minted nfts.
   * @param userId 
   * @returns {Object}
   */
  public async getMintedNftsByUserId(userId: number) {
    const additionalData: NftAdditionalData = {
      collection: false,
      owner: false,
      creator: true,
    };

    return await this.reduceUserNftsByEdition(userId, additionalData);
  }

  /**
   * Returns user's minted nfts by wallet address.
   * @param walletAddress 
   * @returns {Object}
   */
  public async getNftsByUserWalletAddress(walletAddress: string) {
    const user = await this.userRepository.findOne({ 
      where: [
        { universePageUrl: walletAddress }, 
        { address: walletAddress }
      ] 
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    const additionalData: NftAdditionalData = {
      collection: false,
      owner: true,
      creator: true,
    };

    const prefetchData: NftPrefetchData = {
      owner: user,
    };

    return this.reduceUserNftsByEdition(user.id, additionalData, prefetchData);
  }

  /**
   * This method is mostly unchanged and not revised,
   * however it does need hard refactoring!
   * Especially the sql queries.
   * @param address - Nft collection address
   * @param name 
   * @param offset 
   * @param limit 
   * @returns 
   */
  public async getCollectionPage(address: string, name = '', offset = 0, limit = 8) {
    const collection = await this.nftCollectionRepository.findOne({
      where: { 
        address: address,
        status: NftCollectionStatusEnum.DEPLOYED,
      } 
    });
    if (!collection) {
      throw new NftCollectionNotFoundException();
    }

    const editionsCount = parseInt(
      (
        await this.nftRepository.query(
          `SELECT COUNT(DISTINCT "editionUUID") 
          FROM "universe-backend"."nft" 
          WHERE "nft"."collectionId" = $1 AND
            "nft"."status" = '${NftStatusEnum.MINTED}'`,
          [collection.id],
        )
      )[0].count,
    );

    const conditions =
      `nft.editionUUID IN (
        SELECT DISTINCT("nft"."editionUUID") 
        FROM (
          SELECT "editionUUID", "id" 
          FROM "universe-backend"."nft" as "nft" 
          WHERE "nft"."collectionId" = :collectionId AND
            "nft"."status" = '${NftStatusEnum.MINTED}'
          ORDER BY "nft"."id" DESC
        ) AS "nft" LIMIT :limit OFFSET :offset
      )`;

    const query = this.nftRepository
      .createQueryBuilder('nft')
      .leftJoinAndMapOne('nft.owner', User, 'owner', 'owner.id = nft.userId')
      .leftJoinAndMapOne('nft.creator', User, 'creator', 'creator.address = nft.creator')
      .where(conditions, { collectionId: collection.id, limit: limit, offset: offset })
      .orderBy('nft.createdAt', 'DESC');

    if (name) {
      query.andWhere('LOWER("nft"."name") LIKE :name', { name: `%${name}%` });
    }

    const nfts = await query.getMany();

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
      pagination: {
        totalCount: editionsCount,
        page: Math.ceil(offset / limit + 1),
        hasNextPage: editionsCount > offset + limit,
        totalPages: Math.ceil(editionsCount / limit),
      },
    };
  }

  public async getMyNftsPage(userId: number) {
    const additionaData: NftAdditionalData = {
      collection: false,
      owner: false,
      creator: true,
    };
    const mintedNfts = await this.reduceUserNftsByEdition(userId, additionaData);

    return {
      nfts: mintedNfts.nfts,
      pagination: {},
    };
  }

  public async getMyCollectionsPendingPage(userId: number) {
    const deployingCollections = await this.nftCollectionRepository.find({
      where: { 
        userId: userId,
        status: NftCollectionStatusEnum.DEPLOYING, 
        // txStatus: 'pending' 
      },
      order: { 
        createdAt: 'DESC' 
      },
    });

    return {
      collections: deployingCollections.map((mintingCollection) => classToPlain(mintingCollection)),
      // TODO: Future object which will container pagination information
      pagination: {},
    };
  }

  public async getMyCollectionsPendingCount(userId: number) {
    const deployingCollectionCount = await this.nftCollectionRepository
      .createQueryBuilder('collection')
      .where('collection.userId = :userId', { 
        userId: userId 
      })
      .andWhere('collection.status = :collectionStatus', { 
        collectionStatus: NftCollectionStatusEnum.DEPLOYING 
      })
      // .andWhere('collection.txStatus = :txStatus', { txStatus: 'pending' })
      .getCount();

    return {
      count: deployingCollectionCount,
    };
  }

  public async getMyNftsPendingPage(userId) {
    const mintingNfts = await this.nftRepository.find({
      where: { 
        userId: userId, 
        status: NftStatusEnum.MINTING,
        // txStatus: 'pending' 
      },
      order: { 
        createdAt: 'DESC' 
      },
    });
    const collectionIds = mintingNfts.map((nft) => nft.collectionId);
    const uniqueCollectionIds = new Set(collectionIds);
    const collections = await this.nftCollectionRepository.find({ 
      where: { 
        id: In(Array.from(uniqueCollectionIds)) 
      } 
    });
    const idCollectionMap = collections.reduce((acc, collection) => ({ 
      ...acc, 
      [collection.id]: collection 
    }), {});

    return {
      mintingNfts: mintingNfts.map((nft) => ({
        ...classToPlain(nft),
        collection: classToPlain(idCollectionMap[nft.collectionId]),
      })),
      pagination: {},
    };
  }

  public async getMyNftsPendingCount(userId: number) {
    const mintingNftCount = await this.nftRepository
      .createQueryBuilder('nft')
      .where('nft.userId = :userId', { 
        userId: userId 
      })
      .andWhere('nft.status = :nftStatus', { 
        nftStatus: NftStatusEnum.MINTING,
      })
      // .andWhere('nft.txStatus = :txStatus', { txStatus: 'pending' })
      .getCount();

    return {
      count: mintingNftCount,
    };
  }

  public getNftPage = async (collectionAddress: string, tokenId: number, moreNftsCount = 4) => {
    const collection = await this.nftCollectionRepository.findOne({ 
      where: { 
        address: collectionAddress,
        status: NftCollectionStatusEnum.DEPLOYED, // just in case
      } 
    });
    if (!collection) {
      throw new NftCollectionNotFoundException();
    }

    const nft = await this.nftRepository.findOne({ 
      where: { 
        collectionId: collection.id, 
        tokenId: tokenId,
        status: NftCollectionStatusEnum.DEPLOYED, // just in case
      } 
    });
    if (!nft) {
      throw new NftNotFoundException();
    }

    const [owner, creator, moreFromCollection, tokenIds] = await Promise.all([
      this.userRepository.findOne({ id: nft.userId }),
      this.userRepository.findOne({ address: nft.creator?.toLowerCase() }),
      this.nftRepository
        .createQueryBuilder('nft')
        .where('nft.editionUUID != :edition', { 
          edition: nft.editionUUID 
        })
        .andWhere('nft.collectionId = :collectionId', { 
          collectionId: collection.id 
        })
        .andWhere('nft.status = :nftStatus', { 
          nftStatus: NftStatusEnum.MINTED 
        })
        .leftJoinAndMapOne('nft.owner', User, 'owner', 'owner.id = nft.userId')
        .leftJoinAndMapOne('nft.creator', User, 'creator', 'creator.address = nft.creator')
        .distinctOn(['nft.editionUUID'])
        .take(moreNftsCount)
        .orderBy('nft.editionUUID')
        .getMany(),
      this.nftRepository.find({
        where: { editionUUID: nft.editionUUID },
        select: ['tokenId'],
        order: { tokenId: 'ASC' },
      }),
    ]);
    return {
      nft: classToPlain(nft),
      collection: classToPlain(collection),
      creator: classToPlain(creator),
      owner: classToPlain(owner),
      moreFromCollection: classToPlain(moreFromCollection),
      tokenIds: tokenIds.map((obj) => obj.tokenId),
    };
  };

  /**
   * This method is mostly unchanged and not revised,
   * however it does need hard refactoring!
   * Especially the sql queries.
   * @param userId 
   * @param start 
   * @param limit 
   * @param size 
   * @param auctionId 
   * @returns 
   */
  public async getMyNftsAvailability(userId: number, start = 0, limit = 8, size = 0, auctionId = 0) {
    const editionsCount = parseInt(
      (
        await this.nftRepository.query(
          'WITH editions AS ' +
            '(SELECT "editionUUID" FROM "universe-backend"."nft" WHERE nft.status = \'minted\' AND "userId" = $1 AND nft.id NOT IN (SELECT "nftId" FROM "universe-backend"."reward_tier_nft" WHERE "rewardTierId" IN (SELECT "id" FROM "universe-backend"."reward_tier" WHERE "userId" = $2 ' +
            (auctionId ? 'AND "auctionId" != $3' : '') +
            ')) GROUP BY "editionUUID" HAVING COUNT(*) >= ' +
            (auctionId ? '$4' : '$3') +
            ')' +
            'SELECT count(*) FROM editions',
          auctionId ? [userId, userId, auctionId, size] : [userId, userId, size],
        )
      )[0].count,
    );

    const nfts = await this.nftRepository
      .createQueryBuilder('nft')
      .where(
        'nft.editionUUID IN (SELECT "editionUUID" FROM "universe-backend"."nft" WHERE nft.status = \'minted\' AND "userId" = :userId AND nft.id NOT IN (SELECT "nftId" FROM "universe-backend"."reward_tier_nft" WHERE "rewardTierId" IN (SELECT "id" FROM "universe-backend"."reward_tier" WHERE "userId" = :userId ' +
          (auctionId ? 'AND "auctionId" != :auctionId' : '') +
          ')) GROUP BY "editionUUID" HAVING COUNT(*) > :size LIMIT :limit OFFSET :offset)',
        { userId: userId, size: size, limit: limit, offset: start, auctionId: auctionId },
      )
      .groupBy('nft.editionUUID, nft.id')
      .orderBy('nft.createdAt', 'DESC')
      .getMany();

    const nftsIds = nfts.map((nft) => nft.id);
    const editionNFTsMap = this.groupNftsByEdition(nfts);
    const collectionIds = Object.keys(nfts.reduce((acc, nft) => ({ ...acc, [nft.collectionId]: true }), {}));
    const collections = await this.nftCollectionRepository.find({
      where: { 
        id: In(collectionIds),
        status: NftCollectionStatusEnum.DEPLOYED,
      } 
    });
    const collectionsMap: Record<string, NftCollection> = collections.reduce(
      (acc, collection) => ({ ...acc, [collection.id]: collection }),
      {},
    );
    const rewardTiers = await this.rewardTierNftRepository.find({ where: { nftId: In(nftsIds) } });
    const nftRewardTierMapping = [];
    if (rewardTiers.length) {
      rewardTiers.forEach((tier) => {
        nftRewardTierMapping[tier.nftId] = { id: tier.rewardTierId, slot: tier.slot };
      });
    }

    const mappedNfts = Object.values(editionNFTsMap).map((nfts) => {
      const rewardAndTokenIds = [];
      nfts.forEach((nft) => {
        rewardAndTokenIds.push({
          tokenId: nft.tokenId,
          id: nft.id,
          rewardTierId: nftRewardTierMapping[nft.id]?.id,
          slot: nftRewardTierMapping[nft.id]?.slot,
        });
      });

      return {
        nfts: { ...classToPlain(nfts[0]), rewardAndTokenIds },
        collection: nfts.length > 0 && classToPlain(collectionsMap[nfts[0].collectionId]),
      };
    });

    return {
      nfts: mappedNfts,
      pagination: {
        page: start === 0 ? 1 : Math.ceil(start / limit + 1),
        hasNextPage: editionsCount > +start + +limit,
        totalPages: Math.ceil(editionsCount / limit),
      },
    };
  }

  /**
   * Creates an entry in the nft_collection table
   * @param userId 
   * @param body 
  //  * @param cover - nft logo
  //  * @param banner - nft banner
   * @returns {Object}
   * @throws {BadRequestException}
   */
  public async createCollection(userId: number, body: any) {
    //first check if files are uploaded to server, THEN run everything inside try catch and remove 
    //files from the server i ncase of an error.
    // if (!cover) {
    //   if(banner) {
    //     await this.fileSystemService.removeFile(banner.path).catch(() => {});
    //   }
    //   throw new BadRequestException({
    //     error: 'NoFileAttached',
    //     message: 'Please attach Logo',
    //   });
    // }

    // if(!banner) {
    //   if(cover) {
    //     await this.fileSystemService.removeFile(cover.path).catch(() => {});
    //   }
    //   throw new BadRequestException({
    //     error: 'NoFileAttached',
    //     message: 'Please attach Banner',
    //   });
    // }

    try {
      const bodyClass = plainToClass(CreateCollectionBody, { ...body });
      await this.validateReqBody(bodyClass);

      // const coverS3Result = await this.s3Service.uploadDocument(cover.path, cover.filename);
      // const bannerS3Result = await this.s3Service.uploadDocument(banner.path, banner.filename);
    
      let newCollection = this.nftCollectionRepository.create({
        userId: userId,
        status: NftCollectionStatusEnum.SAVED,
        name: bodyClass.name,
        symbol: bodyClass.symbol,
        description: bodyClass.description,
        // coverUrl: coverS3Result.url,
        // bannerUrl: bannerS3Result.url,
      });
      newCollection = await this.nftCollectionRepository.save(newCollection);

      return {
        id: newCollection.id,
      }
    } catch(e) {
      //async call is ok here
      // this.fileSystemService.removeFile(cover.path).catch(() => {});
      // this.fileSystemService.removeFile(banner.path).catch(() => {});
      throw e;
    }
  }

  /**
   * This method replaces either collection's cover image (logo) or banner with the new one.
   * The property parameter defines whether it's cover image or banner.
   * @param collectionId 
   * @param userId 
   * @param property - constants.NFT_COLLECTION_COVER or constants.NFT_COLLECTION_BANNER 
   * @param file - collection logo
   * @returns {Object} collection
   * @throws {BadRequestException|NftCollectionNotFoundException|NftCollectionBadOwnerException}
   */
  public async changeCollectionImage(collectionId: number, userId: number, property: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        error: 'NoFileAttached',
        message: 'Please attach a file',
      });
    }
    
    try {
      const user = await this.usersService.getById(userId, true);
      const collection = await this.nftCollectionRepository.findOne({
        id: collectionId,
        status: NftCollectionStatusEnum.SAVED, // only allowing to update not minted collections
      });
      if (!collection) {
        throw new NftCollectionNotFoundException();
      }

      const userOwnsCollection = await this.userOwnsCollection(userId, collectionId);
      if (!userOwnsCollection) {
        this.logger.error(`user id ${userId} tried to change the cover image on collection id ${collectionId} which they do not own!`);
        throw new NftCollectionBadOwnerException();
      }

      const propertyName = constants.NFT_COLLECTION_BANNER === property
        ? 'bannerUrl'
        : 'coverUrl';

      //delete the previous logo from S3
      if(collection[propertyName]) {
        await this.s3Service.deleteImage(collection[propertyName].split('/').pop());
      }
      const s3Result = await this.s3Service.uploadDocument(file.path, file.filename);
      collection[propertyName] = s3Result.url;
      await this.nftCollectionRepository.save(collection);    

      return classToPlain(collection);
    } catch(e) {
      this.fileSystemService.removeFile(file.path).catch(() => {});
      throw e;
    }
  }

  /**
   * Updates an existing entry in the nft_collection table
   * @param id 
   * @param userId 
   * @param data 
   * @returns {Object}
   * @throws {NftCollectionNotFoundException|NftCollectionBadOwnerException}
   */
  public async updateCollection(collectionId: number, userId: number, data: UpdateCollectionBody) {
    const user = await this.usersService.getById(userId, true);
    const collection = await this.nftCollectionRepository.findOne({
      id: collectionId,
      status: NftCollectionStatusEnum.SAVED, // only allowing to update not minted collections
    });
    if (!collection) {
      throw new NftCollectionNotFoundException();
    }

    const userOwnsCollection = await this.userOwnsCollection(userId, collectionId);
    if (!userOwnsCollection) {
      this.logger.error(`User id ${userId} tried to update a collection id ${collectionId} which they do not own!`);
      throw new NftCollectionBadOwnerException();
    }

    const filteredAttributes = this.filterObjectAttributes(data, [
      'description'
    ]);
    for (const attribute in filteredAttributes) {
      collection[attribute] = filteredAttributes[attribute];
    }

    await this.nftCollectionRepository.save(collection);
    return classToPlain(collection);
  }

  /**
   * 
   * @param userId 
   * @returns 
   */
  public async getDeployedCollectionsByUserId(userId: number) {
    const user = await this.usersService.getById(userId, true);
    const nfts = await this.nftRepository.find({
      where: {
        owner: user.address,
        status: NftStatusEnum.MINTED,
      },
      select: ['collectionId'],
    });

    //assuming that minted nft can only be related with deployed collection,
    //so we do no need to additionally filter collections by the status.
    const collections = await this.nftCollectionRepository.find({
      where: { id: In(nfts.map((nft) => nft.collectionId)) },
    });

    return {
      collections: collections.map((collection) => classToPlain(collection)),
    };
  }

  /**
   * 
   * @param userId 
   * @returns 
   */
  public async getDeployableCollectionsByUserId(userId: number) {
    const user = await this.usersService.getById(userId, true);
    const collections = await this.nftCollectionRepository.find({
      where: [
        {
          // owner: user.address,
          userId: user.id,
        }, 
        // { publicCollection: true } - what is it?!
      ],
    });

    return {
      collections: collections.map((collection) => classToPlain(collection)),
    };
  }

  /**
   * Deletes NftFile by deleting every file contained in it and
   * eventually deletes the entry from the nft_file table.
   * @param file 
   * @returns void
   * @throws {Error}
   */
  private async deleteNftFile(file: NftFile) {
    
    try {
      if(file.url) {
        await this.s3Service.deleteImage(file.url.split('/').pop());
      }
      if(file.optimizedUrl) {
        await this.s3Service.deleteImage(file.optimizedUrl.split('/').pop());
      }
      if(file.thumbnailUrl) {
        await this.s3Service.deleteImage(file.thumbnailUrl.split('/').pop());
      }
      // if(file.originalUrl) {
          // no! there's no way to delete stuff from arweave
      // }
      if(file.ipfs) {
        await this.fleekService.delete(file.ipfs);
      }

      await this.nftFileRepository.delete({
        id: file.id,
      });
    } catch(e) {
      this.logger.error(`Error deleting NftFile contents: ${e}`);
      throw e;
    }
  }

  /**
   * Returns whether or not the user owns the collection.
   * For minted collections the ownership is defined by user's id and 
   * collection's id.
   * For other collections the ownership is defined by collection's 
   * owner and user's wallet address.
   * @param userId 
   * @param collectionId 
   * @returns {Promise<Boolean>}
   */
  private async userOwnsCollection(userId: number, collectionId: number): Promise<Boolean> {
    let value = false;

    const user = await this.usersService.getById(userId, true);
    const collection = await this.nftCollectionRepository.findOne({ 
      id: collectionId,
    });

    if(collection
      && NftCollectionStatusEnum.DEPLOYED === collection.status
      && collection.owner
      && collection.owner === user.address  
    ) {
      value = true;
    } else if(collection
      && NftCollectionStatusEnum.DEPLOYED != collection.status
      && collection.userId === user.id
    ) {
      value = true;
    }

    return value;
  }

  /**
   * Makes the optimized and downsized versions on the passed file.
   * @param file 
   * @returns {Object}
   * { 
   *   optimisedFile, 
   *   downsizedFile, 
   *   //arweaveUrl, 
   *   //ipfsData - respone Object from Fleek.
   * };
   * @throws {NftIPFSUploadException}
   */
   private async processUploadedFile(file: Express.Multer.File) {
    const optimisedFile = await this.fileProcessingService.optimiseFile(file.path, file.mimetype);
    const downsizedFile = await this.fileProcessingService.downsizeFile(file.path, file.mimetype);
    const uniqueFiles = [optimisedFile, downsizedFile].filter((fileItem) => fileItem.path !== file.path);

    await Promise.all([
      this.s3Service.uploadDocument(file.path, `${file.filename}`),
      ...uniqueFiles.map((fileItem) => this.s3Service.uploadDocument(fileItem.path, `${fileItem.fullFilename()}`)),
    ]);
    const data = await fs.readFile(file.path);  
    // const ipfsData = await this.fleekService.upload(data, file);    
    // if(!ipfsData.hash) {
    //   throw new NftIPFSUploadException()
    // }
    // const arweaveUrl = await this.arweaveService.storeData(data, file.mimetype);

    await Promise.all(
      [file.path, ...uniqueFiles.map((file) => file.path)].map((path) => this.fileSystemService.removeFile(path)),
    );

    return { 
      optimisedFile, 
      downsizedFile, 
      // arweaveUrl, 
      // ipfsData,
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

  private async reduceUserNftsByEdition(
    userId: number,
    additionalData?: NftAdditionalData,
    prefetchData?: NftPrefetchData,
  ) {
    let nfts = [];
    const query = this.nftRepository.createQueryBuilder('nft');

    if (additionalData?.creator && !prefetchData?.creator) {
      query.leftJoinAndMapOne('nft.creator', User, 'creator', 'creator.address = nft.creator');
    }

    if (additionalData?.owner && !prefetchData?.owner) {
      query.leftJoinAndMapOne('nft.owner', User, 'owner', 'owner.id = nft.userId');
    }

    nfts = await query
      .where('nft.userId = :userId', { userId: userId })
      .andWhere('nft.status = :status', { status: NftStatusEnum.MINTED })
      .orderBy('nft.createdAt', 'DESC')
      .getMany();

    if (prefetchData?.owner) {
      nfts = nfts.map((nft) => {
        return {
          ...nft,
          owner: prefetchData.owner,
        };
      });
    }

    if (prefetchData?.creator) {
      nfts = nfts.map((nft) => {
        return {
          ...nft,
          creator: prefetchData.creator,
        };
      });
    }

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
        };
      }),
    };
  }

  private groupNftsByEdition(nfts: Nft[]): Record<string, Nft[]> {
    return nfts.reduce((acc, nft) => ({ ...acc, [nft.editionUUID]: [...(acc[nft.editionUUID] || []), nft] }), {});
  }

}
