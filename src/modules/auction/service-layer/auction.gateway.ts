
import { 
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { User } from 'src/modules/users/user.entity';
import { Auction } from '../domain/auction.entity';
import { configValues } from '../../configuration';



@WebSocketGateway(configValues.app.auctionsPort)
export class AuctionGateway implements OnGatewayInit, OnGatewayConnection {

  @WebSocketServer()
   server: Server;

  afterInit() {
    console.log('Gateway is up and running')
  }

  handleConnection(client: any, ...args: any[]) {
      client.emit('connection', 'Successfully connected.')
  }

  public notifyBids(auctionId: number, bids: { user: User; auctionId: number; amount: number; }): void {
      this.server.sockets.emit('bids_' + auctionId, bids);
  }

  public notifyAuctionStatus(auction: Auction) {
      this.server.sockets.emit('auction_' + auction.id, auction); 
  }
}