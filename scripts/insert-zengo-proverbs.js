/**
 * 교육적 가치가 높은 명문장/명언/속담 데이터를 MongoDB에 추가하는 스크립트
 * 
 * 이 스크립트는 지정된 데이터 파일의 속담/명언을 zengo 컬렉션에 추가합니다.
 * 
 * 실행 방법:
 * 1. 기본 실행: node scripts/insert-zengo-proverbs.js <데이터파일경로>
 *    예: node scripts/insert-zengo-proverbs.js ./scripts/zengo-proverbs-en.js
 * 
 * 2. 검증만 수행: node scripts/insert-zengo-proverbs.js <데이터파일경로> --validate-only
 *    데이터를 실제로 추가하지 않고 유효성만 검사합니다.
 */

const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

// MongoDB 연결 정보
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33';

// 명령행 인수 처리
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('사용법: node scripts/insert-zengo-proverbs.js <데이터파일경로> [--validate-only]');
  console.log('예시: node scripts/insert-zengo-proverbs.js ./scripts/zengo-proverbs-en.js');
  process.exit(1);
}

const dataFilePath = args[0];
const validateOnly = args.includes('--validate-only');

async function insertZengoProverbs() {
  let client;
  
  try {
    // 데이터 파일 로드
    const absolutePath = path.resolve(dataFilePath);
    if (!fs.existsSync(absolutePath)) {
      console.error(`오류: 파일을 찾을 수 없습니다 - ${absolutePath}`);
      process.exit(1);
    }
    
    console.log(`데이터 파일 로드 중: ${absolutePath}`);
    const zengoProverbs = require(absolutePath);
    
    if (!Array.isArray(zengoProverbs) || zengoProverbs.length === 0) {
      console.error('오류: 데이터 파일에 유효한 속담/명언 배열이 없습니다.');
      process.exit(1);
    }
    
    console.log(`데이터 파일에서 ${zengoProverbs.length}개의 항목을 로드했습니다.`);
    
    // 데이터 유효성 검증
    const validationErrors = validateProverbs(zengoProverbs);
    
    if (validationErrors.length > 0) {
      console.error('\n❌ 데이터 유효성 검사 실패:');
      validationErrors.forEach((err, idx) => {
        console.error(`[${idx + 1}] ${err}`);
      });
      process.exit(1);
    }
    
    console.log('✅ 모든 데이터가 유효합니다.');
    
    // 검증만 수행하는 경우 여기서 종료
    if (validateOnly) {
      console.log('--validate-only 옵션이 사용되어 데이터가 추가되지 않았습니다.');
      return;
    }
    
    // MongoDB에 연결
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('MongoDB에 연결되었습니다.');
    
    const db = client.db();
    const zengoCollection = db.collection('zengo');
    
    // 유효성 검사를 통과한 데이터를 MongoDB에 추가
    let insertCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const proverb of zengoProverbs) {
      try {
        // totalWords와 totalAllowedStones 자동 계산
        const wordMappingsLength = proverb.wordMappings.length;
        
        if (proverb.totalWords === 0 || proverb.totalWords !== wordMappingsLength) {
          proverb.totalWords = wordMappingsLength;
        }
        
        if (proverb.totalAllowedStones === 0 || proverb.totalAllowedStones < proverb.totalWords) {
          proverb.totalAllowedStones = proverb.totalWords + 3; // 기본 여유 3개
        }
        
        // 중복 확인 (같은 level, language, proverbText 조합)
        const existingProverb = await zengoCollection.findOne({
          level: proverb.level,
          language: proverb.language,
          proverbText: proverb.proverbText
        });
        
        if (existingProverb) {
          console.log(`⚠️ 건너뜀: "${proverb.proverbText}" (${proverb.level}, ${proverb.language}) - 이미 존재함`);
          skipCount++;
        } else {
          await zengoCollection.insertOne(proverb);
          console.log(`✅ 추가됨: "${proverb.proverbText}" (${proverb.level}, ${proverb.language})`);
          insertCount++;
        }
      } catch (err) {
        console.error(`❌ 오류: "${proverb.proverbText}" 추가 실패 - ${err.message}`);
        errorCount++;
      }
    }
    
    // 결과 요약
    console.log('\n=== 처리 결과 ===');
    console.log(`총 항목 수: ${zengoProverbs.length}개`);
    console.log(`추가된 항목: ${insertCount}개`);
    console.log(`건너뛴 항목: ${skipCount}개 (중복)`);
    console.log(`오류 항목: ${errorCount}개`);
    
  } catch (error) {
    console.error('데이터 추가 중 오류 발생:', error);
  } finally {
    // 연결 종료
    if (client) {
      await client.close();
      console.log('\nMongoDB 연결이 종료되었습니다.');
    }
  }
}

// 데이터 유효성 검증 함수
function validateProverbs(proverbsArray) {
  const errors = [];
  const validLanguages = ['ko', 'en', 'zh', 'ja'];
  const validLevels = ['3x3-easy', '5x5-medium', '7x7-hard'];
  const validBoardSizes = [3, 5, 7];
  
  proverbsArray.forEach((proverb, idx) => {
    const prefix = `항목 #${idx + 1} (${proverb.proverbText || '텍스트 없음'})`;
    
    // 필수 필드 확인
    if (!proverb.level) errors.push(`${prefix}: level 필드가 없습니다.`);
    if (!proverb.language) errors.push(`${prefix}: language 필드가 없습니다.`);
    if (!proverb.boardSize) errors.push(`${prefix}: boardSize 필드가 없습니다.`);
    if (!proverb.proverbText) errors.push(`${prefix}: proverbText 필드가 없습니다.`);
    if (!Array.isArray(proverb.wordMappings)) errors.push(`${prefix}: wordMappings 필드가 배열이 아닙니다.`);
    
    // 값 유효성 확인
    if (proverb.level && !validLevels.includes(proverb.level)) {
      errors.push(`${prefix}: 유효하지 않은 level 값입니다. (${proverb.level})`);
    }
    
    if (proverb.language && !validLanguages.includes(proverb.language)) {
      errors.push(`${prefix}: 유효하지 않은 language 값입니다. (${proverb.language})`);
    }
    
    if (proverb.boardSize && !validBoardSizes.includes(proverb.boardSize)) {
      errors.push(`${prefix}: 유효하지 않은 boardSize 값입니다. (${proverb.boardSize})`);
    }
    
    // level과 boardSize 일치 확인
    if (proverb.level && proverb.boardSize) {
      if (proverb.level.startsWith('3x3') && proverb.boardSize !== 3) {
        errors.push(`${prefix}: level이 3x3인데 boardSize가 3이 아닙니다.`);
      } else if (proverb.level.startsWith('5x5') && proverb.boardSize !== 5) {
        errors.push(`${prefix}: level이 5x5인데 boardSize가 5가 아닙니다.`);
      } else if (proverb.level.startsWith('7x7') && proverb.boardSize !== 7) {
        errors.push(`${prefix}: level이 7x7인데 boardSize가 7이 아닙니다.`);
      }
    }
    
    // wordMappings 유효성 확인
    if (Array.isArray(proverb.wordMappings)) {
      if (proverb.wordMappings.length === 0) {
        errors.push(`${prefix}: wordMappings 배열이 비어 있습니다.`);
      }
      
      const boardSize = proverb.boardSize || 0;
      
      proverb.wordMappings.forEach((mapping, mapIdx) => {
        if (!mapping.word) {
          errors.push(`${prefix}: wordMappings[${mapIdx}]에 word 필드가 없습니다.`);
        }
        
        if (!mapping.coords) {
          errors.push(`${prefix}: wordMappings[${mapIdx}]에 coords 필드가 없습니다.`);
        } else {
          const { x, y } = mapping.coords;
          
          if (x === undefined || y === undefined) {
            errors.push(`${prefix}: wordMappings[${mapIdx}]의 coords에 x 또는 y 좌표가 없습니다.`);
          } else if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
            errors.push(`${prefix}: wordMappings[${mapIdx}]의 좌표 (${x}, ${y})가 ${boardSize}x${boardSize} 보드 범위를 벗어납니다.`);
          }
        }
      });
      
      // 중복 좌표 확인
      const coordsMap = new Map();
      proverb.wordMappings.forEach((mapping, mapIdx) => {
        if (mapping.coords) {
          const coordKey = `${mapping.coords.x},${mapping.coords.y}`;
          if (coordsMap.has(coordKey)) {
            errors.push(`${prefix}: wordMappings[${mapIdx}]와 wordMappings[${coordsMap.get(coordKey)}]가 같은 좌표 (${mapping.coords.x}, ${mapping.coords.y})를 사용합니다.`);
          } else {
            coordsMap.set(coordKey, mapIdx);
          }
        }
      });
    }
  });
  
  return errors;
}

// 스크립트 실행
insertZengoProverbs().catch(console.error);