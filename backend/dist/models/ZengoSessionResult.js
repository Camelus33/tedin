"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Mongoose Schema definition for ZengoSessionResult
const ZengoSessionResultSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
        index: true,
    },
    contentId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
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
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }, // Only add createdAt automatically
    collection: 'zengoSessionResults' // Optional: Explicitly set collection name
});
// Create and export the Mongoose model
const ZengoSessionResult = mongoose_1.default.model('ZengoSessionResult', ZengoSessionResultSchema);
exports.default = ZengoSessionResult;
