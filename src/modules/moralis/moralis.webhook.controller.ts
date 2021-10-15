import { Controller, Post, Request, Body } from '@nestjs/common';
import { MoralisService } from './moralis.service';

@Controller('api/webhook')
export class MoralisWebHookController {

  constructor(private moralisService: MoralisService) {}

  @Post()
  async handleNewNFTOwner(@Request() req, @Body() body) {
    const token = body.object;
    this.moralisService.addNewNFT(token);
    // object: {
    //   universe-backend              |       name: 'Do Androids dream in Electricity',
    //   universe-backend              |       symbol: '$ELEC',
    //   universe-backend              |       token_uri: 'https://arweave.net/wWb35WEjA-xMNF0eLAmSXY-opXVJl6AvOU3qB7ETiIA',
    //   universe-backend              |       token_id: '3',
    //   universe-backend              |       token_address: '0x2a7f55b1e9b68265f0a3bf59e4f6b52c94ab5fa0',
    //   universe-backend              |       owner_of: '0xe7c65f23d7e893fd5a334891e37a1857d143d52d',
    //   universe-backend              |       block_number: 9413916,
    //   universe-backend              |       amount: '1',
    //   universe-backend              |       contract_type: 'ERC721',
    //   universe-backend              |       className: 'EthNFTOwners'
    //   universe-backend              |     }
  }
}
