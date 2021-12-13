import {
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuctionBid } from '../domain/auction.bid.entity';

@WebSocketGateway({ namespace: 'auctions-socket' })
export class AuctionGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('MessageGateway');
  afterInit() {
    console.log('Auctions WS Gateway is up and running');
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

  public notifyAuctionCanceled(auctionId: number) {
    this.server.emit(`auction_${auctionId}_canceled`);
  }

  public notifyAuctionDepositedNfts(auctionId: number) {
    this.server.emit(`auction_${auctionId}_depositedNfts`);
  }

  public notifyAuctionWithdrawnNfts(auctionId: number, hasWithdrawnAll: boolean) {
    this.server.emit(`auction_${auctionId}_withdrawnNfts`, { hasWithdrawnAll });
  }
  public notifyAuctionBidSubmitted(auctionId: number, bidInfo: { user: any; amount: number }) {
    this.server.emit(`auction_${auctionId}_bidSubmitted`, bidInfo);
  }

  public notifyAuctionRevenueWithdraw(auctionId, totalRevenue: number, recipient: string) {
    this.server.emit(`auction_${auctionId}_withdrawnRevenue`, { totalRevenue, recipient });
  }

  public notifyAuctionSlotCaptured(auctionId, captureInfo: { tierId: number; slotIndex: number }) {
    this.server.emit(`auction_${auctionId}_capturedSlot`, captureInfo);
  }

  public notifyAuctionBidWithdrawn(auctionId: number, bidInfo: { user: any; amount: number }) {
    this.server.emit(`auction_${auctionId}_bidWithdrawn`, bidInfo);
  }

  public notifyBidMatched(auctionId: number, info: { bids: AuctionBid[]; finalised: boolean }) {
    this.server.emit(`auction_${auctionId}_bidMatched`, info);
  }

  public notifyAuctionExtended(auctionId: number, endDate: Date) {
    this.server.emit(`auction_${auctionId}_extended`, { endDate });
  }

  public notifyERC721Claimed(auctionId: number, nftInfo: { claimer: string; slotIndex: number }) {
    this.server.emit(`auction_${auctionId}_ERC721Claimed`, nftInfo);
  }
}
