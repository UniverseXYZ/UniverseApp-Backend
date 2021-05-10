import { Injectable } from '@nestjs/common';
import * as crypto from "crypto";
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from "path";
​
​
@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  constructor() {}
​
  createMulterOptions(): MulterModuleOptions {
    return {
      limits: {
        fileSize: 1024 * 1024 * 10,
      },
      storage: diskStorage({
        destination: 'uploads/images',
        filename: async (req, file, cb) => {
          const extension = path.extname(file.originalname);
          const hash = await this.generateRandomHash();
          cb(null, `${hash}${extension}`);
        },
      }),
    };
  }
​
  async generateRandomHash(length = 24): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(length, (err, buf) => {
        if (err) {
          reject(err);
        } else {
          resolve(buf.toString('hex'))
        }
      });
    });
  }
}