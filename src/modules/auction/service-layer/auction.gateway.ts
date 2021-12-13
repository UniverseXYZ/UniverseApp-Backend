import {
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { configValues } from '../../configuration';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

@WebSocketGateway(configValues.app.auctionsPort, { namespace: 'auction' })
export class AuctionGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('MessageGateway');
  afterInit() {
    console.log('Gateway is up and running');
  }

  public handleDisconnect(client: Socket): void {
    return this.logger.log(`Client disconnected: ${client.id}`);
  }

  public handleConnection(client: Socket): void {
    return this.logger.log(`Client connected: ${client.id}`);
  }

  public notifyAuctionStatus(auctionId: number, statuses: { status: string; value: boolean }[]) {
    this.server.emit(`auction_${auctionId}_status`, { statuses: statuses });
  }

  public notifyAuctionCreated(auctionId: number, onChainId: number) {
    this.server.emit(`auction_${auctionId}_created`, { onChainId: onChainId });
  }
}
