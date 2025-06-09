import mongoose, { Document, Schema, Types } from 'mongoose';

// Interface defining the structure of a Zengo session result document
export interface IZengoSessionResult extends Document {
  userId: Types.ObjectId; // Reference to the User who played
  contentId: Types.ObjectId; // Reference to the ZengoProverbContent used
  level: string; // Level identifier (e.g., "3x3-easy")
  language: string; // Language used (e.g., "ko")
  usedStonesCount: number; // Number of stones placed by the user
  correctPlacements: number; // Count of correctly placed stones
  incorrectPlacements: number; // Count of incorrectly placed stones
  timeTakenMs: number; // Time taken to complete the session in milliseconds
  completedSuccessfully: boolean; // Whether the user successfully completed the proverb
  resultType?: string; // Result type: EXCELLENT, SUCCESS, or FAIL
  score: number; // Calculated score for the session
  earnedBadgeIds?: Types.ObjectId[]; // Optional: IDs of badges earned during this session
  orderCorrect?: boolean; // Whether the placement order was correct
  placementOrder?: number[]; // The order in which stones were placed
  createdAt: Date; // Timestamp of session completion
  
  // === 새로운 인지과학적 측정 변수들 (V2) ===
  // 시간 분석 변수
  firstClickLatency?: number; // 첫 클릭까지의 지연시간 (ms)
  interClickIntervals?: number[]; // 클릭 간 간격 배열 (ms)
  hesitationPeriods?: number[]; // 망설임 기간 배열 (ms)
  
  // 공간 인지 변수  
  spatialErrors?: number[]; // 실제 위치와 클릭 위치 간 거리 배열
  clickPositions?: { x: number; y: number; timestamp: number }[]; // 클릭 위치와 시간
  correctPositions?: { x: number; y: number }[]; // 정답 위치들
  
  // 순서 및 패턴 변수
  sequentialAccuracy?: number; // 순서 정확도 (0-1)
  temporalOrderViolations?: number; // 시간순서 위반 횟수
  
  // 메타 정보
  detailedDataVersion?: string; // 상세 데이터 버전 (예: "v2.0")

  // --- V2 상세 데이터 필드 (v2.0) ---
  detailedMetrics: {
    firstClickLatency: number;
    interClickIntervals: number[];
    hesitationPeriods: { duration: number; position: { x: number; y: number } }[];
    spatialErrors: { expected: { x: number; y: number }; actual: { x: number; y: number }; distance: number }[];
    clickPositions: { x: number; y: number; timestamp: number }[];
    correctPositions: { x: number; y: number }[];
    sequentialAccuracy: number;
    temporalOrderViolations: number;
    spatialPatternRecognition: number;
    cognitiveLoadManagement: number;
    taskSwitchingCost: number;
    errorAdaptability: number;
    emotionalRegulation: number;
  };
}

// Mongoose Schema definition for ZengoSessionResult
const ZengoSessionResultSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
      index: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      ref: 'ZengoProverbContent', // Reference to the content model
      required: true,
      index: true,
    },
    level: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['ko', 'en', 'zh', 'ja'], // Ensure consistency
    },
    usedStonesCount: {
      type: Number,
      required: true,
      min: 0,
    },
    correctPlacements: {
      type: Number,
      required: true,
      min: 0,
    },
    incorrectPlacements: {
      type: Number,
      required: true,
      min: 0,
    },
    timeTakenMs: {
      type: Number,
      required: true,
      min: 0,
    },
    completedSuccessfully: {
      type: Boolean,
      required: true,
    },
    resultType: {
      type: String,
      enum: ['EXCELLENT', 'SUCCESS', 'FAIL'],
      default: 'FAIL'
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    earnedBadgeIds: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Badge' // Optional: Reference to a Badge model if exists
        }
    ],
    orderCorrect: {
      type: Boolean,
      default: false
    },
    placementOrder: {
      type: [Number],
      default: []
    },
    
    // === V2 인지과학적 측정 변수들 ===
    // 시간 분석 변수 (모두 optional)
    firstClickLatency: {
      type: Number,
      min: 0
    },
    interClickIntervals: {
      type: [Number],
      default: []
    },
    hesitationPeriods: {
      type: [Number], 
      default: []
    },
    
    // 공간 인지 변수 (모두 optional)
    spatialErrors: {
      type: [Number],
      default: []
    },
    clickPositions: {
      type: [{
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        timestamp: { type: Number, required: true }
      }],
      default: []
    },
    correctPositions: {
      type: [{
        x: { type: Number, required: true },
        y: { type: Number, required: true }
      }],
      default: []
    },
    
    // 순서 및 패턴 변수 (모두 optional)
    sequentialAccuracy: {
      type: Number,
      min: 0,
      max: 1
    },
    temporalOrderViolations: {
      type: Number,
      min: 0,
      default: 0
    },
    
    // 메타 정보
    detailedDataVersion: {
      type: String,
      default: 'v1.0'
    },

    // --- V2 상세 데이터 필드 (v2.0) ---
    detailedMetrics: {
      firstClickLatency: { type: Number },
      interClickIntervals: { type: [Number] },
      hesitationPeriods: { type: [Object] }, // { duration: Number, position: {x,y} }
      spatialErrors: { type: [Object] }, // { expected: {x,y}, actual: {x,y}, distance: Number }
      clickPositions: { type: [Object] }, // { x: Number, y: Number, timestamp: Number }
      correctPositions: { type: [Object] }, // { x: Number, y: Number }
      sequentialAccuracy: { type: Number }, // 0~1 사이의 값
      temporalOrderViolations: { type: Number },
      spatialPatternRecognition: { type: Number },
      cognitiveLoadManagement: { type: Number },
      taskSwitchingCost: { type: Number },
      errorAdaptability: { type: Number },
      emotionalRegulation: { type: Number },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only add createdAt automatically
    collection: 'zengoSessionResults' // Optional: Explicitly set collection name
  }
);

// Create and export the Mongoose model
const ZengoSessionResult = mongoose.model<IZengoSessionResult>(
  'ZengoSessionResult',
  ZengoSessionResultSchema
);

export default ZengoSessionResult; 