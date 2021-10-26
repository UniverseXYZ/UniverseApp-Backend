import { Injectable, Logger } from '@nestjs/common';
import S3Client from 'aws-sdk/clients/s3';
import { AppConfig } from '../configuration/configuration.service';
import fs from 'fs';
import { UploadResult } from './model/UploadResult';

@Injectable()
export class S3Service {
  constructor(private readonly config: AppConfig) {
    this.client = new S3Client({
      accessKeyId: config.values.aws.accessKeyId,
      secretAccessKey: config.values.aws.secretAccessKey,
    });
  }
  private client: S3Client;

  public getUrl(key: string) {
    return key && `${this.config.values.aws.s3BaseUrl}/${key}`;
  }

  public uploadDocument(sourcePath: string, bucketPath: string) {
    return new Promise<UploadResult>((resolve, reject) => {
      const stream = fs.createReadStream(sourcePath);
      this.client.upload(
        {
          Bucket: this.config.values.aws.bucketName,
          Key: bucketPath,
          Body: stream,
        },
        (error, data) => {
          if (error) {
            Logger.log(error);
            reject(error);
          } else {
            resolve(UploadResult.fromAws(data));
          }
        },
      );
    });
  }
  public uploadBuffer(sourceBuffer: Buffer, bucketPath: string) {
    return new Promise<UploadResult>((resolve, reject) => {
      this.client.upload(
        {
          Bucket: this.config.values.aws.bucketName,
          Key: bucketPath,
          Body: sourceBuffer,
        },
        (error, data) => {
          if (error) {
            Logger.log(error);
            reject(error);
          } else {
            resolve(UploadResult.fromAws(data));
          }
        },
      );
    });
  }
}
