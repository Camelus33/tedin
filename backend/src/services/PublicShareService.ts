import PublicShare from '../models/PublicShare';
import SummaryNote from '../models/SummaryNote';
import Note from '../models/Note';
import Book from '../models/Book';
import Session from '../models/Session';
import User from '../models/User';
import { buildJsonLd, TSNote } from '../utils/jsonLdBuilder';
import mongoose from 'mongoose';

// Define a comprehensive type for the aggregated data
// This should align with the input type for jsonLdBuilder
interface AggregatedShareData {
  htmlData: any; // Data needed for HTML rendering
  jsonLdData: object; // Data for the JSON-LD script
}

// A helper type for populated summary note
interface PopulatedSummaryNote {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    orderedNoteIds: string[];
    //... other fields
    userId: {
        name?: string;
        email: string;
    };
    createdAt: Date;
}

class PublicShareService {
  /**
   * @description Fetches all necessary data for a public share link.
   * @param shareId The ID of the public share link.
   * @returns An object containing data for HTML rendering and for the JSON-LD script, or null if not found.
   */
  public static async getShareData(shareId: string): Promise<AggregatedShareData | null> {
    // shareId는 nanoid로 생성된 문자열이므로 ObjectId로 변환하지 않음
    const results = await PublicShare.aggregate([
      // 1. Find the share document by string _id
      { $match: { _id: shareId } },
      
      // 2. Fetch the summary note details
      {
        $lookup: {
          from: 'summarynotes',
          localField: 'summaryNoteId',
          foreignField: '_id',
          as: 'summaryNoteArr'
        }
      },
      // If no summary note, there's nothing to show.
      { $unwind: '$summaryNoteArr' },

      // 3. Fetch user details
      {
        $lookup: {
          from: 'users',
          localField: 'summaryNoteArr.userId',
          foreignField: '_id',
          as: 'userArr'
        }
      },
      // A user might be deleted, but we can proceed.
      { $unwind: { path: '$userArr', preserveNullAndEmptyArrays: true } },

      // 4. Fetch the actual notes
      {
        $lookup: {
          from: 'notes',
          let: { noteIds: '$summaryNoteArr.orderedNoteIds' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', { $map: { input: '$$noteIds', as: 'id', in: { $toObjectId: '$$id' } } } ] } } },
             // 4a. Fetch session for each note
            {
              $lookup: {
                from: 'sessions', localField: 'originSession', foreignField: '_id', as: 'sessionDetailsArr'
              }
            },
            { $unwind: { path: '$sessionDetailsArr', preserveNullAndEmptyArrays: true } },
            // 4b. Fetch book for each note
            {
              $lookup: {
                from: 'books', localField: 'bookId', foreignField: '_id', as: 'bookArr'
              }
            },
            { $unwind: { path: '$bookArr', preserveNullAndEmptyArrays: true } },
            // 4c. Add default values for missing data
            {
              $addFields: {
                sessionDetails: {
                  $ifNull: ['$sessionDetailsArr', { createdAt: new Date(), durationSeconds: 0, startPage: 0, actualEndPage: 0, targetPage: 0, ppm: 0 }]
                },
                book: {
                  $ifNull: ['$bookArr', { title: '연결된 책 정보 없음', author: '알 수 없음' }]
                }
              }
            },
            { $project: { sessionDetailsArr: 0, bookArr: 0 } } // Clean up temp arrays
          ],
          as: 'notesWithDetails'
        }
      },
      // 5. Final projection to shape the data
      {
        $project: {
          summaryNote: '$summaryNoteArr',
          user: '$userArr',
          notes: '$notesWithDetails',
        }
      }
    ]);

    if (results.length === 0) {
      return null;
    }

    const result = results[0];
    const summaryNote = result.summaryNote;

    // Reorder notes according to the original order in summaryNote
    const orderedNotes = summaryNote.orderedNoteIds.map((id: string) => 
      result.notes.find((n: TSNote) => n._id.toString() === id.toString())
    ).filter((n?: TSNote): n is TSNote => !!n);

    const dataForBuilder = {
      ...summaryNote,
      user: result.user || { name: '알 수 없는 사용자', email: ''},
      notes: orderedNotes,
      readingPurpose: summaryNote.readingPurpose || 'general_knowledge', 
    };

    const jsonLdData = buildJsonLd(dataForBuilder as any);
    const htmlData = dataForBuilder;
    
    return {
      htmlData,
      jsonLdData,
    };
  }
}

export default PublicShareService; 