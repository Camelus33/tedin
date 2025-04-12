/**
 * 속담/명언 데이터의 중복 단어 및 오버플로우 검사 스크립트
 * 
 * 이 스크립트는 다음 사항을 검사합니다:
 * 1. 중복 단어 (같은 단어가 여러 번 사용됨)
 * 2. 오버플로우 가능성 (너무 긴 단어)
 * 
 * 실행 방법:
 * node scripts/validate-duplicate-words.js <데이터파일경로>
 * 예: node scripts/validate-duplicate-words.js ./scripts/zengo-proverbs-en.js
 */

const path = require('path');
const fs = require('fs');

// 명령행 인수 처리
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('사용법: node scripts/validate-duplicate-words.js <데이터파일경로>');
  console.log('예시: node scripts/validate-duplicate-words.js ./scripts/zengo-proverbs-en.js');
  process.exit(1);
}

const dataFilePath = args[0];

// 최대 단어 길이 제한 (바둑판에 표시 가능한 최대 길이)
const MAX_WORD_LENGTH = {
  '3x3-easy': 8,
  '5x5-medium': 10,
  '7x7-hard': 12
};

// 처리 함수
async function validateWords() {
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
    
    console.log(`데이터 파일에서 ${zengoProverbs.length}개의 항목을 로드했습니다.\n`);
    
    // 결과 저장 변수
    let duplicateCount = 0;
    let overflowCount = 0;
    
    // 각 항목 검사
    zengoProverbs.forEach((proverb, index) => {
      const proverbNum = index + 1;
      const { level, language, proverbText, wordMappings } = proverb;
      
      if (!wordMappings || !Array.isArray(wordMappings)) {
        console.log(`[${proverbNum}] ${proverbText} (${level}, ${language}): wordMappings가 없거나 유효하지 않음`);
        return;
      }
      
      // 중복 단어 검사
      const wordCounts = {};
      let hasDuplicates = false;
      
      wordMappings.forEach(mapping => {
        const word = mapping.word;
        if (word) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
          if (wordCounts[word] > 1) {
            hasDuplicates = true;
          }
        }
      });
      
      const duplicates = Object.entries(wordCounts)
        .filter(([_, count]) => count > 1)
        .map(([word, count]) => `'${word}' (${count}회)`);
      
      if (hasDuplicates) {
        console.log(`⚠️ [${proverbNum}] "${proverbText}" (${level}, ${language}): 중복 단어 발견 - ${duplicates.join(', ')}`);
        duplicateCount++;
      }
      
      // 오버플로우 검사
      const maxLength = MAX_WORD_LENGTH[level] || 8;
      const longWords = wordMappings
        .filter(mapping => mapping.word && mapping.word.length > maxLength)
        .map(mapping => `'${mapping.word}' (${mapping.word.length}자)`);
      
      if (longWords.length > 0) {
        console.log(`⚠️ [${proverbNum}] "${proverbText}" (${level}, ${language}): 너무 긴 단어 발견 - ${longWords.join(', ')}`);
        overflowCount++;
      }
    });
    
    // 결과 요약
    console.log('\n=== 검사 결과 요약 ===');
    console.log(`총 항목 수: ${zengoProverbs.length}개`);
    console.log(`중복 단어 항목: ${duplicateCount}개`);
    console.log(`오버플로우 가능성 항목: ${overflowCount}개`);
    
    if (duplicateCount === 0 && overflowCount === 0) {
      console.log('✅ 모든 항목이 중복 단어와 오버플로우 검사를 통과했습니다!');
    } else {
      console.log(`\n⚠️ 주의: ${duplicateCount + overflowCount}개의 항목에 문제가 발견되었습니다.`);
      console.log('위 항목들을 수정한 후 다시 검사하세요.');
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

// 스크립트 실행
validateWords().catch(console.error); 