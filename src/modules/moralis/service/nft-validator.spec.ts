import { Test, TestingModule } from '@nestjs/testing';
import { base64TokenUri } from './constants';
import { NftMissingAttributesError } from './exceptions';
import { NftValidator } from './nft-validator';

describe('AuthService', () => {
  let service: NftValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NftValidator],
    }).compile();

    service = module.get<NftValidator>(NftValidator);
  });

  it('should throw error if ERC1155', async () => {
    await expect(async () => {
      await service.checkNftHasAllAttributes({
        amount: '2',
        objectId: 'n7z1TXDyamqPmgVcmyAMHIcx',
        owner_of: '0x88b503c81a4fb9c9c5464dd3c6835fc34b2cc85d',
        token_id: '12',
        className: 'EthNFTOwners',
        createdAt: '2021-10-26T14:57:17.050Z',
        token_uri: 'ipfs://ipfs/QmNpi9NNtSSzXVM7UcnaaiRwAPcU3xdK2KWLAzzGznodWw',
        updatedAt: '2021-10-26T14:57:17.050Z',
        block_number: 12942108,
        contract_type: 'ERC1155',
        token_address: '0x76be3b62873462d2142405439777e971754e8e77',
      });
    }).rejects.toThrow(NftMissingAttributesError);
  });

  it('should parse base64 token uri', () => {
    expect(Object.keys(service.parseBase64TokenUri(base64TokenUri)).includes['name']).toBeTruthy();
  });
});
