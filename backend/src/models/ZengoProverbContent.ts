import mongoose, { Document, Schema } from 'mongoose';

// Interface defining the structure of a Zengo proverb content document
export interface IZengoProverbContent extends Document {
  level: string; // e.g., "3x3-easy", "5x5-medium"
  language: string; // e.g., "ko", "en", "zh", "ja"
  boardSize: 3 | 5 | 7;
  proverbText: string; // The full proverb or quote text
  goPatternName?: string; // Optional name of the Go pattern referenced
  wordMappings: { word: string; coords: { x: number; y: number } }[];
  totalWords: number; // Automatically calculated or set based on wordMappings.length
  totalAllowedStones: number; // System-assigned number of stones for this level
  initialDisplayTimeMs: number; // How long the words are shown initially (in ms)
  targetTimeMs?: number; // Optional target time for time bonus (in ms)
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema definition for ZengoProverbContent
const ZengoProverbContentSchema: Schema = new Schema(
  {
    level: {
      type: String,
      required: true,
      // Consider adding a unique index combined with language if needed:
      // unique: true, // if level should be unique regardless of language
      index: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['ko', 'en', 'zh', 'ja'], // Supported languages
      index: true,
    },
    boardSize: {
      type: Number,
      required: true,
      enum: [3, 5, 7],
    },
    proverbText: {
      type: String,
      required: true,
    },
    goPatternName: {
      type: String,
    },
    wordMappings: [
      {
        word: { type: String, required: true },
        coords: {
          x: { type: Number, required: true },
          y: { type: Number, required: true },
        },
        _id: false, // Don't create _id for subdocuments in the array
      },
    ],
    totalWords: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAllowedStones: {
      type: Number,
      required: true,
      min: 1,
      validate: {
          validator: function(this: IZengoProverbContent, value: number): boolean {
              // Ensure allowed stones are at least the number of words
              return value >= this.totalWords;
          },
          message: 'Total allowed stones must be greater than or equal to the total number of words.'
      }
    },
    initialDisplayTimeMs: {
      type: Number,
      required: true,
      min: 100, // Minimum display time (e.g., 100ms)
    },
    targetTimeMs: {
        type: Number,
        min: 0
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    collection: 'zengo', // 명시적으로 'zengo' 컬렉션 사용 지정
    // Optional: Add a compound index for faster lookups by level and language
    // index: { level: 1, language: 1 }, { unique: true }
  }
);

// Compound index to optimize queries filtering by level and language
ZengoProverbContentSchema.index({ level: 1, language: 1 });

// Pre-save hook could be used to ensure totalWords matches wordMappings.length if needed
ZengoProverbContentSchema.pre<IZengoProverbContent>('save', function (next) {
    if (this.isModified('wordMappings') || this.isNew) {
        this.totalWords = this.wordMappings.length;
    }
    // Optional validation: Check if totalAllowedStones >= totalWords
    if (this.totalAllowedStones < this.totalWords) {
        next(new Error('Total allowed stones cannot be less than the total number of words.'));
    } else {
        next();
    }
});


// Create and export the Mongoose model
const ZengoProverbContent = mongoose.model<IZengoProverbContent>(
  'ZengoProverbContent',
  ZengoProverbContentSchema
);

export default ZengoProverbContent; 