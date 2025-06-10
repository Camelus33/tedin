import { Router } from 'express';
import PublicShareController from '../controllers/publicShareController';

const router = Router();

/**
 * @route GET /api/public-shares/:shareId
 * @description Fetches all data required to render a public share page.
 * @access Public
 */
router.get('/:shareId', PublicShareController.getPublicShareData);

export default router; 