import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { ProcessedFile } from './model/ProcessedFile';
import { FileSystemService } from '../file-system/file-system.service';

@Injectable()
export class FileProcessingService {
  constructor(private fileSystemService: FileSystemService) {}

  private logger = new Logger(FileProcessingService.name);

  public async downsizeFile(sourcePath: string, mimeType: string) {
    this.logger.log('Starting to downsize file');
    const file = ProcessedFile.create(
      sourcePath,
      path.basename(sourcePath, path.extname(sourcePath)),
      path.extname(sourcePath),
    );

    const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(mimeType);

    if (!isImage) {
      return file;
    }

    const image = sharp(file.path);
    const metadata = await image.metadata();
    const fileSize = await this.fileSystemService.fileSize(file.path);

    if (metadata.height > 400 && fileSize > 400 * 1024) {
      const newFile = await this.fileWithNewPath(file);
      await image
        .resize({ height: 400 })
        .jpeg({ progressive: true, force: false, quality: 90 })
        .png({ progressive: true, force: false, quality: 90 })
        .toFile(newFile.path);
      return newFile;
    }

    this.logger.log('Downsized file successfully');
    return file;
  }

  public async optimiseFile(sourcePath: string, mimeType: string) {
    const file = ProcessedFile.create(
      sourcePath,
      path.basename(sourcePath, path.extname(sourcePath)),
      path.extname(sourcePath),
    );

    if (['image/jpeg', 'image/png'].includes(mimeType)) {
      const fileSize = await this.fileSystemService.fileSize(file.path);

      if (fileSize > 400 * 1024) {
        const newFile = await this.fileWithNewPath(file);
        await this.optimiseImage(file.path, newFile.path, mimeType);
        return newFile;
      }

      return file;
    } else if (['video/mp4'].includes(mimeType)) {
      this.logger.log('Starting to optimize video');
      const newFile = await this.fileWithNewPath(file);
      await this.optimiseVideo(file.path, newFile.path);
      this.logger.log('Optimized video successfully');
      return newFile;
    }

    return file;
  }

  private async optimiseImage(sourcePath: string, destinationPath: string, mimeType: string) {
    try {
      if (mimeType === 'image/jpeg') {
        const promisifiedExec = promisify(exec);
        const command = `ffmpeg -i ${sourcePath} -q:v 16 -y ${destinationPath}`;
        const { stderr, stdout } = await promisifiedExec(command);
      } else if (mimeType === 'image/png') {
        await sharp(sourcePath).png({ progressive: true, force: false, quality: 85 }).toFile(destinationPath);
      }
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

  private async fileWithNewPath(file: ProcessedFile): Promise<ProcessedFile> {
    const filename = await this.generateRandomHash();
    const path = file.path.replace(file.filename, filename);

    return ProcessedFile.create(path, filename, file.extension);
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
