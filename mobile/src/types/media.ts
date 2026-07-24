export type MediaFolder = 'profile-images' | 'task-images' | 'verification-documents' | 'vehicle-images';

export interface MediaRecord {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  folder: MediaFolder;
  filename: string;
  url: string;
  uploadedById: string | null;
  createdAt: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ImagePickerAsset {
  uri: string;
  width: number;
  height: number;
  mimeType?: string;
  fileSize?: number;
  fileName?: string | null;
}

export const ALLOWED_FOLDERS: MediaFolder[] = [
  'profile-images',
  'task-images',
  'verification-documents',
  'vehicle-images',
];

export const MAX_FILES_PER_FOLDER: Record<MediaFolder, number> = {
  'profile-images': 1,
  'task-images': 5,
  'verification-documents': 3,
  'vehicle-images': 5,
};

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_IMAGE_WIDTH = 2048;
export const COMPRESSION_QUALITY = 0.7;
