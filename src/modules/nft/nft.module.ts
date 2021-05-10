import { Module } from '@nestjs/common';
import { NftService } from './service_layer/nft.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nft } from './domain/nft.entity';
import { NftController } from './entrypoints/nft.controller';

@Module({
  providers: [
    NftService,
  ],
  imports: [    TypeOrmModule.forFeature([Nft]),
  ],
  exports: [],
  controllers: [NftController],
})
export class NftModule {}
