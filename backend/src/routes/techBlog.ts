import express from 'express';
import { authenticate } from '../middlewares/auth';
import { listPublished, getBySlug, createPost, updatePost, deletePost } from '../controllers/techBlogController';

const router = express.Router();

// Public endpoints
router.get('/tech-blog', listPublished);
router.get('/tech-blog/:slug', getBySlug);

// Authoring endpoints (restricted via authenticate + email check inside controller)
router.post('/tech-blog', authenticate, createPost);
router.put('/tech-blog/:id', authenticate, updatePost);
router.delete('/tech-blog/:id', authenticate, deletePost);

export default router;


