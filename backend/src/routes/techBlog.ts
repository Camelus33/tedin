import express from 'express';
import { authenticate } from '../middlewares/auth';
import { listPublished, getBySlug, createPost, updatePost, deletePost } from '../controllers/techBlogController';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Public endpoints
router.get('/tech-blog', listPublished);
router.get('/tech-blog/:slug', getBySlug);

// Authoring endpoints (restricted via authenticate + email check inside controller)
router.post('/tech-blog', authenticate, createPost);
router.put('/tech-blog/:id', authenticate, updatePost);
router.delete('/tech-blog/:id', authenticate, deletePost);

// Image upload for tech blog (author only)
const ADMIN_EMAIL = process.env.TECH_BLOG_AUTHOR_EMAIL || 'jinny5@tedin.kr';
const requireTechBlogAuthor = (req: any, res: any, next: any) => {
  const email = req.user?.email?.toLowerCase?.();
  if (!email || email !== ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

const blogUploadsDir = path.join(process.cwd(), 'uploads', 'blog');
if (!fs.existsSync(blogUploadsDir)) {
  fs.mkdirSync(blogUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, blogUploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  }
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (/^image\/(png|jpe?g|gif|webp|svg\+xml)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/tech-blog/upload', authenticate, requireTechBlogAuthor, upload.single('file'), (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const relPath = `/uploads/blog/${req.file.filename}`;
    const publicBase = process.env.PUBLIC_API_BASE_URL || `${req.protocol}://${req.get('host')}`;
    return res.status(201).json({ path: relPath, url: `${publicBase}${relPath}` });
  } catch (e) {
    return res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;


