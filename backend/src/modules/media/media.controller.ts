import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { MediaService } from './media.service';
import { validateFolder } from './media.validation';
import { LocalStorageProvider } from './storage';

const mediaService = new MediaService(new LocalStorageProvider());

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  const folder = (req.body.folder as string) || 'task-images';
  validateFolder(folder);

  if (!req.file) {
    res.status(400).json({ success: false, error: 'No file provided.' });
    return;
  }

  const media = await mediaService.uploadSingle(req.file, folder, req.user?.userId);
  res.status(201).json({ success: true, data: media });
});

export const uploadMultiple = asyncHandler(async (req: Request, res: Response) => {
  const folder = (req.body.folder as string) || 'task-images';
  validateFolder(folder);

  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    res.status(400).json({ success: false, error: 'No files provided.' });
    return;
  }

  const mediaRecords = await mediaService.uploadMultiple(files, folder, req.user?.userId);
  res.status(201).json({ success: true, data: mediaRecords });
});

export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await mediaService.delete(id);
  res.status(200).json({ success: true, message: 'File deleted successfully.' });
});

export const getFile = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const media = await mediaService.getById(id);
  if (!media) {
    res.status(404).json({ success: false, error: 'File not found.' });
    return;
  }
  res.json({ success: true, data: media });
});

export const listFiles = asyncHandler(async (req: Request, res: Response) => {
  const folder = req.query.folder as string | undefined;
  const userId = req.query.userId as string | undefined;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  let media: Awaited<ReturnType<typeof mediaService.getByFolder>>;

  if (folder) {
    validateFolder(folder);
    media = await mediaService.getByFolder(folder, limit, offset);
  } else if (userId) {
    media = await mediaService.getByUser(userId, limit, offset);
  } else {
    media = await mediaService.getByUser(req.user!.userId, limit, offset);
  }

  res.json({ success: true, data: media });
});

export { mediaService };
