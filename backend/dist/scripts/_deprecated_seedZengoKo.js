"use strict";
/**
 * ⚠️ 주의: 이 파일은 더 이상 사용되지 않습니다. cleanAndUseExpandedData.ts를 사용하세요.
 * ⚠️ Warning: This file is deprecated. Use cleanAndUseExpandedData.ts instead.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const ZengoProverbContent_1 = __importDefault(require("../models/ZengoProverbContent"));
// Load environment variables from backend/.env
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
// Use Partial<> to allow objects with only the required seeding fields
const seedData = [
    // --- 3x3 Easy Example --- 
    {
        level: '3x3-easy',
        language: 'ko',
        boardSize: 3,
        proverbText: '세 살 버릇 여든까지 간다',
        goPatternName: 'Simple Corner', // Placeholder pattern name
        wordMappings: [
            { word: '세', coords: { x: 0, y: 0 } },
            { word: '살', coords: { x: 1, y: 0 } },
            { word: '버릇', coords: { x: 0, y: 1 } },
            // ... more words mapped simply
            { word: '여든까지', coords: { x: 1, y: 1 } },
            { word: '간다', coords: { x: 2, y: 2 } },
        ],
        totalWords: 5, // Should match wordMappings length
        totalAllowedStones: 8, // Example: words + 3 extra chances
        initialDisplayTimeMs: 5000, // 5 seconds
        targetTimeMs: 15000, // 15 seconds target
    },
    // --- 5x5 Medium Example --- 
    {
        level: '5x5-medium',
        language: 'ko',
        boardSize: 5,
        proverbText: '시작이 반이다',
        goPatternName: 'Basic Enclosure', // Placeholder pattern name
        wordMappings: [
            { word: '시작이', coords: { x: 1, y: 1 } },
            { word: '반이다', coords: { x: 3, y: 3 } },
            // Example placing two words farther apart
        ],
        totalWords: 2,
        totalAllowedStones: 5, // Example: words + 3 extra chances
        initialDisplayTimeMs: 4000, // 4 seconds
        targetTimeMs: 12000, // 12 seconds target
    },
    // --- 7x7 Hard Example ---
    {
        level: '7x7-hard',
        language: 'ko',
        boardSize: 7,
        proverbText: '나는 생각한다 고로 존재한다',
        goPatternName: 'Scattered Stones', // Placeholder pattern name
        wordMappings: [
            { word: '나는', coords: { x: 1, y: 1 } },
            { word: '생각한다', coords: { x: 3, y: 3 } },
            { word: '고로', coords: { x: 5, y: 1 } },
            { word: '존재한다', coords: { x: 3, y: 5 } },
        ],
        totalWords: 4,
        totalAllowedStones: 7, // Example: words + 3 extra chances
        initialDisplayTimeMs: 3500, // 3.5 seconds
        targetTimeMs: 10000, // 10 seconds target
    },
    // --- English Content (NEW) --- 
    {
        level: '3x3-easy', // Same level identifier, different language
        language: 'en',
        boardSize: 3,
        proverbText: 'An apple a day keeps the doctor away', // Longer text needs more words/stones
        goPatternName: 'Simple EN',
        wordMappings: [
            { word: 'An', coords: { x: 0, y: 0 } },
            { word: 'apple', coords: { x: 1, y: 0 } },
            { word: 'a', coords: { x: 2, y: 0 } },
            { word: 'day', coords: { x: 0, y: 1 } },
            { word: 'keeps', coords: { x: 1, y: 1 } },
            { word: 'the', coords: { x: 2, y: 1 } },
            { word: 'doctor', coords: { x: 0, y: 2 } },
            { word: 'away', coords: { x: 1, y: 2 } },
        ],
        totalWords: 8,
        totalAllowedStones: 12, // words + 4 extra
        initialDisplayTimeMs: 6000, // 6 seconds
        targetTimeMs: 20000, // 20 seconds target
    },
    {
        level: '5x5-medium',
        language: 'en',
        boardSize: 5,
        proverbText: 'Actions speak louder than words',
        goPatternName: 'Diagonal EN',
        wordMappings: [
            { word: 'Actions', coords: { x: 0, y: 0 } },
            { word: 'speak', coords: { x: 1, y: 1 } },
            { word: 'louder', coords: { x: 2, y: 2 } },
            { word: 'than', coords: { x: 3, y: 3 } },
            { word: 'words', coords: { x: 4, y: 4 } },
        ],
        totalWords: 5,
        totalAllowedStones: 9, // words + 4 extra
        initialDisplayTimeMs: 5000, // 5 seconds
        targetTimeMs: 15000, // 15 seconds target
    },
    {
        level: '7x7-hard',
        language: 'en',
        boardSize: 7,
        proverbText: 'To be or not to be that is the question',
        goPatternName: 'Outer Ring EN',
        wordMappings: [
            { word: 'To', coords: { x: 0, y: 3 } },
            { word: 'be', coords: { x: 1, y: 1 } },
            { word: 'or', coords: { x: 3, y: 0 } },
            { word: 'not', coords: { x: 5, y: 1 } },
            { word: 'to', coords: { x: 6, y: 3 } },
            { word: 'be', coords: { x: 5, y: 5 } }, // Need unique mapping or board logic to handle duplicates?
            { word: 'that', coords: { x: 3, y: 6 } },
            { word: 'is', coords: { x: 1, y: 5 } },
            { word: 'the', coords: { x: 2, y: 3 } },
            { word: 'question', coords: { x: 4, y: 3 } },
        ],
        totalWords: 10,
        totalAllowedStones: 15, // words + 5 extra
        initialDisplayTimeMs: 7000, // 7 seconds (more words)
        targetTimeMs: 25000, // 25 seconds target
    },
    // Add more EN content here...
];
const seedDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dbUri = process.env.DATABASE_URL;
        if (!dbUri) {
            throw new Error('DATABASE_URL environment variable not set.');
        }
        yield mongoose_1.default.connect(dbUri);
        console.log('MongoDB Connected for seeding...');
        // Clear existing KO content first (optional, depends on strategy)
        // await ZengoProverbContent.deleteMany({ language: 'ko' });
        // console.log('Existing KO Zengo content cleared.');
        // Insert new data, checking for duplicates by level and language
        for (const content of seedData) {
            const existing = yield ZengoProverbContent_1.default.findOne({
                level: content.level, // level and language are required by Partial logic here
                language: content.language
            });
            if (!existing) {
                // Add null/undefined checks or assertions for optional fields from Partial
                if (!content.wordMappings || content.totalWords === undefined || content.totalAllowedStones === undefined) {
                    console.warn(`Skipping seeding for ${content.level} (${content.language}) due to missing essential fields (wordMappings, totalWords, or totalAllowedStones).`);
                    continue; // Skip this entry if essential data is missing
                }
                // Validate word count matches mapping length
                if (content.totalWords !== content.wordMappings.length) {
                    console.warn(`Correcting totalWords for ${content.level} (${content.language}). Expected ${content.wordMappings.length}, got ${content.totalWords}`);
                    content.totalWords = content.wordMappings.length;
                }
                // Validate allowed stones >= words
                if (content.totalAllowedStones < content.totalWords) {
                    console.warn(`Correcting totalAllowedStones for ${content.level} (${content.language}). Needs to be >= ${content.totalWords}, got ${content.totalAllowedStones}`);
                    content.totalAllowedStones = content.totalWords + 3; // Example correction
                }
                yield ZengoProverbContent_1.default.create(content); // Assert type for creation
                console.log(`Seeded: ${content.level} (${content.language})`);
            }
            else {
                console.log(`Skipped (already exists): ${content.level} (${content.language})`);
            }
        }
        console.log('Database seeding completed successfully.');
    }
    catch (error) {
        console.error('Error seeding database:', error);
    }
    finally {
        yield mongoose_1.default.disconnect();
        console.log('MongoDB Disconnected.');
    }
});
seedDB();
