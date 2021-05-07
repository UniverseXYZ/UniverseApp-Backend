import { Injectable, Logger } from '@nestjs/common';
import * as S3Client from 'aws-sdk/clients/s3';
import { AppConfig } from '../configuration/configuration.service';
import * as fs from 'fs';
​
@Injectable()
export class S3Service {
  constructor(
    private readonly config: AppConfig,
  ) {
    this.client = new S3Client({
      accessKeyId: config.values.aws.accessKeyId,
      secretAccessKey: config.values.aws.secretAccessKey,
    });
  }
  private client: S3Client;
​
  uploadDocument(
    sourcePath: string,
    bucketPath: string,
  ) {
​
    return new Promise<void>((resolve, reject) => {
      const stream = fs.createReadStream(sourcePath);
​
      this.client.upload({
        Bucket: this.config.values.aws.bucketName,
        Key: bucketPath,
        Body: stream,
      }, (error, data) => {
        if (error) {
          Logger.log(error)
          reject(error);
        } else {
          resolve();
        }
      });
    })
  }
}