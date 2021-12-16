import { Injectable } from '@nestjs/common';
import { MoralisNft } from '../model/moralis-nft';
import { NftMissingAttributesError, TokenUriFormatNotSupportedError } from './exceptions';

@Injectable()
export class NftValidator {
  public checkNftHasAllAttributes(nft: Partial<MoralisNft>) {
    const error = new NftMissingAttributesError();
    if (!nft.token_id) throw error;
    if (!nft.token_address) throw error;
    if (!nft.owner_of) throw error;
    if (nft.contract_type !== 'ERC721' && nft.contract_type !== 'ERC1155') throw error;
  }

  public parseBase64TokenUri(tokenUri: string) {
    const dataAsBase64Components = tokenUri.split('data:application/json;base64,');
    if (dataAsBase64Components.length <= 1) {
      throw new TokenUriFormatNotSupportedError(tokenUri);
    }
    const dataAsBase64 = dataAsBase64Components[1];
    return JSON.parse(Buffer.from(dataAsBase64, 'base64').toString());
  }
}
