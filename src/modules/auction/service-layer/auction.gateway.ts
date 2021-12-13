
import { WebSocketGateway, OnGatewayInit, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server } from 'socket.io';


@WebSocketGateway(3001) //todo .env
export class AuctionGateway implements OnGatewayInit, OnGatewayConnection {

  @WebSocketServer()
   server: Server;

  afterInit(server: any) {
    console.log('Gateway is up and running')
  }

  handleConnection(client: any, ...args: any[]) {
      client.emit('connection', 'Successfully connected.')
  }

  public notifyBids(auctionId: number, bids: any): void {
      this.server.sockets.emit('bids_' + auctionId, bids);
  }

  public notifyAuctionStatus() {
      
  }
}