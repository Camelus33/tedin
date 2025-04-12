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
const ZengoModuleSchema = new mongoose_1.Schema({
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
const ZengoScoresSchema = new mongoose_1.Schema({
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
const ZengoSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
                validator: function (modules) {
                    return modules.length > 0;
                },
                message: '최소 하나 이상의 모듈이 필요합니다',
            },
            {
                validator: function (modules) {
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
exports.default = mongoose_1.default.model('Zengo', ZengoSchema);
