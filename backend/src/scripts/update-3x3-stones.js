/**
 * 스크립트 설명: 3x3-easy 난이도 Zengo 문장의 최대 허용 바둑돌 갯수를 8에서 5로 업데이트
 * 실행 방법: node src/scripts/update-3x3-stones.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 데이터베이스 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/habitus33')
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

// ZengoProverbContent 모델 정의
const ZengoProverbContentSchema = new mongoose.Schema({
  level: String,
  language: String,
  boardSize: Number,
  proverbText: String,
  goPatternName: String,
  wordMappings: [
    {
      word: String,
      coords: {
        x: Number,
        y: Number
      }
    }
  ],
  totalWords: Number,
  totalAllowedStones: Number,
  initialDisplayTimeMs: Number,
  targetTimeMs: Number
}, { timestamps: true, collection: 'zengo' });

const ZengoProverbContent = mongoose.model('ZengoProverbContent', ZengoProverbContentSchema);

async function updateTotalAllowedStones() {
  try {
    // 3x3-easy 난이도 문서 찾기
    const filter = { level: '3x3-easy' };
    const update = { totalAllowedStones: 5 };
    
    // totalAllowedStones가 8인 문서 찾기
    const query = { ...filter, totalAllowedStones: 8 };
    const countBefore = await ZengoProverbContent.countDocuments(query);
    
    if (countBefore === 0) {
      console.log('수정할 필요가 있는 3x3-easy 난이도 문서가 없습니다 (모든 문서가 이미 totalAllowedStones=5로 설정되어 있습니다).');
      await mongoose.disconnect();
      return;
    }
    
    console.log(`업데이트 전: ${countBefore}개의 3x3-easy 문서가 totalAllowedStones=8로 설정되어 있습니다.`);
    
    // 일괄 업데이트 수행
    const result = await ZengoProverbContent.updateMany(query, { $set: update });
    
    console.log(`업데이트 결과: ${result.matchedCount}개 문서 발견, ${result.modifiedCount}개 문서 수정됨`);
    
    // 확인을 위해 업데이트 후 카운트 조회
    const countAfter = await ZengoProverbContent.countDocuments(query);
    console.log(`업데이트 후: ${countAfter}개의 3x3-easy 문서가 totalAllowedStones=8로 남아있습니다.`);
    
    // 모든 3x3-easy 문서의 totalAllowedStones 값 목록 조회
    const allDocs = await ZengoProverbContent.find(filter).select('totalAllowedStones');
    const stonesCountMap = allDocs.reduce((acc, doc) => {
      const count = doc.totalAllowedStones;
      acc[count] = (acc[count] || 0) + 1;
      return acc;
    }, {});
    
    console.log('totalAllowedStones 값 분포:');
    Object.entries(stonesCountMap).forEach(([stones, count]) => {
      console.log(`  totalAllowedStones=${stones}: ${count}개 문서`);
    });
    
  } catch (error) {
    console.error('데이터베이스 업데이트 중 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 연결 종료');
  }
}

// 스크립트 실행
updateTotalAllowedStones(); 