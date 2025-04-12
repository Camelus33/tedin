import mongoose, { Document, Schema } from 'mongoose';

export interface IZengoScores {
  attention: number;
  memory: number;
  reasoning: number;
  creativity: number;
}

export interface IZengoModule {
  name: string;
  accuracy: number | null;
  reactionTimeAvg: number | null;
  memoryScore: number | null;
  languageScore: number | null;
  logicScore: number | null;
}

export interface IZengo extends Document {
  user: mongoose.Types.ObjectId;
  moduleId: string;
  boardSize: '3x3' | '5x5' | '9x9' | '19x19';
  modules: IZengoModule[];
  scores: IZengoScores;
  overallScore: number | null;
  badges: string[];
  status: 'setup' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  startedAt: Date;
  completedAt: Date;
  endedAt: Date;
}

const ZengoModuleSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
  reactionTimeAvg: {
    type: Number,
    min: 0,
    default: null,
  },
  memoryScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
  languageScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
  logicScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
}, { _id: false });

const ZengoScoresSchema = new Schema({
  attention: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  memory: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  reasoning: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  creativity: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
}, { _id: false });

const ZengoSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  moduleId: {
    type: String,
    required: true,
  },
  boardSize: {
    type: String,
    enum: ['3x3', '5x5', '9x9', '19x19'],
    required: true,
  },
  modules: {
    type: [ZengoModuleSchema],
    validate: [
      {
        validator: function(modules: IZengoModule[]) {
          return modules.length > 0;
        },
        message: '최소 하나 이상의 모듈이 필요합니다',
      },
      {
        validator: function(modules: IZengoModule[]) {
          return modules.length <= 5;
        },
        message: '최대 5개까지의 모듈만 허용됩니다',
      },
    ],
  },
  scores: {
    type: ZengoScoresSchema,
    default: () => ({}),
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
  badges: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['setup', 'active', 'completed', 'cancelled'],
    default: 'setup',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  startedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  endedAt: {
    type: Date,
    default: null,
  },
});

// Add indexes for common queries
ZengoSchema.index({ user: 1, createdAt: -1 });
ZengoSchema.index({ overallScore: -1 });
ZengoSchema.index({ status: 1, completedAt: -1 });

export default mongoose.model<IZengo>('Zengo', ZengoSchema); 