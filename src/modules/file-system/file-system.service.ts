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

  decodeBase64(dataString: string) {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (matches.length !== 3) {
      throw new Error('Invalid input string');
    }

    return {
      type: matches[1],
      data: Buffer.from(matches[2], 'base64'),
    };
  }
}
