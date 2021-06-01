import { Module } from '@nestjs/common';
import { FileProcessingService } from './file-processing.service';
import { FileSystemModule } from '../file-system/file-system.module';

@Module({
  providers: [FileProcessingService],
  exports: [FileProcessingService],
  imports: [FileSystemModule],
})
export class FileProcessingModule {}
