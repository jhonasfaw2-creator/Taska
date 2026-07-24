import { AppError } from '../../common/types';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
];

const ALLOWED_FOLDERS = [
  'profile-images',
  'task-images',
  'verification-documents',
  'vehicle-images',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function validateMimeType(mimeType: string): void {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new AppError(
      `Invalid file type: ${mimeType}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      400,
    );
  }
}

export function validateFileSize(size: number): void {
  if (size > MAX_FILE_SIZE) {
    throw new AppError(
      `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024} MB.`,
      400,
    );
  }
}

export function validateFolder(folder: string): void {
  if (!ALLOWED_FOLDERS.includes(folder)) {
    throw new AppError(
      `Invalid folder: ${folder}. Allowed folders: ${ALLOWED_FOLDERS.join(', ')}`,
      400,
    );
  }
}

export { ALLOWED_MIME_TYPES, ALLOWED_FOLDERS, MAX_FILE_SIZE };
