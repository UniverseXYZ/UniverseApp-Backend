import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../configuration/configuration.module';
import { NftCollection } from '../nft/domain/collection.entity';
import { Nft } from '../nft/domain/nft.entity';
import { QueueModel } from '../queue/queue.model';
import { User } from '../users/user.entity';
import { MoralisService } from './moralis.service';
import { MoralisWebHookController } from './moralis.webhook.controller';

@Module({
  imports: [AppConfigModule, QueueModel, HttpModule, TypeOrmModule.forFeature([Nft, NftCollection, User])],
  providers: [MoralisService],
  exports: [MoralisService],
  controllers: [MoralisWebHookController],
})
export class MoralisModule {}
