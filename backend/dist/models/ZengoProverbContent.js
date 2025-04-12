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
// Mongoose Schema definition for ZengoProverbContent
const ZengoProverbContentSchema = new mongoose_1.Schema({
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
            validator: function (value) {
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
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    collection: 'zengo', // 명시적으로 'zengo' 컬렉션 사용 지정
    // Optional: Add a compound index for faster lookups by level and language
    // index: { level: 1, language: 1 }, { unique: true }
});
// Pre-save hook could be used to ensure totalWords matches wordMappings.length if needed
ZengoProverbContentSchema.pre('save', function (next) {
    if (this.isModified('wordMappings') || this.isNew) {
        this.totalWords = this.wordMappings.length;
    }
    // Optional validation: Check if totalAllowedStones >= totalWords
    if (this.totalAllowedStones < this.totalWords) {
        next(new Error('Total allowed stones cannot be less than the total number of words.'));
    }
    else {
        next();
    }
});
// Create and export the Mongoose model
const ZengoProverbContent = mongoose_1.default.model('ZengoProverbContent', ZengoProverbContentSchema);
exports.default = ZengoProverbContent;
