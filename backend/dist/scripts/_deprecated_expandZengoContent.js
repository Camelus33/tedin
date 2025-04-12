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
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("../database");
const expandedProverbs_1 = require("./data/expandedProverbs");
const mongodb_1 = require("mongodb");
dotenv_1.default.config();
// 주어진 문장을 단어로 나누는 함수
function splitSentence(text) {
    // 한글, 영문 모두 처리할 수 있도록 공백 기준으로 분리
    return text.split(/\s+/).filter(word => word.length > 0);
}
// 중복되지 않는 랜덤 포지션을 생성하는 함수
function generateUniquePositions(count, boardSize) {
    const positions = [];
    const usedPositions = new Set();
    while (positions.length < count) {
        const x = Math.floor(Math.random() * boardSize);
        const y = Math.floor(Math.random() * boardSize);
        const posStr = `${x},${y}`;
        if (!usedPositions.has(posStr)) {
            usedPositions.add(posStr);
            positions.push({ x, y });
        }
    }
    return positions;
}
// 단어와 위치 매핑을 생성하는 함수
function generateWordMappings(words, boardSize) {
    const positions = generateUniquePositions(words.length, boardSize);
    return words.map((word, index) => ({
        word,
        position: positions[index],
        order: index + 1,
    }));
}
// 바둑판 크기에 따른 어려움 레벨 매핑
const boardSizeToLevel = {
    '3x3-easy': '쉬움',
    '5x5-medium': '중간',
    '7x7-hard': '어려움'
};
// 바둑판 크기에 따른 실제 사이즈 매핑
const boardSizeToSize = {
    '3x3-easy': 3,
    '5x5-medium': 5,
    '7x7-hard': 7
};
// ID 생성 함수
function generateId() {
    return new mongodb_1.ObjectId().toString();
}
// 명문장 데이터를 DB에 추가하는 함수
function seedExpandedContent() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 데이터베이스 연결
            const db = yield (0, database_1.connectToDatabase)();
            const zengoCollection = db.collection('zengo');
            // ID 카운터
            let idCounter = 1000; // 기존 ID와 겹치지 않도록 1000부터 시작
            let totalInserted = 0;
            // 한국어 명문장 추가
            for (const [sizeKey, proverbs] of Object.entries(expandedProverbs_1.koreanProverbs)) {
                const boardSize = boardSizeToSize[sizeKey];
                const level = boardSizeToLevel[sizeKey];
                for (const proverb of proverbs) {
                    const words = splitSentence(proverb.text);
                    const wordMappings = generateWordMappings(words, boardSize);
                    const zengoData = {
                        _id: generateId(),
                        content: proverb.text,
                        language: 'ko',
                        level,
                        boardSize,
                        wordMappings,
                    };
                    yield zengoCollection.insertOne(zengoData);
                    totalInserted++;
                }
            }
            // 영어 명문장 추가
            for (const [sizeKey, proverbs] of Object.entries(expandedProverbs_1.englishProverbs)) {
                const boardSize = boardSizeToSize[sizeKey];
                const level = boardSizeToLevel[sizeKey];
                for (const proverb of proverbs) {
                    const words = splitSentence(proverb.text);
                    const wordMappings = generateWordMappings(words, boardSize);
                    const zengoData = {
                        _id: generateId(),
                        content: proverb.text,
                        language: 'en',
                        level,
                        boardSize,
                        wordMappings,
                    };
                    yield zengoCollection.insertOne(zengoData);
                    totalInserted++;
                }
            }
            console.log(`추가 데이터 시드 완료: ${totalInserted}개의 명문장이 추가되었습니다.`);
            // 데이터베이스 연결 종료
            process.exit(0);
        }
        catch (error) {
            console.error('데이터 시드 중 오류 발생:', error);
            process.exit(1);
        }
    });
}
// 스크립트 실행
seedExpandedContent();
