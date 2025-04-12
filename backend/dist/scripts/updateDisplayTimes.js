"use strict";
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
const ZengoProverbContent_1 = __importDefault(require("../models/ZengoProverbContent"));
// Load environment variables
dotenv_1.default.config();
// Connect to MongoDB
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33');
        console.log('Connected to MongoDB');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
});
// Update display times for 5x5-medium and 7x7-hard levels
const updateDisplayTimes = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Update 5x5-medium to 10 seconds (10000ms)
        const medium5x5Result = yield ZengoProverbContent_1.default.updateMany({ level: '5x5-medium' }, { $set: { initialDisplayTimeMs: 10000 } });
        console.log(`Updated 5x5-medium display times to 10 seconds (${medium5x5Result.modifiedCount} documents modified)`);
        // Update 7x7-hard to 20 seconds (20000ms)
        const hard7x7Result = yield ZengoProverbContent_1.default.updateMany({ level: '7x7-hard' }, { $set: { initialDisplayTimeMs: 20000 } });
        console.log(`Updated 7x7-hard display times to 20 seconds (${hard7x7Result.modifiedCount} documents modified)`);
        console.log('Display time update completed successfully!');
    }
    catch (error) {
        console.error('Error updating display times:', error);
    }
    finally {
        mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
});
// Run the script
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield connectDB();
    yield updateDisplayTimes();
}))();
