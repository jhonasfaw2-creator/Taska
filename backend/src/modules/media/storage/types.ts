export interface UploadFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  folder: string;
}

export interface UploadResult {
  filename: string;
  url: string;
  path: string;
  size: number;
  width?: number;
  height?: number;
}

export interface IStorageProvider {
  upload(file: UploadFile): Promise<UploadResult>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
}
