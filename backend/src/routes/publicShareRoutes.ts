import { Router } from 'express';
import PublicShareController from '../controllers/publicShareController';

const router = Router();

/**
 * @route GET /api/public-shares/:shareId
 * @description Fetches all data required to render a public share page.
 * @access Public
 */
router.get('/:shareId', PublicShareController.getPublicShareData);

/**
 * @route GET /api/public-shares/:shareId/notes/:noteId/inline-threads
 * @description Fetches inline threads for a specific note in a public share.
 * @access Public
 */
router.get('/:shareId/notes/:noteId/inline-threads', PublicShareController.getInlineThreads);

export default router; 