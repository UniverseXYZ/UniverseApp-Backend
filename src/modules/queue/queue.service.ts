import { Injectable, Logger } from '@nestjs/common';
import * as S3Client from 'aws-sdk/clients/s3';
import { AppConfig } from '../configuration/configuration.service';
import * as Queue from 'better-queue';

@Injectable()
export class QueueService {
    private queues = {};

    constructor(
        private readonly config: AppConfig,
    ) {

    }

    public initQueue(queueName: string, callback: any, concurrent: number = 1) {
        if (!this.queues[queueName]) {
            this.queues[queueName] = new Queue(callback, {concurrent});
        }
    }

    public pushToQueue(queueName: string, data: any){
        if (this.queues[queueName]){
            this.queues[queueName].push(data)
        }
    }
}