import { diskStorage } from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { HttpException, HttpStatus } from '@nestjs/common';

export const multerOptions: () => MulterOptions = () => {
  return {
    limits: {
      fileSize: 1024 * 1024 * 30,
    },
    storage: diskStorage({
      destination: 'uploads/nfts',
      filename: async (req, file, cb) => {
        try {
          const extension = path.extname(file.originalname);
          const hash = await generateRandomHash();
          cb(null, `${hash}${extension}`);
        } catch (error) {
          cb(error, '');
        }
      },
    }),
    fileFilter: (req: any, file: Express.Multer.File, callback: (error: (Error | null), acceptFile: boolean) => void) => {
      const isValid = isMimeTypeValid(file.mimetype);
      if (isValid) {
        callback(null, true);
      } else {
        callback(
          new HttpException({
          error: 'Invalid file type',
          message: 'File type is not valid. Supported file types: jpeg, png, gif, webp, mp4',
        }, HttpStatus.BAD_REQUEST), false)
      }
    }
  };
};

const generateRandomHash = async (length = 24) => {
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

const isMimeTypeValid = (mimeType: string) => {
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'];
  return validMimeTypes.includes(mimeType)
}
