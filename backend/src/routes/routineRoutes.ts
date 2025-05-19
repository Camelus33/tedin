import { Router } from 'express';
import { routineController } from '../controllers/routineController';
import { authenticate } from '../middlewares/auth'; // Corrected import name

console.log('[RoutineRoutes] Router file loaded');

const router = Router();

// Apply authentication middleware to all routes in this router
router.use(authenticate);

// Simple ping route for testing if the router is loaded
router.get('/ping', (req, res) => {
  console.log('[RoutineRoutes] Received ping request for /api/routines/ping');
  res.status(200).send('pong from routine route');
});

// --- Routine Routes --- //

// GET /api/routines/current - Get summary of the current active routine
router.get(
    '/current',
    (req, res, next) => {
      console.log(`[RoutineRoutes] Request received for GET /current by user: ${req.user?.id}`);
      next();
    },
    routineController.getCurrentRoutineSummary
);

// GET /api/routines/current/details - Get detailed info of the current active routine
router.get(
    '/current/details',
    (req, res, next) => {
      console.log(`[RoutineRoutes] Request received for GET /current/details by user: ${req.user?.id}`);
      next();
    },
    routineController.getCurrentRoutineDetails
);

// POST /api/routines - Create a new routine
router.post(
    '/',
    (req, res, next) => {
      console.log(`[RoutineRoutes] Request received for POST / by user: ${req.user?.id}`);
      next();
    },
    routineController.createNewRoutine
);

export default router; 