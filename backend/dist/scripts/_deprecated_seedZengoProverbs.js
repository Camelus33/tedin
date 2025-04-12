"use strict";
/**
 * ⚠️ 주의: 이 파일은 더 이상 사용되지 않습니다. cleanAndUseExpandedData.ts를 사용하세요.
 * ⚠️ Warning: This file is deprecated. Use cleanAndUseExpandedData.ts instead.
 *
 * Zengo 속담 데이터 MongoDB 마이그레이션 스크립트
 *
 * 난이도별로 분류된 한국어/영어 속담을 MongoDB에 저장합니다.
 * 각 속담은 난이도, 언어, 표시시간 등의 메타데이터와 함께 저장됩니다.
 *
 * 실행 방법: ts-node src/scripts/seedZengoProverbs.ts
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
const ZengoProverbContent_1 = __importDefault(require("../models/ZengoProverbContent"));
const expandedProverbs_1 = require("./data/expandedProverbs");
// 환경 변수 로드
dotenv_1.default.config();
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33';
/**
 * 단어 매핑 생성 함수
 * @param text 속담 텍스트
 * @param boardSize 게임판 크기
 * @returns 생성된 단어 매핑 배열
 */
function generateWordMappings(text, boardSize) {
    const words = text.split(/\s+/);
    const mappings = [];
    // 사용된 위치 추적
    const usedPositions = new Set();
    for (const word of words) {
        let position;
        // 중복되지 않는 랜덤 위치 생성
        do {
            const x = Math.floor(Math.random() * boardSize);
            const y = Math.floor(Math.random() * boardSize);
            position = { x, y };
        } while (usedPositions.has(`${position.x},${position.y}`));
        // 사용된 위치 기록
        usedPositions.add(`${position.x},${position.y}`);
        mappings.push({
            word,
            position
        });
    }
    return mappings;
}
/**
 * 게임 난이도에 따른 표시 시간 설정 (밀리초)
 */
function getDisplayTimeMs(level) {
    switch (level) {
        case '3x3-easy':
            return 4000; // 4초
        case '5x5-medium':
            return 8000; // 8초
        case '7x7-hard':
            return 14000; // 14초
        default:
            return 5000; // 기본값
    }
}
/**
 * 게임 난이도에 따른 보드 크기 설정
 */
function getBoardSize(level) {
    if (level.startsWith('3x3'))
        return 3;
    if (level.startsWith('5x5'))
        return 5;
    if (level.startsWith('7x7'))
        return 7;
    return 3; // 기본값
}
// 단어를 공백으로 분리하는 함수
function splitSentence(text, language) {
    // 한글은 공백으로, 영어는 공백과 구두점으로 분리
    const pattern = language === 'ko' ? /\s+/ : /[\s.,;!?]+/;
    return text.split(pattern).filter(word => word.trim().length > 0);
}
// 중복되지 않는 랜덤 위치 생성 함수
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
// 난이도에 따른 보드 크기 매핑
const boardSizes = {
    '3x3-easy': 3,
    '5x5-medium': 5,
    '7x7-hard': 7
};
// 난이도에 따른 설정값 (표시 시간, 목표 시간, 추가 돌 수)
const difficultySettings = {
    '3x3-easy': {
        initialDisplayTimeMs: 3000, // 3초
        targetTimeMs: 30000, // 30초
        extraStones: 3 // 단어 수 + 3개의 돌 허용
    },
    '5x5-medium': {
        initialDisplayTimeMs: 5000, // 5초
        targetTimeMs: 60000, // 60초
        extraStones: 5 // 단어 수 + 5개의 돌 허용
    },
    '7x7-hard': {
        initialDisplayTimeMs: 7000, // 7초
        targetTimeMs: 120000, // 120초
        extraStones: 7 // 단어 수 + 7개의 돌 허용
    }
};
/**
 * 속담 데이터를 MongoDB에 저장하는 함수
 */
function seedZengoProverbs() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('속담 데이터 마이그레이션 시작...');
            // MongoDB 연결
            yield mongoose_1.default.connect(MONGO_URI);
            console.log('MongoDB에 연결되었습니다.');
            // 기존 데이터 백업 (옵션)
            const existingCount = yield ZengoProverbContent_1.default.countDocuments();
            console.log(`기존 ZengoProverbContent 컬렉션에 ${existingCount}개의 문서가 있습니다.`);
            // 사용자 확인 (옵션)
            if (existingCount > 0) {
                console.log('주의: 이 스크립트는 기존 데이터를 유지하고 새 데이터를 추가합니다.');
                console.log('계속 진행합니다...');
            }
            let totalInserted = 0;
            const errors = [];
            // 한국어 속담 처리
            console.log('\n한국어 속담 처리 중...');
            for (const [level, proverbs] of Object.entries(expandedProverbs_1.koreanProverbs)) {
                console.log(`${level} 레벨 처리 중 (${proverbs.length}개 속담)`);
                const boardSize = boardSizes[level];
                const settings = difficultySettings[level];
                for (const proverb of proverbs) {
                    try {
                        // 단어 분리
                        const words = splitSentence(proverb.text, 'ko');
                        if (words.length === 0)
                            continue;
                        // 단어 위치 생성
                        const positions = generateUniquePositions(words.length, boardSize);
                        // 단어 매핑 생성
                        const wordMappings = words.map((word, index) => ({
                            word,
                            position: positions[index],
                            order: index + 1
                        }));
                        // 프로버브 문서 생성
                        const proverbContent = new ZengoProverbContent_1.default({
                            level,
                            language: 'ko',
                            boardSize,
                            proverbText: proverb.text,
                            goPatternName: '', // 필요 시 추가
                            wordMappings,
                            totalWords: words.length,
                            totalAllowedStones: words.length + settings.extraStones,
                            initialDisplayTimeMs: settings.initialDisplayTimeMs,
                            targetTimeMs: settings.targetTimeMs
                        });
                        // MongoDB에 저장
                        yield proverbContent.save();
                        totalInserted++;
                        // 진행 상황 표시 (100개마다)
                        if (totalInserted % 100 === 0) {
                            console.log(`${totalInserted}개 속담 처리 완료`);
                        }
                    }
                    catch (error) {
                        errors.push({ proverb: proverb.text, error: error.message });
                        console.error(`속담 "${proverb.text}" 처리 중 오류 발생:`, error.message);
                    }
                }
            }
            // 영어 속담 처리
            console.log('\n영어 속담 처리 중...');
            for (const [level, proverbs] of Object.entries(expandedProverbs_1.englishProverbs)) {
                console.log(`${level} 레벨 처리 중 (${proverbs.length}개 속담)`);
                const boardSize = boardSizes[level];
                const settings = difficultySettings[level];
                for (const proverb of proverbs) {
                    try {
                        // 단어 분리
                        const words = splitSentence(proverb.text, 'en');
                        if (words.length === 0)
                            continue;
                        // 단어 위치 생성
                        const positions = generateUniquePositions(words.length, boardSize);
                        // 단어 매핑 생성
                        const wordMappings = words.map((word, index) => ({
                            word,
                            position: positions[index],
                            order: index + 1
                        }));
                        // 프로버브 문서 생성
                        const proverbContent = new ZengoProverbContent_1.default({
                            level,
                            language: 'en',
                            boardSize,
                            proverbText: proverb.text,
                            goPatternName: '', // 필요 시 추가
                            wordMappings,
                            totalWords: words.length,
                            totalAllowedStones: words.length + settings.extraStones,
                            initialDisplayTimeMs: settings.initialDisplayTimeMs,
                            targetTimeMs: settings.targetTimeMs
                        });
                        // MongoDB에 저장
                        yield proverbContent.save();
                        totalInserted++;
                        // 진행 상황 표시 (100개마다)
                        if (totalInserted % 100 === 0) {
                            console.log(`${totalInserted}개 속담 처리 완료`);
                        }
                    }
                    catch (error) {
                        errors.push({ proverb: proverb.text, error: error.message });
                        console.error(`속담 "${proverb.text}" 처리 중 오류 발생:`, error.message);
                    }
                }
            }
            // 결과 출력
            console.log('\n==== 마이그레이션 완료 ====');
            console.log(`총 ${totalInserted}개 속담이 성공적으로 저장되었습니다.`);
            if (errors.length > 0) {
                console.log(`${errors.length}개 속담 처리 중 오류가 발생했습니다.`);
            }
            // MongoDB 연결 종료
            yield mongoose_1.default.disconnect();
            console.log('MongoDB 연결이 종료되었습니다.');
            process.exit(0);
        }
        catch (error) {
            console.error('속담 마이그레이션 중 오류 발생:', error);
            process.exit(1);
        }
    });
}
// 스크립트 실행
seedZengoProverbs().catch(error => {
    console.error('치명적 오류:', error);
    process.exit(1);
});
