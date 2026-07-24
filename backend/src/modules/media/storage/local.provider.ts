import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import { IStorageProvider, UploadFile, UploadResult } from './types';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

export class LocalStorageProvider implements IStorageProvider {
  constructor() {
    this.ensureUploadsDir();
  }

  private async ensureUploadsDir(): Promise<void> {
    try {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
    } catch {
      // dir already exists
    }
  }

  private async getFolderPath(folder: string): Promise<string> {
    const dir = path.join(UPLOADS_DIR, folder);
    await fs.mkdir(dir, { recursive: true });
    return dir;
  }

  async upload(file: UploadFile): Promise<UploadResult> {
    const ext = path.extname(file.originalName) || '.bin';
    const filename = `${randomUUID()}${ext}`;
    const folderPath = await this.getFolderPath(file.folder);
    const filePath = path.join(folderPath, filename);

    await fs.writeFile(filePath, file.buffer);

    return {
      filename,
      url: this.getUrl(path.join(file.folder, filename)),
      path: path.join(file.folder, filename),
      size: file.buffer.length,
    };
  }

  async delete(storagePath: string): Promise<void> {
    const filePath = path.join(UPLOADS_DIR, storagePath);
    try {
      await fs.unlink(filePath);
    } catch {
      // file may not exist
    }
  }

  getUrl(storagePath: string): string {
    return `/uploads/${storagePath}`;
  }
}
