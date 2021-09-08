import { diskStorage } from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { HttpException, HttpStatus } from '@nestjs/common';

export const collectionFileMulterOptions = () => {
  return multerOptionsFactory(1, ['image/jpeg', 'image/png', 'image/gif']);
};

export const collectionBannerMulterOptions = () => {
  return multerOptionsFactory(3, ['image/jpeg', 'image/png', 'image/webp']);
};

export const auctionLandingImagesMulterOptions = () => {
  return multerOptionsFactory(3, ['image/jpeg', 'image/png']);
};

export const nftFileMulterOptions = () => {
  return multerOptionsFactory(30, ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4']);
};

const multerOptionsFactory: (sizeInMb: number, validMimeTypes: string[]) => MulterOptions = (
  sizeInMb,
  validMimeTypes,
) => {
  return {
    limits: {
      fileSize: 1024 * 1024 * sizeInMb,
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
    fileFilter: (req: any, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
      const isValid = isMimeTypeValid(file.mimetype, validMimeTypes);
      if (isValid) {
        callback(null, true);
      } else {
        callback(new InvalidFileTypeException(validMimeTypes), false);
      }
    },
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

const isMimeTypeValid = (mimeType: string, validMimeTypes: string[]) => {
  return validMimeTypes.includes(mimeType);
};

class InvalidFileTypeException extends HttpException {
  constructor(types: string[]) {
    super(
      {
        error: 'InvalidFileType',
        message: `File type is not valid. Supported types are: ${types}`,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
