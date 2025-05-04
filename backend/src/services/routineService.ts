import mongoose, { Types } from 'mongoose';
import Routine, { IRoutine, IDailyStatus } from '../models/Routine';

/**
 * Calculates the difference in days between two dates, based on UTC.
 * @param date1 First date
 * @param date2 Second date
 * @returns Difference in days
 */
const differenceInDaysUTC = (date1: Date, date2: Date): number => {
  const utc1 = Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate());
  const utc2 = Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate());
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
};

/**
 * Service class for handling routine-related business logic.
 */
export class RoutineService {
  /**
   * Finds the currently active routine for a given user.
   * @param userId The ID of the user.
   * @returns The active routine document or null if not found.
   */
  async getActiveRoutine(userId: Types.ObjectId | string): Promise<IRoutine | null> {
    try {
      return await Routine.findOne({ userId, isActive: true }).lean(); // Use lean for performance if not modifying
    } catch (error) {
      console.error('Error finding active routine:', error);
      throw new Error('Could not retrieve active routine.');
    }
  }

  /**
   * Calculates the current day number (1-33) within the routine period.
   * Returns null if the current date is outside the routine period.
   * @param routine The routine object.
   * @returns The current day number (1-33) or null.
   */
  getCurrentDayNumber(routine: IRoutine): number | null {
    const today = new Date();
    const daysSinceStart = differenceInDaysUTC(routine.startDate, today);
    const currentDay = daysSinceStart + 1;

    // Check if today is within the 33-day period
    if (currentDay >= 1 && currentDay <= 33) {
      return currentDay;
    }
    return null; // Not within the routine period
  }

  /**
   * Calculates the current consecutive achievement streak (days where both TS and ZenGo were done).
   * @param routine The routine object.
   * @param currentDay The current day number within the routine.
   * @returns The number of consecutive successful days ending yesterday.
   */
  calculateConsecutiveStreak(routine: IRoutine, currentDay: number | null): number {
    if (currentDay === null || currentDay <= 1) {
      return 0;
    }

    let streak = 0;
    // Iterate backwards from yesterday (currentDay - 1) down to day 1
    for (let day = currentDay - 1; day >= 1; day--) {
      const status = routine.dailyStatus.find(d => d.day === day);
      if (status && status.tsExecuted && status.zengoCompleted) {
        streak++;
      } else {
        break; // Streak broken
      }
    }
    return streak;
  }

  /**
   * Updates the status of a specific activity (TS or ZenGo) for the current day
   * in the user's active routine.
   * @param userId The ID of the user.
   * @param activityType 'ts' or 'zengo'.
   * @returns True if the update was successful, false otherwise.
   */
  async updateTodaysActivity(userId: Types.ObjectId | string, activityType: 'ts' | 'zengo'): Promise<boolean> {
    const routine = await this.getActiveRoutine(userId);
    if (!routine) {
      console.log(`No active routine found for user ${userId} to update activity.`);
      return false; // No active routine
    }

    const currentDay = this.getCurrentDayNumber(routine);
    if (currentDay === null) {
      console.log(`Routine for user ${userId} is not currently active (outside start/end date).`);
      return false; // Routine not active today
    }

    const fieldToUpdate = activityType === 'ts' ? 'dailyStatus.$.tsExecuted' : 'dailyStatus.$.zengoCompleted';

    try {
      const result = await Routine.updateOne(
        { _id: routine._id, 'dailyStatus.day': currentDay }, // Match routine and the correct day in the array
        { $set: { [fieldToUpdate]: true } } // Set the specific activity field to true
      );

      if (result.matchedCount === 0) {
        console.warn(`Could not find matching day ${currentDay} in routine ${routine._id} to update.`);
        // This might happen if dailyStatus array wasn't initialized correctly
        return false;
      }
      if (result.modifiedCount > 0) {
        console.log(`Successfully updated ${activityType} status for day ${currentDay} in routine ${routine._id}`);
        return true;
      }
      // modifiedCount === 0 could mean it was already true, which is fine
      return true;
    } catch (error) {
      console.error(`Error updating ${activityType} status for routine ${routine._id}:`, error);
      throw new Error('Could not update routine status.');
    }
  }

  /**
   * Retrieves a summary of the user's current active routine status.
   * @param userId The ID of the user.
   * @returns A summary object or null if no active routine.
   */
  async getRoutineSummary(userId: Types.ObjectId | string): Promise<object | null> {
    const routine = await this.getActiveRoutine(userId);
    if (!routine) {
      return null;
    }

    const currentDay = this.getCurrentDayNumber(routine);
    if (currentDay === null) {
      // Optionally return some info even if outside the period, or null
      return { message: "Routine is not active today.", startDate: routine.startDate, endDate: routine.endDate };
    }

    const streak = this.calculateConsecutiveStreak(routine, currentDay);
    const todayStatus = routine.dailyStatus.find(d => d.day === currentDay) || { tsExecuted: false, zengoCompleted: false }; // Default if not found (shouldn't happen)

    // Define the specific task description reflecting the daily requirement
    const specificDailyTask = "TS 모드 1회 이상 실행 및 ZenGo 1회 이상 완료";

    return {
      currentDay,
      totalDays: 33,
      consecutiveStreak: streak,
      todayTask: specificDailyTask,
      todayTsExecuted: todayStatus.tsExecuted,
      todayZengoCompleted: todayStatus.zengoCompleted,
    };
  }

  /**
   * Retrieves detailed information about the user's current active routine.
   * @param userId The ID of the user.
   * @returns A details object or null if no active routine.
   */
  async getRoutineDetails(userId: Types.ObjectId | string): Promise<object | null> {
    const routine = await this.getActiveRoutine(userId);
    if (!routine) {
      return null;
    }

    let successfulDays = 0;
    routine.dailyStatus.forEach(status => {
      if (status.tsExecuted && status.zengoCompleted) {
        successfulDays++;
      }
    });

    // Calculate success rate based on days passed so far or total 33 days
    const currentDay = this.getCurrentDayNumber(routine) ?? 0; // Use 0 if outside period
    const relevantDays = Math.min(Math.max(currentDay, 1), 33); // Days considered for rate (1 to 33)
    const overallSuccessRate = relevantDays > 0 ? (successfulDays / relevantDays) * 100 : 0;

    return {
      goal: routine.goal,
      startDate: routine.startDate,
      endDate: routine.endDate,
      dailyStatus: routine.dailyStatus, // Send the full status array
      overallSuccessRate: parseFloat(overallSuccessRate.toFixed(1)), // Format to one decimal place
    };
  }

  /**
   * Creates a new 33-day routine for the user.
   * Optionally deactivates any existing active routines for the user.
   * @param userId The ID of the user.
   * @param goal The goal for the new routine.
   * @param deactivateExisting If true, deactivates other active routines.
   * @returns The newly created routine document.
   */
  async createRoutine(userId: Types.ObjectId | string, goal: string, deactivateExisting: boolean = true): Promise<IRoutine> {
    if (deactivateExisting) {
      try {
        await Routine.updateMany({ userId, isActive: true }, { $set: { isActive: false } });
      } catch (error) {
        console.error(`Error deactivating existing routines for user ${userId}:`, error);
        throw new Error('Could not deactivate existing routines.');
      }
    }

    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0); // Start at the beginning of the UTC day

    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 33); // End after 33 days

    const dailyStatus: IDailyStatus[] = [];
    for (let i = 1; i <= 33; i++) {
      dailyStatus.push({ day: i, tsExecuted: false, zengoCompleted: false });
    }

    const newRoutine = new Routine({
      userId,
      goal,
      startDate,
      endDate,
      dailyStatus,
      isActive: true,
    });

    try {
      await newRoutine.save();
      return newRoutine;
    } catch (error) {
      console.error('Error creating new routine:', error);
      // Handle potential unique index violation if `deactivateExisting` was false
      // or other validation errors from the model.
      throw new Error('Could not create new routine.');
    }
  }
}

// Export an instance of the service
export const routineService = new RoutineService(); 