import { Router } from 'express';
import { routineController } from '../controllers/routineController';
import { authenticate } from '../middlewares/auth'; // Corrected import name

const router = Router();

// Apply authentication middleware to all routes in this router
router.use(authenticate); // Use the corrected middleware name

// Simple ping route for testing if the router is loaded
router.get('/ping', (req, res) => {
  console.log('Received ping request for /api/routines/ping');
  res.status(200).send('pong from routine route');
});

// --- Routine Routes --- //

// GET /api/routines/current - Get summary of the current active routine
router.get(
    '/current',
    routineController.getCurrentRoutineSummary
);

// GET /api/routines/current/details - Get detailed info of the current active routine
router.get(
    '/current/details',
    routineController.getCurrentRoutineDetails
);

// POST /api/routines - Create a new routine
router.post(
    '/',
    routineController.createNewRoutine
);

export default router; 