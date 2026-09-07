import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { uploadFileAndPreview, processImportJob, getImportJobs, downloadErrorReport } from '../controllers/import.controller';
import { authenticate } from '../middleware/auth.middleware';

const getUploadsDir = (): string => {
  const tmpDir = path.join(os.tmpdir(), 'exportflow_uploads');
  try {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    return tmpDir;
  } catch (e) {
    return os.tmpdir();
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, getUploadsDir()),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_')}`),
});

const upload = multer({ storage });
const router = Router();

router.use(authenticate);

router.post('/upload', upload.single('file'), uploadFileAndPreview);
router.post('/process', processImportJob);
router.get('/jobs', getImportJobs);
router.get('/jobs/:id/errors', downloadErrorReport);

export default router;
