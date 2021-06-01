import { Injectable } from '@nestjs/common';
import { promises as fsp } from 'fs';

@Injectable()
export class FileSystemService {
  async removeFile(sourcePath: string) {
    try {
      await fsp.unlink(sourcePath);
      return true;
    } catch {
      return false;
    }
  }

  async fileSize(sourcePath: string): Promise<number | undefined> {
    try {
      const stats = await fsp.stat(sourcePath);
      return stats.size;
    } catch {
      return undefined;
    }
  }
}
