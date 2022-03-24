import { Injectable } from '@nestjs/common';
import { AppConfig } from '../configuration/configuration.service';
import { Contract, ethers } from 'ethers';
import UniverseCoreAbi from '../../abis/UniverseCoreAbi.json';

@Injectable()
export class EthersService {
  public provider;
  public wallet;
  constructor(private config: AppConfig) {
    const network: ethers.providers.Networkish = this.config.values.ethereum.ethereumNetwork;
    const quorum = Number(this.config.values.ethereum.quorum);

    const projectSecret: string = this.config.values.ethereum.infuraProjectId;
    const projectId: string = this.config.values.ethereum.infuraProjectSecret;
    const infuraProvider: ethers.providers.InfuraProvider =
      projectId && projectSecret
        ? new ethers.providers.InfuraProvider(network, {
            projectId: projectId,
            projectSecret: projectSecret,
          })
        : undefined;

    const alchemyToken: string = this.config.values.ethereum.alchemyToken;
    const alchemyProvider: ethers.providers.AlchemyProvider = alchemyToken
      ? new ethers.providers.AlchemyProvider(network, alchemyToken)
      : undefined;

    const chainstackUrl: string = this.config.values.ethereum.chainstackUrl;
    const chainStackProvider: ethers.providers.JsonRpcProvider = chainstackUrl
      ? new ethers.providers.JsonRpcProvider(chainstackUrl, network)
      : undefined;


    const quicknodeUrl: string = this.configService.get('quicknode_url');
    const quicknodeProvider: ethers.providers.JsonRpcProvider = quicknodeUrl
      ? new ethers.providers.JsonRpcProvider(quicknodeUrl, network)
      : undefined;

    if (!infuraProvider && !alchemyProvider && !chainStackProvider && !quicknodeProvider) {
      throw new Error(
        'Infura project id and secret or alchemy token or chainstack url is not defined',
      );
    }

    const allProviders: ethers.providers.BaseProvider[] = [infuraProvider, alchemyProvider, chainStackProvider, quicknodeProvider];
    const definedProviders: ethers.providers.BaseProvider[] = allProviders.filter((x) => x !== undefined);

    const ethersProvider: ethers.providers.FallbackProvider = new ethers.providers.FallbackProvider(
      definedProviders,
      quorum,
    );

    this.provider = ethersProvider;
    if (this.config.values.ethereum.beWalletPK) {
      this.wallet = new ethers.Wallet(this.config.values.ethereum.beWalletPK, this.provider);
    }
  }

  async verifySignature(message: string, signature: string) {
    const signingAddress = ethers.utils.verifyMessage(message, signature);
    return signingAddress;
  }

  async signMessage(message: string) {
    const signature = await this.wallet.signMessage(message);
    return signature;
  }

  async getCollectionOwner(collectionAddress: string) {
    const collectionContract = new Contract(collectionAddress, UniverseCoreAbi, this.provider);
    const owner = await collectionContract.owner();

    return owner;
  }
}
