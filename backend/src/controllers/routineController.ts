import { Request, Response, NextFunction } from 'express';
import { routineService } from '../services/routineService';
import { Types } from 'mongoose';

// Extend Express Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string | Types.ObjectId;
    // Add other user properties if available from your auth middleware
  };
}

/**
 * Controller for handling routine-related API requests.
 */
export class RoutineController {
  /**
   * GET /api/routines/current
   * Retrieves the summary of the currently active routine for the logged-in user.
   */
  async getCurrentRoutineSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
      return;
    }

    try {
      const summary = await routineService.getRoutineSummary(userId);
      if (!summary) {
        res.status(404).json({ message: 'No active routine found for this user.' });
        return;
      }
      res.status(200).json(summary);
    } catch (error) {
      console.error('[RoutineController] Error fetching routine summary:', error);
      next(error); // Pass error to the global error handler
    }
  }

  /**
   * GET /api/routines/current/details
   * Retrieves the detailed information of the currently active routine for the logged-in user.
   */
  async getCurrentRoutineDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
      return;
    }

    try {
      const details = await routineService.getRoutineDetails(userId);
      if (!details) {
        res.status(404).json({ message: 'No active routine found for this user.' });
        return;
      }
      res.status(200).json(details);
    } catch (error) {
      console.error('[RoutineController] Error fetching routine details:', error);
      next(error);
    }
  }

  /**
   * POST /api/routines
   * Creates a new 33-day routine for the logged-in user.
   */
  async createNewRoutine(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const userId = req.user?.id;
    const { goal } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
      return;
    }

    if (!goal || typeof goal !== 'string' || goal.trim() === '') {
      res.status(400).json({ message: 'Bad Request: Routine goal is required and must be a non-empty string.' });
      return;
    }

    try {
      // Using default deactivateExisting = true
      const newRoutine = await routineService.createRoutine(userId, goal.trim());
      // Exclude potentially sensitive or large fields if necessary before sending response
      // const responseRoutine = { ...newRoutine.toObject() };
      // delete responseRoutine.dailyStatus; // Example: exclude dailyStatus if too large for creation response
      res.status(201).json(newRoutine); // Send the full new routine object
    } catch (error) {
      console.error('[RoutineController] Error creating new routine:', error);
      // Could add more specific error handling, e.g., for validation errors
      next(error);
    }
  }
}

// Export an instance of the controller
export const routineController = new RoutineController(); 