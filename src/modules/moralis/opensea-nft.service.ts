import { HttpService, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { customAlphabet } from 'nanoid';
import Downloader from 'nodejs-file-downloader';

import { AppConfig } from '../configuration/configuration.service';

import { S3Service } from '../file-storage/s3.service';
import { Nft, NftSource } from '../nft/domain/nft.entity';
import { MoralisLog } from './domain/moralis-log.entity';
import { NftCollection } from '../nft/domain/collection.entity';
import { MonitoredNfts } from '../nft/domain/monitored-nfts';
import { User } from '../users/user.entity';
import { StandardOpenseaNft } from '../nft/domain/opensea-nft';

import {
  TokenUriFormatNotSupportedError,
  ImageUriFormatNotSupportedError,
  TokenAssertAddressNotSupportedError,
  OpenSeaNftImageSupportedError,
} from './service/exceptions';
import { FileSystemService } from '../file-system/file-system.service';
import { NftValidator } from './service/nft-validator';
import { OPENSEA_RINKEBY_API_URL, OPENSEA_ETH_API_URL } from './constants';
@Injectable()
export class OpenseaNftService {
  private logger = new Logger(OpenseaNftService.name);

  constructor(
    private readonly config: AppConfig,
    private httpService: HttpService,
    private s3Service: S3Service,
    private fileSystemService: FileSystemService,
    private nftValidator: NftValidator,
    @InjectRepository(Nft)
    private nftRepository: Repository<Nft>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(NftCollection)
    private nftCollectionRepository: Repository<NftCollection>,
    @InjectRepository(MonitoredNfts)
    private monitoredNftsRepository: Repository<MonitoredNfts>,
    @InjectRepository(MoralisLog)
    private moralisLogRepository: Repository<MoralisLog>,
  ) {}

  public async newOpenSeaNftOwnerHander(input: any) {
    const {
      tokenAddress,
      tokenId,
      amount,
      collectionId,
    }: { tokenAddress: string; tokenId: string; amount: string; metadata: StandardOpenseaNft; collectionId: number } =
      input;

    const metadata = await this.getTokenMetaDataWithOpenSeaAPI(tokenAddress, tokenId);
    metadata.amount = amount;

    await this.createNft(metadata, collectionId);
  }

  private async getTokenMetaDataWithOpenSeaAPI(tokenAddres: string, tokenId: string) {
    if (tokenId == undefined || tokenAddres == undefined) {
      throw new TokenAssertAddressNotSupportedError();
    } else {
      const openSeaApiUri =
        this.config.values.ethereum.ethereumNetwork === 'rinkeby' ? OPENSEA_RINKEBY_API_URL : OPENSEA_ETH_API_URL;
      const headers =
        this.config.values.ethereum.ethereumNetwork === 'rinkeby'
          ? {}
          : { 'X-API-KEY': this.config.values.opensea.apiKey };
      const { data } = await this.httpService
        .get(`${openSeaApiUri}/${tokenAddres}/${tokenId}`, {
          headers,
        })
        .toPromise();

      const metadata = new StandardOpenseaNft(data);
      return metadata;
    }
  }

  public async createNft(metadata: StandardOpenseaNft, existingCollectionId: number) {
    try {
      const existingCollection = await this.nftCollectionRepository.findOne({ where: { id: existingCollectionId } });
      const existingNft = this.nftRepository.create();
      const user = await this.userRepository.findOne({ where: { address: metadata.owner } });
      existingNft.userId = user?.id;
      if (metadata.contract_type === 'ERC1155') {
        existingNft.amount = Number(metadata.amount) ? Number(metadata.amount) : 1;
      }
      existingNft.collectionId = existingCollection.id;
      existingNft.source = NftSource.SCRAPER;
      const editionUUID = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)();

      const nftWithSimilarTokenUuid = await this.nftRepository.findOne({ where: { tokenUri: metadata.token_uri } });
      const numberOfEditions = nftWithSimilarTokenUuid ? nftWithSimilarTokenUuid.numberOfEditions + 1 : 1;
      existingNft.editionUUID = nftWithSimilarTokenUuid?.editionUUID || editionUUID;
      existingNft.numberOfEditions = numberOfEditions;

      existingNft.owner = metadata.owner;
      existingNft.tokenId = metadata.token_id;
      existingNft.standard = metadata.contract_type;

      existingNft.tokenUri = metadata.token_metadata;
      existingNft.name = metadata.name;
      existingNft.description = metadata.description;
      existingNft.properties = metadata.traits;
      existingNft.creator = metadata.creator;
      existingNft.background_color = metadata.background_color;
      existingNft.original_url = metadata.image_original_url;
      existingNft.animation_original_url = metadata.animation_original_url;
      existingNft.external_link = metadata.external_link;

      if (!existingCollection.name && metadata.collectionName) {
        existingCollection.name = metadata.collectionName;
        await this.nftCollectionRepository.save(existingCollection);
      }

      if (!existingCollection.bannerUrl && metadata.collectionBannerUrl) {
        existingCollection.bannerUrl = await this.uploadAssert(metadata.collectionBannerUrl);
      }

      if (metadata.image_url) {
        existingNft.url = await this.uploadAssert(metadata.image_url);
        existingNft.artworkType = this.getFileExtension(metadata.image_url);
      }

      if (metadata.image_preview_url) {
        existingNft.optimized_url = await this.uploadAssert(metadata.image_preview_url);
      }

      if (metadata.image_thumbnail_url) {
        existingNft.thumbnail_url = await this.uploadAssert(metadata.image_thumbnail_url);
      }

      if (metadata.animation_url) {
        existingNft.animation_url = await this.uploadAssert(metadata.animation_url);
        existingNft.artworkType = this.getFileExtension(metadata.animation_url);
      }

      const result = await this.nftRepository.save(existingNft);

      if (numberOfEditions > 1) {
        await this.nftRepository.update({ tokenUri: metadata.token_metadata }, { numberOfEditions });
      }
      return result;
    } catch (error) {
      console.log(error);
      if (
        error instanceof TokenUriFormatNotSupportedError ||
        error instanceof ImageUriFormatNotSupportedError ||
        error instanceof TokenAssertAddressNotSupportedError
      ) {
        const newMoralisLog = this.moralisLogRepository.create();
        newMoralisLog.name = error.name;
        newMoralisLog.token = metadata;
        await this.moralisLogRepository.save(newMoralisLog);
      } else {
        const newMoralisLog = this.moralisLogRepository.create();
        newMoralisLog.name = 'opensea-api-parse-error';
        newMoralisLog.token = metadata;
        await this.moralisLogRepository.save(newMoralisLog);
      }
      this.logger.error(error);
    }
  }

  private getFileExtension(url) {
    const components = url.split('.');
    if (Array.isArray(components) && components.length >= 3) {
      const extension = components[components.length - 1];
      if (extension.length <= 7) return `.${extension}`;
    }
    return '';
  }

  private async uploadAssert(url) {
    console.log(this.getFileExtension(url));
    const filename = `${await this.generateRandomHash()}${this.getFileExtension(url)}`;
    const downloadPath = `uploads/${filename}`;
    const downloader = new Downloader({
      url: url,
      directory: 'uploads',
      fileName: filename,
      maxAttempts: 3,
    });

    try {
      await downloader.download();
    } catch (err) {
      console.log({ url });
      console.log(err);
      throw new OpenSeaNftImageSupportedError();
    }
    const s3Result = await this.s3Service.uploadDocument(downloadPath, filename);
    await this.fileSystemService.removeFile(downloadPath);
    return s3Result.url;
  }

  private async generateRandomHash(length = 24): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(length, (err, buf) => {
        if (err) {
          reject(err);
        } else {
          resolve(buf.toString('hex'));
        }
      });
    });
  }
}
