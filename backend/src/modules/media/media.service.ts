import sharp from 'sharp';
import { prisma } from '../../prisma/client';
import { IStorageProvider, UploadResult } from './storage';
import { validateMimeType, validateFileSize, validateFolder } from './media.validation';

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

    let width: number | undefined;
    let height: number | undefined;

    if (file.mimetype.startsWith('image/') && file.mimetype !== 'application/pdf') {
      try {
        const metadata = await sharp(file.buffer).metadata();
        width = metadata.width;
        height = metadata.height;
      } catch {
        // Not a valid image — proceed without dimensions
      }
    }

    const uploadResult: UploadResult = await this.storage.upload({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      folder,
    });

    const media = await prisma.media.create({
      data: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
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
    return Promise.all(files.map((file) => this.uploadSingle(file, folder, userId)));
  }

  async delete(id: string): Promise<void> {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      return;
    }

    await this.storage.delete(media.filename);
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
