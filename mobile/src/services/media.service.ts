import api from '../config/api';
import * as ImageManipulator from 'expo-image-manipulator';

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
  createdAt: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGE_WIDTH = 2048;
const COMPRESSION_QUALITY = 0.7;

export function validateImage(_uri: string, mimeType: string, fileSize: number): string | null {
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return `Unsupported file type: ${mimeType}. Allowed: ${ALLOWED_TYPES.join(', ')}`;
  }
  if (fileSize > MAX_FILE_SIZE) {
    return `File too large (${(fileSize / 1024 / 1024).toFixed(1)} MB). Max: 10 MB`;
  }
  return null;
}

export async function compressImage(uri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_IMAGE_WIDTH } }],
      {
        compress: COMPRESSION_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );
    return result.uri;
  } catch {
    return uri;
  }
}

export async function uploadImage(
  uri: string,
  folder: string,
  onProgress?: (progress: UploadProgress) => void,
  retries = 3,
): Promise<MediaRecord> {
  const compressedUri = await compressImage(uri);

  const formData = new FormData();
  const filename = uri.split('/').pop() || 'image.jpg';
  const mimeType = getMimeType(filename);

  formData.append('file', {
    uri: compressedUri,
    name: filename,
    type: mimeType,
  } as any);
  formData.append('folder', folder);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await api.post<{ success: boolean; data: MediaRecord }>(
        '/media/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000,
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              onProgress({
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                percentage: Math.round((progressEvent.loaded / progressEvent.total) * 100),
              });
            }
          },
        },
      );

      return response.data.data;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Upload failed');
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Upload failed after retries');
}

export async function uploadMultipleImages(
  uris: string[],
  folder: string,
  onProgress?: (completed: number, total: number) => void,
): Promise<MediaRecord[]> {
  const results: MediaRecord[] = [];

  for (let i = 0; i < uris.length; i++) {
    const media = await uploadImage(uris[i], folder);
    results.push(media);
    onProgress?.(i + 1, uris.length);
  }

  return results;
}

export async function deleteMedia(id: string): Promise<void> {
  await api.delete(`/media/${id}`);
}

export async function getMedia(id: string): Promise<MediaRecord> {
  const response = await api.get<{ success: boolean; data: MediaRecord }>(`/media/${id}`);
  return response.data.data;
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
  };
  return mimeMap[ext] || 'image/jpeg';
}
