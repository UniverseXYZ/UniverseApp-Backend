import { Injectable } from '@nestjs/common';
import { AppConfig } from '../configuration/configuration.service';
import { ethers } from 'ethers';

@Injectable()
export class EthersService {
  public provider;
  public wallet;
  constructor(private config: AppConfig) {
    this.provider = ethers.getDefaultProvider(this.config.values.ethereum.ethereumNetwork, {
      infura: {
        projectId: this.config.values.ethereum.infuraProjectId,
        projectSecret: this.config.values.ethereum.infuraProjectSecret,
      },
    });

    this.wallet = new ethers.Wallet(this.config.values.ethereum.beWalletPK, this.provider);
  }

  async verifySignature(message: string, signature: string) {
    const signingAddress = ethers.utils.verifyMessage(message, signature);
    return signingAddress;
  }

  async signMessage(message: string) {
    const signature = await this.wallet.signMessage(message);
    return signature;
  }
}