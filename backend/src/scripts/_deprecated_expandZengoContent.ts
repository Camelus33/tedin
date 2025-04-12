/**
 * ⚠️ 주의: 이 파일은 더 이상 사용되지 않습니다. cleanAndUseExpandedData.ts를 사용하세요.
 * ⚠️ Warning: This file is deprecated. Use cleanAndUseExpandedData.ts instead.
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../database';
import { koreanProverbs, englishProverbs } from './data/expandedProverbs';
import { WordMapping } from '../types/zengo';
import { ObjectId } from 'mongodb';

dotenv.config();

interface Position {
  x: number;
  y: number;
}

interface WordWithPosition {
  word: string;
  position: Position;
}

// 주어진 문장을 단어로 나누는 함수
function splitSentence(text: string): string[] {
  // 한글, 영문 모두 처리할 수 있도록 공백 기준으로 분리
  return text.split(/\s+/).filter(word => word.length > 0);
}

// 중복되지 않는 랜덤 포지션을 생성하는 함수
function generateUniquePositions(count: number, boardSize: number): Position[] {
  const positions: Position[] = [];
  const usedPositions = new Set<string>();

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
function generateWordMappings(words: string[], boardSize: number): WordMapping[] {
  const positions = generateUniquePositions(words.length, boardSize);
  
  return words.map((word, index) => ({
    word,
    position: positions[index],
    order: index + 1,
  }));
}

// 바둑판 크기에 따른 어려움 레벨 매핑
const boardSizeToLevel: { [key: string]: string } = {
  '3x3-easy': '쉬움',
  '5x5-medium': '중간',
  '7x7-hard': '어려움'
};

// 바둑판 크기에 따른 실제 사이즈 매핑
const boardSizeToSize: { [key: string]: number } = {
  '3x3-easy': 3,
  '5x5-medium': 5,
  '7x7-hard': 7
};

// ID 생성 함수
function generateId(): string {
  return new ObjectId().toString();
}

// 명문장 데이터를 DB에 추가하는 함수
async function seedExpandedContent() {
  try {
    // 데이터베이스 연결
    const db = await connectToDatabase();
    const zengoCollection = db.collection('zengo');
    
    // ID 카운터
    let idCounter = 1000; // 기존 ID와 겹치지 않도록 1000부터 시작
    let totalInserted = 0;

    // 한국어 명문장 추가
    for (const [sizeKey, proverbs] of Object.entries(koreanProverbs)) {
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

        await zengoCollection.insertOne(zengoData);
        totalInserted++;
      }
    }

    // 영어 명문장 추가
    for (const [sizeKey, proverbs] of Object.entries(englishProverbs)) {
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

        await zengoCollection.insertOne(zengoData);
        totalInserted++;
      }
    }

    console.log(`추가 데이터 시드 완료: ${totalInserted}개의 명문장이 추가되었습니다.`);
    
    // 데이터베이스 연결 종료
    process.exit(0);
  } catch (error) {
    console.error('데이터 시드 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
seedExpandedContent(); 