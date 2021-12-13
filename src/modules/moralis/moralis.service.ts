import { HttpService, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as crypto from 'crypto';
import Moralis from 'moralis/node';
import { customAlphabet } from 'nanoid';
import Downloader from 'nodejs-file-downloader';

import { AppConfig } from '../configuration/configuration.service';
import { QueueService } from '../queue/queue.service';

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
} from './service/exceptions';
import { FileSystemService } from '../file-system/file-system.service';
import { NftValidator } from './service/nft-validator';

const MORALIS_NEW_NFT_QUEUE = 'MORALIS_NEW_NFT_QUEUE';
const OPENSEA_RINKEBY_API_URL = 'https://rinkeby-api.opensea.io/api/v1/asset';
const OPENSEA_ETH_API_URL = 'https://api.opensea.io/api/v1/asset';
const MORALIS_IPFS_SERVER_URL = 'https://ipfs.moralis.io:2053/ipfs/';

enum MetaDataApiCallType {
  TOKEN_URI = 1,
  OPENSEA = 2,
}
@Injectable()
export class MoralisService {
  private logger = new Logger(MoralisService.name);

  constructor(
    private readonly config: AppConfig,
    private readonly queue: QueueService,
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
    let idsToDelete = [];
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
            idsToDelete.push(log.id);
            if (idsToDelete.length > 100) {
              await this.moralisLogRepository.delete({ id: In(idsToDelete) });
              idsToDelete = [];
            }
          } catch (error) {
            this.logger.error(`retry ${log.id} ${error}`);
            continue;
          }
        }
      }

      if (logs.length < take) keepLooping = false;
      skip = skip + take;
    }
    await this.moralisLogRepository.delete({ id: In(idsToDelete) });
  }

  async getHistory(start: number, end: number) {
    let skip = 0;
    const pageSize = 500;
    let keepLooping = true;
    while (keepLooping) {
      console.log(`Fetch NFTs from ${skip} to ${skip + pageSize}`);
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
        console.log(err);
      }

      if (results.length < pageSize) keepLooping = false;
      for (const token of results) {
        this.addNewNFT(token);
      }
      skip += pageSize;
    }
  }

  async onModuleInit() {
    Moralis.serverURL = this.config.values.moralis.serverUrl;
    Moralis.masterKey = this.config.values.moralis.masterKey;
    Moralis.initialize(this.config.values.moralis.applicationId);
    this.queue.initQueue(MORALIS_NEW_NFT_QUEUE, this.moralisNewNFTOwnerHandler, 1);
  }

  addNewUserToWatchAddress = async (address: string) => {
    Moralis.Cloud.run('watchEthAddress', {
      address,
      chainId: this.config.values.ethereum.ethereumNetwork === 'rinkeby' ? '0x4' : '0x1',
      sync_historical: true,
    });
  };

  async addNewNFT(token) {
    this.queue.pushToQueue(MORALIS_NEW_NFT_QUEUE, { token });
  }

  moralisNewNFTOwnerHandler = async (input: any, cb: any) => {
    const { token }: { token: MoralisNft } = input;
    this.logger.log(token);

    try {
      await this.processToken(token);
    } catch (error) {
      if (
        error instanceof NftMissingAttributesError ||
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
      console.log(error);
    }

    cb(null, true);
  };

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
      existingNft = await this.createNewNft(token, existingCollection);
    }
  }

  private getTokenUri(token: MoralisNft) {
    if (token.token_uri.includes('0x{id}')) {
      return token.token_uri.replace('0x{id}', token.token_id); //Cyber Girls
    } else if (token.token_uri.includes('{id}')) {
      return token.token_uri.replace('{id}', token.token_id); //Fluf erc-1155
    } else {
      return token.token_uri;
    }
  }

  private async parseNewNFTMetaData(
    existingNft: Nft,
    token: MoralisNft,
    numberOfEditions,
    _apiCallType: MetaDataApiCallType = MetaDataApiCallType.TOKEN_URI,
  ) {
    if (!!token.token_uri) {
      const { apiCallType, metadata } = await this.getTokenUriMetaData(existingNft.tokenUri, token, _apiCallType);
      existingNft.name = metadata.name;
      existingNft.description = metadata.description;

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
          if (apiCallType !== MetaDataApiCallType.OPENSEA) {
            return await this.parseNewNFTMetaData(existingNft, token, numberOfEditions, MetaDataApiCallType.OPENSEA);
          } else {
            throw new OpenSeaNftImageSupportedError();
          }
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
          if (apiCallType !== MetaDataApiCallType.OPENSEA) {
            return await this.parseNewNFTMetaData(existingNft, token, numberOfEditions, MetaDataApiCallType.OPENSEA);
          } else {
            throw new OpenSeaNftImageSupportedError();
          }
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
          if (apiCallType !== MetaDataApiCallType.OPENSEA) {
            return await this.parseNewNFTMetaData(existingNft, token, numberOfEditions, MetaDataApiCallType.OPENSEA);
          } else {
            throw new OpenSeaNftImageSupportedError();
          }
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

  private async getTokenMetaDataWithOpenSeaAPI(token: MoralisNft) {
    if (token.token_id == undefined || token.token_address == undefined) {
      throw new TokenAssertAddressNotSupportedError();
    } else {
      const openSeaApiUri =
        this.config.values.ethereum.ethereumNetwork === 'rinkeby' ? OPENSEA_RINKEBY_API_URL : OPENSEA_ETH_API_URL;
      const headers =
        this.config.values.ethereum.ethereumNetwork === 'rinkeby'
          ? {}
          : { 'X-API-KEY': this.config.values.opensea.apiKey };
      const { data } = await this.httpService
        .get(`${openSeaApiUri}/${token.token_address}/${token.token_id}`, {
          headers,
        })
        .toPromise();

      const metadata = new StandardNftMetadata(data);
      return metadata;
    }
  }

  private async getTokenUriMetaData(
    tokenUri: string,
    token: MoralisNft,
    apiCallType: MetaDataApiCallType = MetaDataApiCallType.TOKEN_URI,
  ) {
    if (apiCallType === MetaDataApiCallType.OPENSEA) {
      return {
        apiCallType: MetaDataApiCallType.OPENSEA,
        metadata: await this.getTokenMetaDataWithOpenSeaAPI(token),
      };
    }
    try {
      if (tokenUri.startsWith('ipfs')) {
        const normalizedTokenUri = this.routeIpfsUrlToMoralisIpfs(tokenUri);
        const { data } = await this.httpService.get(normalizedTokenUri).toPromise();
        const metadata = new StandardNftMetadata(data);
        return { apiCallType: MetaDataApiCallType.TOKEN_URI, metadata };
      } else if (tokenUri.startsWith('http')) {
        const normalizedTokenUri = tokenUri;
        const { data } = await this.httpService.get(normalizedTokenUri).toPromise();
        const metadata = new StandardNftMetadata(data);
        return { apiCallType: MetaDataApiCallType.TOKEN_URI, metadata };
      } else if (tokenUri.startsWith('data:application/json;base64,')) {
        const data = this.nftValidator.parseBase64TokenUri(tokenUri);
        const metadata = new StandardNftMetadata(data);
        return { apiCallType: MetaDataApiCallType.TOKEN_URI, metadata };
      } else {
        throw new TokenUriFormatNotSupportedError(tokenUri);
      }
    } catch {
      return {
        apiCallType: MetaDataApiCallType.OPENSEA,
        metadata: await this.getTokenMetaDataWithOpenSeaAPI(token),
      };
    }
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
