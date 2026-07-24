import sharp from 'sharp';
import { prisma } from '../../prisma/client';
import { AppError } from '../../common/errors';
import { IStorageProvider, UploadResult } from './storage';
import {
  validateMimeType,
  validateFileSize,
  validateFolder,
  validateFileCount,
} from './media.validation';

export interface MediaRecord {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  folder: string;
  filename: string;
  url: string;
  uploadedById: string | null;
  createdAt: Date;
}

const MAX_IMAGE_WIDTH = 2048;
const JPEG_QUALITY = 80;

export class MediaService {
  constructor(private storage: IStorageProvider) {}

  async uploadSingle(
    file: Express.Multer.File,
    folder: string,
    userId?: string,
  ): Promise<MediaRecord> {
    validateMimeType(file.mimetype);
    validateFileSize(file.size);
    validateFolder(folder);

    let processedBuffer = file.buffer;
    let processedMimeType = file.mimetype;
    let width: number | undefined;
    let height: number | undefined;

    if (file.mimetype.startsWith('image/') && file.mimetype !== 'application/pdf') {
      try {
        const image = sharp(file.buffer);
        const metadata = await image.metadata();
        width = metadata.width;
        height = metadata.height;

        if (width && width > MAX_IMAGE_WIDTH) {
          const resized = image.resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true });
          processedBuffer = await resized.jpeg({ quality: JPEG_QUALITY }).toBuffer();
          processedMimeType = 'image/jpeg';
          const resizedMeta = await sharp(processedBuffer).metadata();
          width = resizedMeta.width;
          height = resizedMeta.height;
        } else if (file.mimetype !== 'image/jpeg') {
          processedBuffer = await image.jpeg({ quality: JPEG_QUALITY }).toBuffer();
          processedMimeType = 'image/jpeg';
        }
      } catch {
        // Not a valid image — proceed with original buffer
      }
    }

    const uploadResult: UploadResult = await this.storage.upload({
      buffer: processedBuffer,
      originalName: file.originalname,
      mimeType: processedMimeType,
      folder,
    });

    const media = await prisma.media.create({
      data: {
        originalName: file.originalname,
        mimeType: processedMimeType,
        size: processedBuffer.length,
        width: width ?? null,
        height: height ?? null,
        folder,
        filename: uploadResult.filename,
        url: uploadResult.url,
        uploadedById: userId ?? null,
      },
    });

    return this.toMediaRecord(media);
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    folder: string,
    userId?: string,
  ): Promise<MediaRecord[]> {
    validateFileCount(files.length, folder);
    return Promise.all(files.map((file) => this.uploadSingle(file, folder, userId)));
  }

  async replace(
    id: string,
    file: Express.Multer.File,
    folder: string,
    userId: string,
  ): Promise<MediaRecord> {
    const existing = await prisma.media.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Media not found.', 404);
    }
    if (existing.uploadedById !== userId) {
      throw new AppError('You can only replace your own uploaded files.', 403);
    }

    await this.storage.delete(`${existing.folder}/${existing.filename}`);

    return this.uploadSingle(file, folder, userId);
  }

  async delete(id: string, userId: string): Promise<void> {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      throw new AppError('Media not found.', 404);
    }
    if (media.uploadedById !== userId) {
      throw new AppError('You can only delete your own uploaded files.', 403);
    }

    await this.storage.delete(`${media.folder}/${media.filename}`);
    await prisma.media.delete({ where: { id } });
  }

  async getById(id: string): Promise<MediaRecord | null> {
    const media = await prisma.media.findUnique({ where: { id } });
    return media ? this.toMediaRecord(media) : null;
  }

  async getByFolder(folder: string, limit = 50, offset = 0): Promise<MediaRecord[]> {
    const records = await prisma.media.findMany({
      where: { folder },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return records.map(this.toMediaRecord);
  }

  async getByUser(userId: string, limit = 50, offset = 0): Promise<MediaRecord[]> {
    const records = await prisma.media.findMany({
      where: { uploadedById: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return records.map(this.toMediaRecord);
  }

  private toMediaRecord(media: {
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    width: number | null;
    height: number | null;
    folder: string;
    filename: string;
    url: string;
    uploadedById: string | null;
    createdAt: Date;
  }): MediaRecord {
    return {
      id: media.id,
      originalName: media.originalName,
      mimeType: media.mimeType,
      size: media.size,
      width: media.width,
      height: media.height,
      folder: media.folder,
      filename: media.filename,
      url: media.url,
      uploadedById: media.uploadedById,
      createdAt: media.createdAt,
    };
  }
}
