import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadFileAndPreview, processImportJob, getImportJobs, downloadErrorReport } from '../controllers/import.controller';
import { authenticate } from '../middleware/auth.middleware';

const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});

const upload = multer({ storage });
const router = Router();

router.use(authenticate);

router.post('/upload', upload.single('file'), uploadFileAndPreview);
router.post('/process', processImportJob);
router.get('/jobs', getImportJobs);
router.get('/jobs/:id/errors', downloadErrorReport);

export default router;
