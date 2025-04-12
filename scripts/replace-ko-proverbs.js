/**
 * 기존 한국어 zengo 문장들을 백업하고 새로운 문장들로 대체하는 스크립트
 */

const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

// MongoDB 연결 정보
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33';

// 백업 및 대체 실행
async function replaceKoProverbs() {
  let client;
  
  try {
    // MongoDB에 연결
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('MongoDB에 연결되었습니다.');
    
    const db = client.db();
    const zengoCollection = db.collection('zengo');
    
    // 기존 한국어 zengo 문장 조회
    const existingKoProverbs = await zengoCollection.find({
      language: 'ko'
    }).toArray();
    
    console.log(`현재 ${existingKoProverbs.length}개의 한국어 문장이 있습니다.`);
    
    // 기존 문장 백업
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(__dirname, `backup-ko-proverbs-${timestamp}.json`);
    
    await fs.writeFile(backupPath, JSON.stringify(existingKoProverbs, null, 2), 'utf8');
    console.log(`기존 한국어 문장들을 ${backupPath}에 백업했습니다.`);
    
    // 기존 한국어 문장 삭제
    const deleteResult = await zengoCollection.deleteMany({
      language: 'ko'
    });
    
    console.log(`${deleteResult.deletedCount}개의 기존 한국어 문장을 삭제했습니다.`);
    
    // 새 문장 불러오기
    const newProverbs = require('./zengo-proverbs-ko-combined.js');
    console.log(`${newProverbs.length}개의 새 한국어 문장을 불러왔습니다.`);
    
    // 타임스탬프 추가
    const now = new Date();
    newProverbs.forEach(proverb => {
      proverb.createdAt = now;
      proverb.updatedAt = now;
    });
    
    // 새 문장 추가
    const insertResult = await zengoCollection.insertMany(newProverbs);
    console.log(`${insertResult.insertedCount}개의 새 한국어 문장을 추가했습니다.`);
    
    // 결과 검증
    const finalCount = await zengoCollection.countDocuments({
      language: 'ko'
    });
    
    console.log(`작업 완료: 현재 ${finalCount}개의 한국어 문장이 있습니다.`);
    
    // 난이도별 카운트
    const level3x3Count = await zengoCollection.countDocuments({
      language: 'ko',
      level: '3x3-easy'
    });
    
    const level5x5Count = await zengoCollection.countDocuments({
      language: 'ko',
      level: '5x5-medium'
    });
    
    const level7x7Count = await zengoCollection.countDocuments({
      language: 'ko',
      level: '7x7-hard'
    });
    
    console.log(`난이도별 카운트:`);
    console.log(`- 3x3-easy: ${level3x3Count}개`);
    console.log(`- 5x5-medium: ${level5x5Count}개`);
    console.log(`- 7x7-hard: ${level7x7Count}개`);
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    // 연결 종료
    if (client) {
      await client.close();
      console.log('MongoDB 연결이 종료되었습니다.');
    }
  }
}

// 스크립트 실행
replaceKoProverbs().catch(console.error); 