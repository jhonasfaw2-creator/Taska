import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../common/middleware/auth.middleware';
import {
  uploadFile,
  uploadMultiple,
  replaceFile,
  deleteFile,
  getFile,
  listFiles,
} from './media.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 10,
  },
});

const router = Router();

router.use(requireAuth);

router.post('/upload', upload.single('file'), uploadFile);
router.post('/upload-multiple', upload.array('files', 10), uploadMultiple);
router.put('/:id/replace', upload.single('file'), replaceFile);
router.delete('/:id', deleteFile);
router.get('/:id', getFile);
router.get('/', listFiles);

export default router;
