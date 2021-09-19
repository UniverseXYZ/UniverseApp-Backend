import { Injectable } from '@nestjs/common';
import { getManager, In, LessThan, MoreThan, Repository, Transaction, TransactionRepository } from 'typeorm';
import { RewardTier } from '../domain/reward-tier.entity';
import { RewardTierNft } from '../domain/reward-tier-nft.entity';
import { Auction } from '../domain/auction.entity';
import { S3Service } from '../../file-storage/s3.service';
import { AppConfig } from 'src/modules/configuration/configuration.service';
import { InjectRepository } from '@nestjs/typeorm';
import { AuctionStatus } from '../domain/types';
import { CreateAuctionBody, EditAuctionBody, UpdateRewardTierBody } from '../entrypoints/dto';
import { Nft } from 'src/modules/nft/domain/nft.entity';
import { AuctionNotFoundException } from './exceptions/AuctionNotFoundException';
import { AuctionBadOwnerException } from './exceptions/AuctionBadOwnerException';
import { FileSystemService } from '../../file-system/file-system.service';
import { RewardTierNotFoundException } from './exceptions/RewardTierNotFoundException';
import { RewardTierBadOwnerException } from './exceptions/RewardTierBadOwnerException';
import { UsersService } from '../../users/users.service';
import { classToPlain } from 'class-transformer';
import { UploadResult } from 'src/modules/file-storage/model/UploadResult';

@Injectable()
export class AuctionService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(RewardTier)
    private rewardTierRepository: Repository<RewardTier>,
    @InjectRepository(RewardTierNft)
    private rewardTierNftRepository: Repository<RewardTierNft>,
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    @InjectRepository(Nft)
    private nftRepository: Repository<Nft>,
    private s3Service: S3Service,
    private fileSystemService: FileSystemService,
    private readonly config: AppConfig,
  ) {}

  async getAuctionPage(userId: number, auctionId: number) {
    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });

    if (!auction) {
      throw new AuctionNotFoundException();
    }

    const rewardTiers = await this.rewardTierRepository.find({ where: { auctionId } });
    const rewardTierNfts = await this.rewardTierNftRepository.find({
      where: { rewardTierId: In(rewardTiers.map((rewardTier) => rewardTier.id)) },
    });
    const nftIds = rewardTierNfts.map((rewardTierNft) => rewardTierNft.nftId);
    console.log(nftIds);
    const nfts = await this.nftRepository.find({ where: { id: In(nftIds) } });
    const idNftMap = nfts.reduce((acc, nft) => ({ ...acc, [nft.id]: nft }), {} as Record<string, Nft>);
    console.log(idNftMap);
    const rewardTierNftsMap = rewardTierNfts.reduce(
      (acc, rewardTierNft) => ({
        ...acc,
        [rewardTierNft.rewardTierId]: [...(acc[rewardTierNft.rewardTierId] || []), idNftMap[rewardTierNft.nftId]],
      }),
      {} as Record<string, Nft[]>,
    );
    const artist = await this.usersService.getById(auction.userId, false);

    return {
      auction: classToPlain(auction),
      rewardTiers: rewardTiers.map((rewardTier) => ({
        ...classToPlain(rewardTier),
        nfts: rewardTierNftsMap[rewardTier.id].map((nft) => classToPlain(nft)),
      })),
      bids: [],
      artist: classToPlain(artist),
    };
  }

  async createRewardTier(
    userId: number,
    auctionId: number,
    params: {
      name: string;
      numberOfWinners: number;
      nftsPerWinner: number;
      nftIds: number[];
      minimumBid: number;
      tierPosition: number;
    },
  ) {
    const tier = await this.rewardTierRepository.findOne({
      where: { userId, auctionId, tierPosition: params.tierPosition },
    });
    if (tier) return tier;

    return await getManager().transaction('SERIALIZABLE', async (transactionalEntityManager) => {
      const tier = this.rewardTierRepository.create({
        userId,
        auctionId,
        name: params.name,
        nftsPerWinner: params.nftsPerWinner,
        numberOfWinners: params.numberOfWinners,
        minimumBid: params.minimumBid,
        tierPosition: params.tierPosition,
      });
      await transactionalEntityManager.save(tier);

      const rewardTierNfts = params.nftIds.map((nftId) =>
        this.rewardTierNftRepository.create({
          rewardTierId: tier.id,
          nftId: nftId,
        }),
      );

      await Promise.all(rewardTierNfts.map((rewardTierNft) => this.rewardTierNftRepository.save(rewardTierNft)));

      return tier;
    });
  }

  async updateRewardTier(userId: number, id: number, params: UpdateRewardTierBody) {
    return await getManager().transaction('SERIALIZABLE', async (transactionalEntityManager) => {
      const tier = await this.rewardTierRepository.findOne({ where: { id } });

      if (!tier) {
        throw new RewardTierNotFoundException();
      }

      if (tier.userId !== userId) {
        throw new RewardTierBadOwnerException();
      }

      tier.name = params.name ? params.name : tier.name;
      tier.numberOfWinners = params.numberOfWinners ? params.numberOfWinners : tier.numberOfWinners;
      tier.nftsPerWinner = params.nftsPerWinner ? params.nftsPerWinner : tier.nftsPerWinner;

      if (typeof params.description === 'string' || params.description === null) {
        tier.description = params.description;
      }

      if (typeof params.minimumBid === 'number' || params.minimumBid === null) {
        tier.minimumBid = params.minimumBid;
      }

      if (typeof params.color === 'string' || params.color === null) {
        tier.color = params.color;
      }

      await transactionalEntityManager.save(tier);

      if (params.nftIds) {
        const rewardTierNfts = await this.rewardTierNftRepository.find({ where: { rewardTierId: id } });
        const nftIds = rewardTierNfts.map((nft) => nft.nftId);

        const idsToDelete = nftIds.filter((nftId) => !params.nftIds.includes(nftId));
        const idsToCreate = params.nftIds.filter((nftId) => !nftIds.includes(nftId));
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(RewardTierNft)
          .where('nftId IN (:...idsToDelete)', { idsToDelete })
          .execute();

        const newRewardTierNfts = idsToCreate.map((nftId) =>
          this.rewardTierNftRepository.create({
            rewardTierId: tier.id,
            nftId: nftId,
          }),
        );

        await Promise.all(newRewardTierNfts.map((rewardTierNft) => this.rewardTierNftRepository.save(rewardTierNft)));
      }

      const rewardTierNfts = await this.rewardTierNftRepository.find({ where: { rewardTierId: id } });
      const nftIds = rewardTierNfts.map((nft) => nft.nftId);
      const nfts = await this.nftRepository.find({ where: { id: In(nftIds) } });
      return {
        ...classToPlain(tier),
        nfts: nfts.map((nft) => classToPlain(nft)),
      };
    });
  }

  private async validateTierPermissions(userId: number, tierId: number) {
    const tier = await this.rewardTierRepository.findOne({ where: { id: tierId } });

    if (!tier) {
      throw new RewardTierNotFoundException();
    }

    if (tier.userId !== userId) {
      throw new RewardTierBadOwnerException();
    }

    return tier;
  }

  async updateRewardTierExtraData(
    userId: number,
    tierId: number,
    params: { customDescription: string; tierColor: string },
  ) {
    // const tier = await this.validateTierPermissions(userId, tierId);
    // tier.customDescription = params.customDescription ? params.customDescription : tier.customDescription;
    // tier.tierColor = params.tierColor ? params.tierColor : tier.tierColor;
    // await this.rewardTierRepository.save(tier);
    // return tier;
  }

  async updateRewardTierImage(userId: number, tierId: number, image: Express.Multer.File) {
    const user = await this.usersService.getById(userId, true);
    const rewardTier = await this.validateTierPermissions(user.id, tierId);

    let s3Result: UploadResult;

    if (image) {
      s3Result = await this.s3Service.uploadDocument(image.path, image.filename);
      rewardTier.imageUrl = s3Result.url;
      await this.rewardTierRepository.save(rewardTier);
      await this.fileSystemService.removeFile(image.path);
    }

    return classToPlain(rewardTier);
  }

  @Transaction()
  async createAuction(
    userId: number,
    createAuctionBody: CreateAuctionBody,
    @TransactionRepository(RewardTier) rewardTierRepository?: Repository<RewardTier>,
    @TransactionRepository(RewardTierNft) rewardTierNftRepository?: Repository<RewardTierNft>,
    @TransactionRepository(Auction) auctionRepository?: Repository<Auction>,
  ) {
    let auction = auctionRepository.create({
      userId,
      name: createAuctionBody.name,
      startingBid: createAuctionBody.startingBid,
      tokenAddress: createAuctionBody.tokenAddress,
      tokenSymbol: createAuctionBody.tokenSymbol,
      tokenDecimals: createAuctionBody.tokenDecimals,
      startDate: createAuctionBody.startDate,
      endDate: createAuctionBody.endDate,
      royaltySplits: createAuctionBody.royaltySplits,
    });
    auction = await auctionRepository.save(auction);

    for (const [index, rewardTierBody] of createAuctionBody.rewardTiers.entries()) {
      const rewardTier = rewardTierRepository.create();
      rewardTier.auctionId = auction.id;
      rewardTier.userId = userId;
      rewardTier.name = rewardTierBody.name;
      rewardTier.numberOfWinners = rewardTierBody.numberOfWinners;
      rewardTier.nftsPerWinner = rewardTierBody.nftsPerWinner;
      rewardTier.minimumBid = rewardTierBody.minimumBid;
      rewardTier.tierPosition = index;
      await rewardTierRepository.save(rewardTier);

      for (const id of rewardTierBody.nftIds) {
        const rewardTierNft = rewardTierNftRepository.create();
        rewardTierNft.nftId = id;
        rewardTierNft.rewardTierId = rewardTier.id;
        await rewardTierNftRepository.save(rewardTierNft);
      }
    }

    return {
      id: auction.id,
    };
  }

  private async validateAuctionPermissions(userId: number, auctionId: number) {
    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });

    if (!auction) {
      throw new AuctionNotFoundException();
    }

    if (userId !== auction.userId) {
      throw new AuctionBadOwnerException();
    }

    return auction;
  }

  async updateAuction(userId: number, auctionId: number, updateAuctionBody: EditAuctionBody) {
    let auction = await this.validateAuctionPermissions(userId, auctionId);

    for (const key in updateAuctionBody) {
      auction[key] = updateAuctionBody[key];
    }
    auction = await this.auctionRepository.save(auction);

    return auction;
  }

  async cancelFutureAuction(userId: number, auctionId: number) {
    const auction = await this.validateAuctionPermissions(userId, auctionId);
    let canceled = false;
    const now = new Date();
    // TODO: Add more validations if needed
    if (now < auction.startDate) {
      await getManager().transaction(async (transactionalEntityManager) => {
        const auctionDelete = await this.auctionRepository.delete({ id: auction.id });
        await transactionalEntityManager.save(auctionDelete);

        const rewardTiers = await this.rewardTierRepository.find({ auctionId: auction.id });
        const idsToDelete = rewardTiers.map((tier) => tier.id);

        const tierDelete = await this.rewardTierRepository.delete({ auctionId: auction.id });
        await transactionalEntityManager.save(tierDelete);

        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(RewardTierNft)
          .where('nftId IN (:...idsToDelete)', { idsToDelete })
          .execute();
      });
      canceled = true;
    }

    return {
      id: auction.id,
      canceled,
    };
  }

  async uploadAuctionLandingImages(
    userId: number,
    auctionId: number,
    promoImageFile: Express.Multer.File,
    backgroundImageFile: Express.Multer.File,
  ) {
    let auction = await this.validateAuctionPermissions(userId, auctionId);

    if (promoImageFile) {
      const uploadResult = await this.s3Service.uploadDocument(
        promoImageFile.path,
        `auctions/${promoImageFile.filename}`,
      );
      auction.promoImageUrl = uploadResult.url;
      await this.fileSystemService.removeFile(promoImageFile.path);
    }

    if (backgroundImageFile) {
      const uploadResult = await this.s3Service.uploadDocument(
        backgroundImageFile.path,
        `auctions/${backgroundImageFile.filename}`,
      );
      auction.backgroundImageUrl = uploadResult.url;
      await this.fileSystemService.removeFile(backgroundImageFile.path);
    }
    auction = await this.auctionRepository.save(auction);

    return classToPlain(auction);
  }

  private async getMyFutureAuctions(userId: number, limit: number, offset: number) {
    const now = new Date().toISOString();
    const [auctions, count] = await this.auctionRepository.findAndCount({
      where: {
        userId,
      },
      skip: offset,
      take: limit,
    });

    return { auctions, count };
  }

  private async getMyActiveAuctions(userId: number, limit: number, offset: number) {
    const now = new Date().toISOString();
    const [auctions, count] = await this.auctionRepository.findAndCount({
      where: {
        userId,
        startDate: LessThan(now),
        endDate: MoreThan(now),
      },
      skip: offset,
      take: limit,
    });

    return { auctions, count };
  }

  private async getMyPastAuctions(userId: number, limit: number, offset: number) {
    const now = new Date().toISOString();
    const [auctions, count] = await this.auctionRepository.findAndCount({
      where: {
        userId,
        endDate: LessThan(now),
      },
      skip: offset,
      take: limit,
    });

    return { auctions, count };
  }

  async getMyFutureAuctionsPage(userId: number, limit: number, offset: number) {
    const user = await this.usersService.getById(userId, true);
    const { count, auctions } = await this.getMyFutureAuctions(userId, limit, offset);
    const formattedAuctions = await this.formatMyAuctions(auctions);

    return {
      pagination: {
        total: count,
        offset,
        limit,
      },
      auctions: formattedAuctions,
    };
  }

  async getMyPastAuctionsPage(userId: number, limit: number, offset: number) {
    const user = await this.usersService.getById(userId, true);
    const { count, auctions } = await this.getMyPastAuctions(userId, limit, offset);
    const formattedAuctions = await this.formatMyAuctions(auctions);

    return {
      pagination: {
        total: count,
        offset,
        limit,
      },
      auctions: formattedAuctions,
    };
  }

  async getMyActiveAuctionsPage(userId: number, limit: number, offset: number) {
    const user = await this.usersService.getById(userId, true);
    const { count, auctions } = await this.getMyActiveAuctions(userId, limit, offset);
    const formattedAuctions = await this.formatMyAuctions(auctions);

    return {
      pagination: {
        total: count,
        offset,
        limit,
      },
      auctions: formattedAuctions,
    };
  }

  private async formatMyAuctions(auctions: Auction[]) {
    const auctionIds = auctions.map((auction) => auction.id);
    const rewardTiers = await this.rewardTierRepository.find({ where: { auctionId: In(auctionIds) } });
    const auctionRewardTiersMap = auctionIds.reduce((acc, auctionId) => {
      const prevRewardTiers = acc[auctionId] || [];
      return {
        ...acc,
        [auctionId]: [...prevRewardTiers, ...rewardTiers.filter((rewardTier) => rewardTier.auctionId === auctionId)],
      };
    }, {} as Record<string, RewardTier[]>);
    const rewardTierNfts = await this.rewardTierNftRepository.find({
      where: { rewardTierId: In(rewardTiers.map((rewardTier) => rewardTier.id)) },
    });
    const nfts = await this.nftRepository.find({
      where: { id: In(rewardTierNfts.map((rewardTierNft) => rewardTierNft.nftId)) },
    });
    const idNftMap = nfts.reduce((acc, nft) => ({ ...acc, [nft.id]: nft }), {} as Record<string, Nft>);
    const rewardTierNftsMap = rewardTierNfts.reduce(
      (acc, rewardTierNft) => ({
        ...acc,
        [rewardTierNft.rewardTierId]: [...(acc[rewardTierNft.rewardTierId] || []), idNftMap[rewardTierNft.nftId]],
      }),
      {} as Record<string, Nft[]>,
    );

    return auctions.map((auction) => ({
      ...classToPlain(auction),
      rewardTiers: auctionRewardTiersMap[auction.id].map((rewardTier) => ({
        ...classToPlain(rewardTier),
        nfts: rewardTierNftsMap[rewardTier.id].map((nft) => classToPlain(nft)),
      })),
    }));
  }

  async updateAuctionExtraData(
    userId: number,
    auctionId: number,
    params: {
      headline: string;
      link: string;
      backgroundBlur: boolean;
    },
  ) {
    // const auction = await this.validateAuctionPermissions(userId, auctionId);
    //
    // auction.headline = params.headline ? params.headline : auction.headline;
    // auction.link = params.link ? params.link : auction.link;
    // auction.backgroundBlur = params.backgroundBlur ? params.backgroundBlur : auction.backgroundBlur;
    //
    // return await this.auctionRepository.save(auction);
  }

  async updateAuctionPromoImage(userId: number, auctionId: number, file: Express.Multer.File) {
    // const auction = await this.validateAuctionPermissions(userId, auctionId);
    //
    // await this.s3Service.uploadDocument(`${file.path}`, `${file.filename}`);
    //
    // auction.promoImage = file.filename;
    //
    // return await this.auctionRepository.save(auction);
  }

  async updateAuctionBackgroundImage(userId: number, auctionId: number, file: Express.Multer.File) {
    // const auction = await this.validateAuctionPermissions(userId, auctionId);
    //
    // auction.backgroundImage = file.filename;
    //
    // return await this.auctionRepository.save(auction);
  }

  async getAuction(id: number) {
    // const auction = await this.auctionRepository.findOne({ where: { id: id } });
    // if (!auction) return;
    //
    // const rewardTiers = await this.rewardTierRepository.find({
    //   where: { auctionId: auction.id },
    //   order: { tierPosition: 'ASC' },
    // });
    //
    // for (const rewardTier of rewardTiers) {
    //   const nftsInTier = await this.rewardTierNftRepository.find({ where: { rewardTierId: rewardTier.id } });
    //   const nftIdsInTier = [];
    //   for (const nftInTier of nftsInTier) {
    //     nftIdsInTier.push(nftInTier.nftId);
    //   }
    //   const nftsInfo = await this.nftRepository.find({ where: { tokenId: In(nftIdsInTier) } });
    //
    //   //Todo: group nfts from the same edition?
    //   rewardTier.nfts = nftsInfo;
    //   auction.rewardTiers.push(rewardTier);
    // }
  }

  async listAuctionsByUser(userId: number, page = 1, limit = 10) {
    // const auctionsQuery = this.auctionRepository.createQueryBuilder().where('userId = :userId', { userId });
    // const countQuery = auctionsQuery.clone();
    //
    // const auctionCount = await countQuery.select('count(*) as auction_count').getRawOne();
    //
    // this.setPagination(auctionsQuery, page, limit);
    // const auctions = await auctionsQuery.getMany();
    //
    // return {
    //   count: auctionCount['auctionCount'],
    //   data: auctions,
    // };
  }

  async listAuctionsByUserAndStatus(userId: number, status: string, page = 1, limit = 10) {
    const auctionsQuery = this.auctionRepository.createQueryBuilder();

    if (status == AuctionStatus.draft) {
      auctionsQuery.where('userId = :userId and now() < startDate', { userId });
    } else if (status == AuctionStatus.active) {
      auctionsQuery.where('userId = :userId and startDate < now() and now() < endDate', { userId });
    } else if (status == AuctionStatus.closed) {
      auctionsQuery.where('userId = :userId and endDate < now()', { userId });
    } else {
      return {
        count: 0,
        data: [],
      };
    }

    const countQuery = auctionsQuery.clone();
    const auctionCount = await countQuery.select('count(*) as auction_count').getRawOne();

    this.setPagination(auctionsQuery, page, limit);
    const auctions = await auctionsQuery.getMany();

    return {
      count: auctionCount['auctionCount'],
      data: auctions,
    };
  }

  async listAuctions(page = 1, limit = 10) {
    const auctionsQuery = this.auctionRepository.createQueryBuilder();
    const countQuery = auctionsQuery.clone();

    const auctionCount = await countQuery.select('count(*) as auction_count').getRawOne();

    this.setPagination(auctionsQuery, page, limit);
    const auctions = await auctionsQuery.getMany();

    return {
      count: auctionCount['auctionCount'],
      data: auctions,
    };
  }

  async listAuctionsByStatus(status: string, page = 1, limit = 10) {
    const auctionsQuery = this.auctionRepository.createQueryBuilder();

    if (status == AuctionStatus.draft) {
      auctionsQuery.where('now() < startDate');
    } else if (status == AuctionStatus.active) {
      auctionsQuery.where('startDate < now() and now() < endDate');
    } else if (status == AuctionStatus.closed) {
      auctionsQuery.where('endDate < now()');
    } else {
      return {
        count: 0,
        data: [],
      };
    }

    const countQuery = auctionsQuery.clone();
    const auctionCount = await countQuery.select('count(*) as auction_count').getRawOne();

    this.setPagination(auctionsQuery, page, limit);
    const auctions = await auctionsQuery.getMany();

    return {
      count: auctionCount['auctionCount'],
      data: auctions,
    };
  }

  private setPagination(query, page: number, limit: number) {
    if (limit === 0 || page === 0) return;

    query.limit(limit).offset((page - 1) * limit);
  }
}
