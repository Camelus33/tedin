/**
 * MongoDB 데이터베이스의 zengo 컬렉션 데이터 분포 분석 스크립트
 * 
 * 이 스크립트는 다음 사항을 분석합니다:
 * 1. 모드별(난이도/언어) 명문장/명언/속담 분포
 * 2. 각 모드별 필요한 추가 데이터 수량
 * 
 * 실행 방법: node scripts/analyze-zengo-distribution.js
 */

const { MongoClient } = require('mongodb');

// MongoDB 연결 정보
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33';

// 목표 데이터 수 (각 모드별 33개)
const TARGET_COUNT = 33;

async function analyzeZengoDistribution() {
  let client;
  
  try {
    // MongoDB에 연결
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('MongoDB에 연결되었습니다.');
    
    const db = client.db();
    const zengoCollection = db.collection('zengo');
    
    // 전체 데이터 개수 확인
    const totalCount = await zengoCollection.countDocuments({});
    console.log(`총 속담 데이터 수: ${totalCount}개\n`);
    
    // 지원하는 언어 및 난이도 목록
    const languages = ['ko', 'en', 'zh', 'ja'];
    const levels = ['3x3-easy', '5x5-medium', '7x7-hard'];
    
    // 분포 통계를 위한 객체
    const distribution = {};
    const missingCounts = {};
    let totalMissing = 0;
    
    // 각 언어와 난이도별 데이터 개수 확인
    console.log('=== 모드별 데이터 분포 ===');
    console.log('모드\t\t데이터 수\t상태\t\t필요 추가 수');
    console.log('-------------------------------------------------------');
    
    for (const language of languages) {
      distribution[language] = {};
      missingCounts[language] = {};
      
      for (const level of levels) {
        const count = await zengoCollection.countDocuments({ level, language });
        distribution[language][level] = count;
        
        const missing = count < TARGET_COUNT ? TARGET_COUNT - count : 0;
        missingCounts[language][level] = missing;
        totalMissing += missing;
        
        const mode = `${level}/${language}`;
        const status = count >= TARGET_COUNT ? '✅ 충분' : count > 0 ? '⚠️ 부족' : '❌ 없음';
        
        console.log(`${mode}\t${count}\t\t${status}\t\t${missing}`);
      }
    }
    
    // 요약 정보
    console.log('\n=== 요약 ===');
    console.log(`총 데이터 수: ${totalCount}개`);
    console.log(`필요한 추가 데이터 수: ${totalMissing}개`);
    
    // 언어별 통계
    console.log('\n=== 언어별 통계 ===');
    for (const language of languages) {
      const langTotal = Object.values(distribution[language]).reduce((sum, count) => sum + count, 0);
      const langMissing = Object.values(missingCounts[language]).reduce((sum, count) => sum + count, 0);
      console.log(`${language}: ${langTotal}개 (추가 필요: ${langMissing}개)`);
    }
    
    // 난이도별 통계
    console.log('\n=== 난이도별 통계 ===');
    for (const level of levels) {
      let levelTotal = 0;
      let levelMissing = 0;
      
      for (const language of languages) {
        levelTotal += distribution[language][level] || 0;
        levelMissing += missingCounts[language][level] || 0;
      }
      
      console.log(`${level}: ${levelTotal}개 (추가 필요: ${levelMissing}개)`);
    }
    
    // 추천 사항
    console.log('\n=== 추천 사항 ===');
    if (totalMissing > 0) {
      console.log('다음 모드에 교육적 가치가 높은 명문장/명언/속담을 추가해야 합니다:');
      
      for (const language of languages) {
        for (const level of levels) {
          const missing = missingCounts[language][level];
          if (missing > 0) {
            console.log(`- ${level}/${language}: ${missing}개 추가 필요`);
          }
        }
      }
    } else {
      console.log('모든 모드에 충분한 데이터가 있습니다. 추가 작업이 필요하지 않습니다.');
    }
    
  } catch (error) {
    console.error('데이터 분석 중 오류 발생:', error);
  } finally {
    // 연결 종료
    if (client) {
      await client.close();
      console.log('\nMongoDB 연결이 종료되었습니다.');
    }
  }
}

// 스크립트 실행
analyzeZengoDistribution().catch(console.error); 