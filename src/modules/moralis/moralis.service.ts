import { HttpService, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { In, Repository } from 'typeorm';
import * as crypto from 'crypto';
import Moralis from 'moralis/node';
import { customAlphabet } from 'nanoid';
import Downloader from 'nodejs-file-downloader';

import { AppConfig } from '../configuration/configuration.service';

import { S3Service } from '../file-storage/s3.service';
import { Nft, NftSource } from '../nft/domain/nft.entity';
import { MoralisLog } from './domain/moralis-log.entity';
import { CollectionSource, NftCollection } from '../nft/domain/collection.entity';
import { MonitoredNfts } from '../nft/domain/monitored-nfts';
import { User } from '../users/user.entity';
import { StandardNftMetadata } from '../nft/domain/standard-nft';

import { MoralisNft } from './model/moralis-nft';
import {
  NftMissingAttributesError,
  SkippedUniverseNftError,
  TokenUriFormatNotSupportedError,
  ImageUriFormatNotSupportedError,
  TokenAssertAddressNotSupportedError,
  OpenSeaNftImageSupportedError,
  ImageDownloadError,
} from './service/exceptions';
import { FileSystemService } from '../file-system/file-system.service';
import { NftValidator } from './service/nft-validator';
import {
  MORALIS_NEW_NFT_QUEUE,
  MORALIS_IPFS_SERVER_URL,
  PROCESS_MORALIS_TOKEN_JOB,
  OPENSEA_NFT_QUEUE,
  PROCCESS_OPENSEA_NFT,
} from './constants';
@Injectable()
export class MoralisService {
  private logger = new Logger(MoralisService.name);

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
    @InjectQueue(MORALIS_NEW_NFT_QUEUE)
    private readonly moralisNftQueue: Queue,
    @InjectQueue(OPENSEA_NFT_QUEUE)
    private readonly openseaNftQueue: Queue,
  ) {}

  private routeIpfsUrlImageIpfs(url: string) {
    if (url.includes('ipfs://ipfs/')) {
      return 'https://ipfs.io/ipfs/' + url.split('ipfs://ipfs/').slice(-1)[0];
    }
    return 'https://ipfs.io/ipfs/' + url.split('ipfs://').slice(-1)[0];
  }

  private routeIpfsUrlToMoralisIpfs(url: string) {
    if (url.includes('ipfs://ipfs/')) {
      return MORALIS_IPFS_SERVER_URL + url.split('ipfs://ipfs/').slice(-1)[0];
    }
    return MORALIS_IPFS_SERVER_URL + url.split('ipfs://').slice(-1)[0];
  }

  async retryAll() {
    const take = 100;
    let keepLooping = true;
    let skip = 0;
    this.logger.log('retry');

    while (keepLooping) {
      const logs = await this.moralisLogRepository.find({
        take,
        skip: skip,
      });
      this.logger.log(`retry logs from ${skip} to ${skip + take}`);

      for (const log of logs) {
        if (log.token && log.token.symbol) {
          try {
            await this.processToken(log.token);
            await this.moralisLogRepository.delete({ id: log.id });
            console.log('remove successfully', log.token);
          } catch (error) {
            this.logger.error(`retry ${log.id} ${error}`);
            continue;
          }
        }
      }

      if (logs.length < take) keepLooping = false;
      skip = skip + take;
    }
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getHistory(start: number, end: number) {
    let skip = 0;
    const pageSize = 500;
    let keepLooping = true;
    while (keepLooping) {
      this.logger.log(`Fetch NFTs from ${skip} to ${skip + pageSize}`);
      const params = {
        start: start,
        end: end,
        skip: skip,
        limit: pageSize,
      };
      let results = [];
      try {
        results = await Moralis.Cloud.run('fetchEthNFTOwners', params);
      } catch (err) {
        this.logger.log(err);
      }

      if (results.length < pageSize) keepLooping = false;
      for (const token of results) {
        await this.addNewNFT(token);
      }
      while (true) {
        const queueCount = await this.moralisNftQueue.count();
        const queueCount1 = await this.openseaNftQueue.count();
        if (queueCount < 1000 && queueCount1 < 10000) break;
        this.logger.debug(`Current position is ${skip}, moralis=${queueCount}, opensea=${queueCount1}`);
        await this.sleep(20000);
      }
      skip += pageSize;
    }
  }

  async onModuleInit() {
    await Moralis.start({
      serverUrl: this.config.values.moralis.serverUrl,
      appId: this.config.values.moralis.applicationId,
      masterKey: this.config.values.moralis.masterKey,
    });
  }

  addNewUserToWatchAddress = async (address: string) => {
    await Moralis.Cloud.run(
      'watchEthAddress',
      {
        address,
        chainId: this.config.values.ethereum.ethereumNetwork === 'rinkeby' ? '0x4' : '0x1',
        sync_historical: true,
      },
      { useMasterKey: true },
    );
  };

  async addNewNFT(token) {
    this.logger.log('Add new nft to the moralis queue', token);
    await this.moralisNftQueue.add(PROCESS_MORALIS_TOKEN_JOB, { token });
  }

  public async moralisNewNFTOwnerHandler(input: any) {
    const { token }: { token: MoralisNft } = input;

    try {
      await this.processToken(token);
    } catch (err) {
      this.logger.error(err);
    }
  }

  private async processToken(token: MoralisNft) {
    this.nftValidator.checkNftHasAllAttributes(token);

    const existingCollection = await this.findOrCreateCollection(token);
    let existingNft = await this.nftRepository.findOne({
      collectionId: existingCollection.id,
      tokenId: token.token_id,
    });

    if (existingNft) {
      if (existingNft.owner !== token.owner_of.toLowerCase()) {
        existingNft = await this.changeNftOwner(existingNft, token);
      }
    } else {
      // create only non-Universe NFTs
      await this.checkNftIsNotUniverseContract(token.token_address);
      await this.checkNftIsNotCoreUniverseContract(token.token_address);

      try {
        existingNft = await this.createNewNft(token, existingCollection);
        this.logger.log(`Scraped token successfully {${token.token_address} - ${token.token_id}}`);
      } catch (error) {
        await this.openseaNftQueue.add(PROCCESS_OPENSEA_NFT, {
          tokenAddress: token.token_address,
          amount: token.amount,
          tokenId: token.token_id,
          collectionId: existingCollection.id,
        });
        if (
          error instanceof NftMissingAttributesError ||
          error instanceof ImageDownloadError ||
          error instanceof TokenUriFormatNotSupportedError ||
          error instanceof ImageUriFormatNotSupportedError ||
          error instanceof OpenSeaNftImageSupportedError ||
          error instanceof TokenAssertAddressNotSupportedError
        ) {
          const newMoralisLog = this.moralisLogRepository.create();
          newMoralisLog.name = error.name;
          newMoralisLog.token = token;
          await this.moralisLogRepository.save(newMoralisLog);
        } else if (!(error instanceof SkippedUniverseNftError)) {
          const newMoralisLog = this.moralisLogRepository.create();
          newMoralisLog.name = 'Unknown';
          newMoralisLog.token = token;
          await this.moralisLogRepository.save(newMoralisLog);
        }
      }
    }
  }

  private getTokenUri(token: MoralisNft) {
    if (token.token_uri.includes('opensea')) {
      throw new TokenUriFormatNotSupportedError('opensea nft');
    } else if (token.token_uri.includes('0x{id}')) {
      return token.token_uri.replace('0x{id}', token.token_id); //Cyber Girls
    } else if (token.token_uri.includes('{id}')) {
      return token.token_uri.replace('{id}', token.token_id); //Fluf erc-1155
    } else {
      return token.token_uri;
    }
  }

  private async parseNewNFTMetaData(existingNft: Nft, token: MoralisNft, numberOfEditions) {
    if (!!token.token_uri) {
      const metadata = await this.getTokenUriMetaData(existingNft.tokenUri);
      existingNft.name = metadata.name;
      existingNft.description = metadata.description;
      existingNft.external_link = metadata.external_url;

      if (metadata.isImageOnIPFS()) {
        const ipfsImageUrl = this.routeIpfsUrlImageIpfs(metadata.getImage());
        const filename = `${await this.generateRandomHash()}${metadata.getFileExtension()}`;
        const downloadPath = `uploads/${filename}`;
        const downloader = new Downloader({
          url: ipfsImageUrl,
          directory: 'uploads',
          fileName: filename,
        });

        try {
          await downloader.download();
        } catch (err) {
          throw new ImageDownloadError(ipfsImageUrl);
        }
        const s3Result = await this.s3Service.uploadDocument(downloadPath, filename);
        existingNft.artworkType = metadata.getFileExtension() && metadata.getFileExtension().split('.').slice(-1)[0];
        existingNft.url = s3Result.url;
        existingNft.optimized_url = s3Result.url;
        existingNft.thumbnail_url = s3Result.url;
        existingNft.original_url = metadata.getImage();
        await this.fileSystemService.removeFile(downloadPath);

        existingNft.properties = metadata.getNormalizedAttributes();

        existingNft = await this.nftRepository.save(existingNft);
        if (numberOfEditions > 1) {
          await this.nftRepository.update({ tokenUri: token.token_uri }, { numberOfEditions });
        }
      } else if (metadata.isImageOnWeb()) {
        const filename = `${await this.generateRandomHash()}${metadata.getFileExtension()}`;
        const downloadPath = `uploads/${filename}`;
        const downloader = new Downloader({
          url: metadata.getImage(),
          directory: 'uploads',
          fileName: filename,
        });

        try {
          await downloader.download();
        } catch (err) {
          throw new ImageDownloadError(metadata.getImage());
        }
        const s3Result = await this.s3Service.uploadDocument(downloadPath, filename);
        existingNft.artworkType = metadata.getFileExtension() && metadata.getFileExtension().split('.').slice(-1)[0];
        existingNft.url = s3Result.url;
        existingNft.optimized_url = s3Result.url;
        existingNft.thumbnail_url = s3Result.url;
        await this.fileSystemService.removeFile(downloadPath);
        existingNft.properties = metadata.getNormalizedAttributes();
        existingNft = await this.nftRepository.save(existingNft);
        if (numberOfEditions > 1) {
          await this.nftRepository.update({ tokenUri: token.token_uri }, { numberOfEditions });
        }
      } else if (metadata.isImageBase64Image) {
        let decoded;
        try {
          decoded = this.fileSystemService.decodeBase64(metadata.getImage());
        } catch (err) {
          throw new OpenSeaNftImageSupportedError();
        }
        const extension = decoded.type.split('/')[1].split('+')[0];
        const filename = `${await this.generateRandomHash()}.${extension}`;
        const s3Result = await this.s3Service.uploadBuffer(decoded.data, filename);
        existingNft.artworkType = extension;
        existingNft.url = s3Result.url;
        existingNft.optimized_url = s3Result.url;
        existingNft.thumbnail_url = s3Result.url;
        existingNft.original_url = s3Result.url;
        existingNft.properties = metadata.getNormalizedAttributes();
        existingNft = await this.nftRepository.save(existingNft);
        if (numberOfEditions > 1) {
          await this.nftRepository.update({ tokenUri: token.token_uri }, { numberOfEditions });
        }
      } else {
        throw new ImageUriFormatNotSupportedError(metadata);
      }
    }

    return existingNft;
  }

  private async createNewNft(token: MoralisNft, existingCollection: NftCollection) {
    const existingNft = this.nftRepository.create();
    const user = await this.userRepository.findOne({ where: { address: token.owner_of.toLowerCase() } });
    existingNft.userId = user?.id;
    if (token.contract_type === 'ERC1155') {
      existingNft.amount = Number(token.amount);
    }
    existingNft.collectionId = existingCollection.id;
    existingNft.source = NftSource.SCRAPER;
    const editionUUID = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)();

    const nftWithSimilarTokenUuid = await this.nftRepository.findOne({ where: { tokenUri: token.token_uri } });
    const numberOfEditions = nftWithSimilarTokenUuid ? nftWithSimilarTokenUuid.numberOfEditions + 1 : 1;
    existingNft.editionUUID = nftWithSimilarTokenUuid?.editionUUID || editionUUID;
    existingNft.numberOfEditions = numberOfEditions;

    existingNft.owner = token.owner_of.toLowerCase();
    existingNft.tokenId = token.token_id;
    existingNft.standard = token.contract_type;
    existingNft.tokenUri = this.getTokenUri(token);

    return this.parseNewNFTMetaData(existingNft, token, numberOfEditions);
  }

  private async changeNftOwner(existingNft: Nft, token: MoralisNft) {
    existingNft.owner = token.owner_of.toLowerCase();
    existingNft.amount = Number(token.amount);
    existingNft = await this.nftRepository.save(existingNft);
    return existingNft;
  }

  private async findOrCreateCollection(token: MoralisNft) {
    let existingCollection = await this.nftCollectionRepository.findOne({
      where: { address: token.token_address.toLowerCase() },
    });
    if (!existingCollection) {
      existingCollection = this.nftCollectionRepository.create();
      existingCollection.source = CollectionSource.SCRAPER;
      existingCollection.address = token.token_address.toLowerCase();
      existingCollection.name = token.name ? token.name : '';
      existingCollection.symbol = token.symbol;
      existingCollection.publicCollection = false;
      existingCollection = await this.nftCollectionRepository.save(existingCollection);
    }
    return existingCollection;
  }

  /**
   * The Universe backend fetches only non-Universe NFTs from Moralis in order to don't overlap with the Universe scraper
   * @param address
   */
  private async checkNftIsNotUniverseContract(address: string) {
    const monitoredNft = await this.monitoredNftsRepository
      .createQueryBuilder()
      .where('LOWER(address) LIKE :address', { address: address.toLowerCase() })
      .getOne();
    if (monitoredNft) {
      throw new SkippedUniverseNftError(address);
    }
  }

  private async checkNftIsNotCoreUniverseContract(address: string) {
    const coreCollection = await this.nftCollectionRepository.findOne({ where: { address, publicCollection: true } });
    if (coreCollection) {
      throw new SkippedUniverseNftError(address);
    }
  }

  private async getTokenUriMetaData(tokenUri) {
    try {
      if (tokenUri.startsWith('ipfs')) {
        const normalizedTokenUri = this.routeIpfsUrlToMoralisIpfs(tokenUri);
        const { data } = await this.httpService.get(normalizedTokenUri).toPromise();
        const metadata = new StandardNftMetadata(data);
        return metadata;
      } else if (tokenUri.startsWith('http')) {
        const normalizedTokenUri = tokenUri;
        const { data } = await this.httpService.get(normalizedTokenUri).toPromise();
        const metadata = new StandardNftMetadata(data);
        return metadata;
      } else if (tokenUri.startsWith('data:application/json;base64,')) {
        const data = this.nftValidator.parseBase64TokenUri(tokenUri);
        const metadata = new StandardNftMetadata(data);
        return metadata;
      }
    } catch (err) {
      throw new TokenUriFormatNotSupportedError(tokenUri);
    }
    throw new TokenUriFormatNotSupportedError(tokenUri);
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
