/**
 * MongoDB 데이터베이스의 zengo 컬렉션 데이터 업데이트 스크립트
 * 
 * 이 스크립트는 다음과 같은 문제를 해결합니다:
 * 1. 테스트용 자동 생성 속담 삭제
 * 2. totalWords와 wordMappings 길이 불일치 수정
 * 3. totalAllowedStones가 totalWords보다 작은 경우 수정
 * 
 * 실행 방법: node scripts/update-zengo-data.js
 */

const { MongoClient } = require('mongodb');

// MongoDB 연결 정보
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33';

async function updateZengoData() {
  let client;
  
  try {
    // MongoDB에 연결
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('MongoDB에 연결되었습니다.');
    
    const db = client.db();
    const zengoCollection = db.collection('zengo');
    
    // 1. 테스트 데이터 삭제 (Auto generated proverb로 시작하는 속담)
    const deleteResult = await zengoCollection.deleteMany({
      proverbText: /^Auto generated proverb/
    });
    console.log(`삭제된 테스트 데이터: ${deleteResult.deletedCount}개`);
    
    // 2. totalWords와 wordMappings 길이 일치시키기
    const allProverbs = await zengoCollection.find({}).toArray();
    let updatedCount = 0;
    
    for (const proverb of allProverbs) {
      const wordMappingsLength = proverb.wordMappings ? proverb.wordMappings.length : 0;
      let updateNeeded = false;
      const updateDoc = { $set: {} };
      
      // totalWords 값이 wordMappings 길이와 다른 경우 수정
      if (proverb.totalWords !== wordMappingsLength) {
        updateDoc.$set.totalWords = wordMappingsLength;
        updateNeeded = true;
      }
      
      // totalAllowedStones가 totalWords보다 작은 경우 수정
      // totalWords + 3(여유 돌)으로 설정
      if (proverb.totalAllowedStones < wordMappingsLength) {
        updateDoc.$set.totalAllowedStones = wordMappingsLength + 3;
        updateNeeded = true;
      }
      
      // 업데이트가 필요한 경우에만 실행
      if (updateNeeded) {
        await zengoCollection.updateOne({ _id: proverb._id }, updateDoc);
        updatedCount++;
        console.log(`업데이트된 속담: "${proverb.proverbText}" (${proverb.level}, ${proverb.language})`);
        console.log(`  - 이전 값: totalWords=${proverb.totalWords}, totalAllowedStones=${proverb.totalAllowedStones}`);
        console.log(`  - 새 값: totalWords=${updateDoc.$set.totalWords || proverb.totalWords}, totalAllowedStones=${updateDoc.$set.totalAllowedStones || proverb.totalAllowedStones}`);
      }
    }
    
    console.log(`총 업데이트된 속담: ${updatedCount}개`);
    console.log('zengo 컬렉션 데이터 업데이트가 성공적으로 완료되었습니다.');
    
  } catch (error) {
    console.error('데이터 업데이트 중 오류 발생:', error);
  } finally {
    // 연결 종료
    if (client) {
      await client.close();
      console.log('MongoDB 연결이 종료되었습니다.');
    }
  }
}

// 스크립트 실행
updateZengoData().catch(console.error); 