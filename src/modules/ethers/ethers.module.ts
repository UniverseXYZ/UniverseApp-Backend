import { Module } from '@nestjs/common';
import { AppConfigModule } from '../configuration/configuration.module';
import { EthersService } from './ethers.service';

@Module({
  imports: [AppConfigModule],
  providers: [EthersService],
  exports: [EthersService],
})
export class EthersModule {}
