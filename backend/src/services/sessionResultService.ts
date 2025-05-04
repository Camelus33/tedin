import { Types } from 'mongoose';
import { routineService } from './routineService';
import UserStats from '../models/UserStats';
import Badge from '../models/Badge';
import { IZengoSessionResult } from '../models/ZengoSessionResult';
import { IMyVerseSessionResult } from '../models/MyVerseSessionResult'; // Import MyVerse result type

// Define the return type for the function
interface CommonTasksResult {
  updatedStats: any; // Consider using a more specific type
  earnedNewBadge: boolean;
  newBadge: any; // Consider using a more specific type
}

/**
 * Handles common tasks after a session result is saved.
 * (Updates routine, user stats, and checks for new badges)
 * Works for both Standard/Original Zengo and MyVerse results.
 * @param userId - The ID of the user.
 * @param savedResult - The saved session result document (Standard or MyVerse).
 * @param level - The level of the game played (used for stats).
 * @param completedSuccessfully - Whether the session was completed successfully.
 * @returns An object containing the updated stats and new badge info.
 */
export const processCommonSessionResultTasks = async (
  userId: Types.ObjectId | string,
  // Use a union type to accept both Zengo and MyVerse results
  savedResult: IZengoSessionResult | IMyVerseSessionResult,
  level: string,
  completedSuccessfully: boolean
): Promise<CommonTasksResult> => {
  let earnedNewBadge = false;
  let newBadgeId = null;
  let newBadge = null;
  let updatedStats = null;

  try {
    // 1. Update routine status if completed successfully
    if (completedSuccessfully) {
      try {
        // Assuming routineService is correctly imported and configured
        await routineService.updateTodaysActivity(userId, 'zengo'); // Consider if MyVerse counts as 'zengo' routine
      } catch (routineError) {
        console.error(`[processCommonSessionResultTasks] Failed to update routine status for user ${userId}:`, routineError);
      }
    }

    // 2. Update UserStats (Find or Create and Update)
    // Common fields exist in both result types
    const historyEntry = {
        sessionId: savedResult._id,
        playedAt: savedResult.createdAt,
        score: savedResult.score,
        level: level,
        language: savedResult.language
        // Add gameType if you want to distinguish in history
        // gameType: 'contentId' in savedResult ? 'standard' : 'myverse'
    };

    // Determine the type of play for stats (adjust if needed)
    // For now, let's assume MyVerse plays contribute to the same zengo counters.
    // If you need separate MyVerse stats, you'll need to modify UserStats model
    // and update different fields here (e.g., myVersePlayCount, myVerseTotalScore).
    const statsUpdate = {
        $inc: {
          zengoPlayCount: 1, // Incrementing the general Zengo counter
          zengoTotalScore: historyEntry.score,
          [`zengoLevelPlays.${level}`]: 1
        },
        $push: {
          zengoPlayHistory: {
             $each: [historyEntry],
             $slice: -50
          }
        }
      };

    updatedStats = await UserStats.findOneAndUpdate(
      { userId },
      statsUpdate,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Calculate and set the new average score
    if (updatedStats) {
      // Assuming average score is calculated based on the general Zengo counter
      updatedStats.zengoAvgScore = updatedStats.zengoPlayCount > 0
                                     ? updatedStats.zengoTotalScore / updatedStats.zengoPlayCount
                                     : 0;
      await updatedStats.save();
    } else {
       console.warn(`[processCommonSessionResultTasks] UserStats not found or created for user ${userId}.`);
    }

    // 3. Badge logic using UserStats
    // Assuming badges are earned based on the general Zengo play count for now.
    if (updatedStats) {
      const ZengoBeginnerBadgeId = '6603da7a11c1b0a0c4e45b81';
      const ZengoAdeptBadgeId = '6603da7a11c1b0a0c4e45b82';
      const ZengoMasterBadgeId = '6603da7a11c1b0a0c4e45b83';
      const userBadges = updatedStats.badges || [];

      if (updatedStats.zengoPlayCount >= 1 && !userBadges.some(b => b.equals(ZengoBeginnerBadgeId))) {
        earnedNewBadge = true;
        newBadgeId = ZengoBeginnerBadgeId;
      }
      else if (updatedStats.zengoPlayCount >= 10 && !userBadges.some(b => b.equals(ZengoAdeptBadgeId))) {
        earnedNewBadge = true;
        newBadgeId = ZengoAdeptBadgeId;
      }
      else if (updatedStats.zengoPlayCount >= 50 && !userBadges.some(b => b.equals(ZengoMasterBadgeId))) {
        earnedNewBadge = true;
        newBadgeId = ZengoMasterBadgeId;
      }

      if (earnedNewBadge && newBadgeId) {
         try {
             await UserStats.updateOne({ userId }, { $addToSet: { badges: newBadgeId } });
             newBadge = await Badge.findById(newBadgeId).lean();
         } catch (badgeError) {
             console.error(`[processCommonSessionResultTasks] Failed to update/fetch badge ${newBadgeId} for user ${userId}:`, badgeError);
             earnedNewBadge = false;
             newBadge = null;
         }
      }
    }

  } catch (error) {
    console.error(`[processCommonSessionResultTasks] Error processing common tasks for user ${userId}:`, error);
  }

  return { updatedStats, earnedNewBadge, newBadge };
}; 