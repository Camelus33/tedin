import express from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  getPublicCollections
} from '../controllers/collectionController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all collections for user
router.get('/', getCollections);

// Fetch single collection metadata by ID
router.get('/:id', getCollectionById);

// Create new collection
router.post('/', createCollection);

// Update existing collection
router.put('/:id', updateCollection);

// Delete collection
router.delete('/:id', deleteCollection);

// Public collections (open market)
router.get('/public', getPublicCollections);

export default router; 