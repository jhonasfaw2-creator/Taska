import path from 'path';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { envConfig } from '../../../common/config/env';
import { IStorageProvider, UploadFile, UploadResult } from './types';

export class S3StorageProvider implements IStorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    const config: Record<string, unknown> = {
      region: envConfig.s3.region,
      credentials: {
        accessKeyId: envConfig.s3.accessKeyId,
        secretAccessKey: envConfig.s3.secretAccessKey,
      },
    };
    if (envConfig.s3.endpoint) {
      config.endpoint = envConfig.s3.endpoint;
      config.forcePathStyle = true;
    }
    this.client = new S3Client(config);
    this.bucket = envConfig.s3.bucket;
  }

  async upload(file: UploadFile): Promise<UploadResult> {
    const ext = path.extname(file.originalName) || '.bin';
    const filename = `${randomUUID()}${ext}`;
    const objectKey = `${file.folder}/${filename}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimeType,
      }),
    );

    return {
      filename,
      url: this.getUrl(objectKey),
      path: objectKey,
      size: file.buffer.length,
    };
  }

  async delete(storagePath: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: storagePath,
        }),
      );
    } catch {
      // file may not exist
    }
  }

  getUrl(storagePath: string): string {
    return this.getSignedUrlSync(storagePath);
  }

  private getSignedUrlSync(storagePath: string): string {
    return `https://${this.bucket}.s3.${envConfig.s3.region}.amazonaws.com/${storagePath}`;
  }

  async getSignedUrl(storagePath: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: storagePath,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }
}
