import { HttpService, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import Moralis from 'moralis/node';
import { customAlphabet } from 'nanoid';
import Downloader from 'nodejs-file-downloader';

import { AppConfig } from '../configuration/configuration.service';
import { QueueService } from '../queue/queue.service';

import { S3Service } from '../file-storage/s3.service';
import { Nft, NftSource } from '../nft/domain/nft.entity';
import { CollectionSource, NftCollection } from '../nft/domain/collection.entity';
import { MonitoredNfts } from '../nft/domain/monitored-nfts';
import { User } from '../users/user.entity';
import { StandardNftMetadata } from '../nft/domain/standard-nft';

import { MoralisNft } from './model/moralis-nft';
import {
  NftMissingAttributesError,
  SkippedUniverseNftError,
  TokenUriFormatNotSupportedError,
} from './service/exceptions';
import { FileSystemService } from '../file-system/file-system.service';

const MORALIS_NEW_NFT_QUEUE = 'MORALIS_NEW_NFT_QUEUE';

@Injectable()
export class MoralisService {
  private logger = new Logger(MoralisService.name);

  constructor(
    private readonly config: AppConfig,
    private readonly queue: QueueService,
    private httpService: HttpService,
    private s3Service: S3Service,
    private fileSystemService: FileSystemService,
    @InjectRepository(Nft)
    private nftRepository: Repository<Nft>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(NftCollection)
    private nftCollectionRepository: Repository<NftCollection>,
    @InjectRepository(MonitoredNfts)
    private monitoredNftsRepository: Repository<MonitoredNfts>,
  ) {}

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
      this.checkNftHasAllAttributes(token);
      await this.checkNftIsNotUniverseContract(token.token_address);
      await this.checkNftIsNotCoreUniverseContract(token.token_address);

      const existingCollection = await this.findOrCreateCollection(token);
      let existingNft = await this.nftRepository.findOne({
        collectionId: existingCollection.id,
        tokenId: parseInt(token.token_id),
      });

      if (existingNft) {
        if (existingNft.owner !== token.owner_of.toLowerCase()) {
          existingNft = await this.changeNftOwner(existingNft, token);
        }
      } else {
        existingNft = await this.createNewNft(token, existingCollection);
      }
    } catch (error) {
      console.log(error);
    }

    cb(null, true);
  };

  private async createNewNft(token: MoralisNft, existingCollection: NftCollection) {
    let existingNft = this.nftRepository.create();
    const user = await this.userRepository.findOne({ where: { address: token.owner_of.toLowerCase() } });
    existingNft.userId = user.id;
    existingNft.collectionId = existingCollection.id;
    existingNft.source = NftSource.SCRAPER;
    const editionUUID = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)();

    const nftWithSimilarTokenUuid = await this.nftRepository.findOne({ where: { tokenUri: token.token_uri } });
    const numberOfEditions = nftWithSimilarTokenUuid ? nftWithSimilarTokenUuid.numberOfEditions + 1 : 1;
    existingNft.editionUUID = nftWithSimilarTokenUuid?.editionUUID || editionUUID;
    existingNft.numberOfEditions = numberOfEditions;

    existingNft.owner = token.owner_of.toLowerCase();
    existingNft.tokenId = parseInt(token.token_id);
    existingNft.tokenUri = token.token_uri;

    const metadata = await this.getTokenUriMetadata(token.token_uri);
    existingNft.name = metadata.name;
    existingNft.description = metadata.description;

    if (metadata.isImageOnIPFS()) {
      const ipfsImageUrl = this.routeIpfsUrlToMoralisIpfs(metadata.image);
      const filename = `${await this.generateRandomHash()}${metadata.getFileExtension()}`;
      const downloadPath = `uploads/${filename}`;
      const downloader = new Downloader({
        url: ipfsImageUrl,
        directory: 'uploads',
        fileName: filename,
      });
      await downloader.download();
      const s3Result = await this.s3Service.uploadDocument(downloadPath, filename);
      existingNft.artworkType = metadata.getFileExtension() && metadata.getFileExtension().split('.').slice(-1)[0];
      existingNft.url = s3Result.url;
      existingNft.optimized_url = s3Result.url;
      existingNft.thumbnail_url = s3Result.url;
      existingNft.original_url = metadata.image;
      await this.fileSystemService.removeFile(downloadPath);
      existingNft.properties = metadata.attributes?.map((attrObj) => ({
        [attrObj.trait_type]: attrObj.value,
      }));
      existingNft = await this.nftRepository.save(existingNft);
      if (numberOfEditions > 1) {
        await this.nftRepository.update({ tokenUri: token.token_uri }, { numberOfEditions });
      }
    } else if (metadata.isImageOnWeb()) {
      const filename = `${await this.generateRandomHash()}${metadata.getFileExtension()}`;
      const downloadPath = `uploads/${filename}`;
      const downloader = new Downloader({
        url: metadata.image,
        directory: 'uploads',
        fileName: filename,
      });
      await downloader.download();
      const s3Result = await this.s3Service.uploadDocument(downloadPath, filename);
      existingNft.artworkType = metadata.getFileExtension() && metadata.getFileExtension().split('.').slice(-1)[0];
      existingNft.url = s3Result.url;
      existingNft.optimized_url = s3Result.url;
      existingNft.thumbnail_url = s3Result.url;
      existingNft.original_url = metadata.image;
      await this.fileSystemService.removeFile(downloadPath);
      existingNft.properties = metadata.attributes?.map((attrObj) => ({
        [attrObj.trait_type]: attrObj.value,
      }));
      existingNft = await this.nftRepository.save(existingNft);
      if (numberOfEditions > 1) {
        await this.nftRepository.update({ tokenUri: token.token_uri }, { numberOfEditions });
      }
    }

    return existingNft;
  }

  private async changeNftOwner(existingNft: Nft, token: MoralisNft) {
    existingNft.owner = token.owner_of.toLowerCase();
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
      existingCollection.name = token.name;
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

  private checkNftHasAllAttributes(nft: MoralisNft) {
    const error = new NftMissingAttributesError();
    if (!nft.token_uri) throw error;
    if (!Number.isInteger(parseInt(nft.token_id))) throw error;
    if (!nft.token_address) throw error;
    if (!nft.owner_of) throw error;
    if (nft.contract_type !== 'ERC721') throw error;
  }

  private routeIpfsUrlToMoralisIpfs(url: string) {
    return 'https://ipfs.moralis.io:2053/ipfs/' + url.split('ipfs://ipfs/').slice(-1)[0];
  }

  private async getTokenUriMetadata(tokenUri: string) {
    if (tokenUri.startsWith('ipfs')) {
      const newTokenUri = this.routeIpfsUrlToMoralisIpfs(tokenUri);
      const { data } = await this.httpService.get(newTokenUri).toPromise();
      const metadata = new StandardNftMetadata(data);
      return metadata;
    } else if (tokenUri.startsWith('http')) {
      const { data } = await this.httpService.get(tokenUri).toPromise();
      const metadata = new StandardNftMetadata(data);
      return metadata;
    } else {
      throw new TokenUriFormatNotSupportedError(tokenUri);
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