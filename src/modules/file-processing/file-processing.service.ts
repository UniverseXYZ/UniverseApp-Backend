import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import crypto from 'crypto';

@Injectable()
export class FileProcessingService {
  public async optimiseFile(path: string, mimeType: string) {
    const optimisedPath = path;

    if (['image/jpeg', 'image/png'].includes(mimeType)) {
      const newPath = await this.generateNewPath(path);
      await this.optimiseImage(path, newPath);
      return newPath;
    } else if (['video/mp4'].includes(mimeType)) {
      const newPath = await this.generateNewPath(path);
      await this.optimiseVideo(path, newPath);
      return newPath;
    }

    return optimisedPath;
  }

  private async optimiseImage(sourcePath: string, destinationPath: string) {
    try {
      const promisifiedExec = promisify(exec);
      const command = `ffmpeg -i ${sourcePath} -q:v 16 -y ${destinationPath}`;
      const { stderr, stdout } = await promisifiedExec(command);
    } catch (error) {
      throw new Error('Failed to process image file');
    }
  }

  private async optimiseVideo(sourcePath: string, destinationPath: string) {
    try {
      const promisifiedExec = promisify(exec);
      const command = `ffmpeg -i ${sourcePath} -preset superfast -crf 28 -y ${destinationPath}`;
      const { stderr, stdout } = await promisifiedExec(command);
    } catch (error) {
      throw new Error('Failed to process image file');
    }
  }

  private async generateNewPath(oldPath: string) {
    const extension = path.extname(oldPath);
    const filename = path.basename(oldPath, extension);
    const newFileName = await this.generateRandomHash();

    return oldPath.replace(filename, newFileName);
  }

  private generateRandomHash = (length = 24): Promise<string> => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(length, (err, buf) => {
        if (err) {
          reject(err);
        } else {
          resolve(buf.toString('hex'));
        }
      });
    });
  };
}
