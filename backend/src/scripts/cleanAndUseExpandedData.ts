import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import ZengoProverbContent from '../models/ZengoProverbContent';
// import { koreanProverbs, englishProverbs } from './data/expandedProverbs';

/**
 * 이 파일은 초기 데이터 마이그레이션용으로만 사용됩니다.
 * 이 스크립트는 MongoDB에 데이터를 초기화할 때 한 번만 실행하세요.
 * 
 * 실제 애플리케이션 코드에서는 이 파일을 직접 참조하지 말고
 * MongoDB에서 데이터를 읽고 쓰도록 구현하세요.
 * 
 * 실행 방법: npm run clean-zengo-data
 */

// MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33';

dotenv.config();

// 직접 한국어/영어 속담 데이터 정의 - 초기 데이터 로드 용도로만 사용
const koreanProverbs = {
  '3x3-easy': [
    { text: "시작이 반이다" },
    { text: "티끌 모아 태산" },
    { text: "고생 끝에 낙이 온다" },
    { text: "사공이 많으면 배가 산으로 간다" },
    { text: "웃는 낯에 침 못 뱉는다" },
    { text: "바늘 도둑이 소도둑 된다" },
    { text: "소문난 잔치에 먹을 것 없다" },
    { text: "천리 길도 한 걸음부터" },
    { text: "가는 말이 고와야 오는 말이 곱다" },
    { text: "말을 아끼면 병 없다" },
    { text: "작은 고추가 맵다" },
    { text: "세 살 버릇 여든까지 간다" },
    { text: "낮말은 새가 듣고 밤말은 쥐가 듣는다" },
    { text: "늦더라도 안 하는 것보다 낫다" },
    { text: "콩 심은 데 콩 나고 팥 심은 데 팥 난다" }
  ],
  '5x5-medium': [
    { text: "가랑비에 옷 젖는 줄 모른다" },
    { text: "가재는 게 편이라" },
    { text: "간에 붙었다 쓸개에 붙었다 한다" },
    { text: "개밥에 도토리 신세" },
    { text: "개천에서 용 난다" },
    { text: "고양이 목에 방울 달기" },
    { text: "꿈보다 해몽이 좋다" },
    { text: "꿩 대신 닭" },
    { text: "남의 떡이 커 보인다" },
    { text: "내 코가 석자" }
  ],
  '7x7-hard': [
    { text: "가는 날이 장날이라 생각지 말고 떠나는 날이 장날이라 생각하라" },
    { text: "가는 말이 고아야 오는 말이 곱고 말은 해야 말이지 안 하면 말이 아니다" },
    { text: "똥 묻은 개가 겨 묻은 개 나무란다 하여도 똥개는 똥개요 겨개는 겨개니라" },
    { text: "닭 쫓던 개 지붕 쳐다보듯 한다지만 닭 쫓던 개는 언젠가 닭을 잡을 수 있다" },
    { text: "뒷간 다르고 정낭 다르다 해도 사람 사는 정은 어디서나 똑같은 법이다" }
  ]
};

const englishProverbs = {
  '3x3-easy': [
    { text: "Actions speak louder than words" },
    { text: "All that glitters is not gold" },
    { text: "Better late than never" },
    { text: "Every cloud has a silver lining" },
    { text: "Honesty is the best policy" },
    { text: "Knowledge is power" },
    { text: "Less is more" },
    { text: "Money talks" },
    { text: "No pain no gain" },
    { text: "Practice makes perfect" }
  ],
  '5x5-medium': [
    { text: "Every dog has its day" },
    { text: "Birds of a feather flock together" },
    { text: "Take the bull by the horns" },
    { text: "Time and tide wait for none" },
    { text: "The truth will set you free" },
    { text: "Eat to live not live to eat" },
    { text: "Hope for the best expect the worst" },
    { text: "A penny saved is a penny earned" }
  ],
  '7x7-hard': [
    { text: "Do not put all your eggs in one basket at once" },
    { text: "People who live in glass houses should not throw stones" },
    { text: "One man's trash is another man's treasure to be found" },
    { text: "Empty vessels make the most noise in the crowd" },
    { text: "The early bird catches the worm but sleeps less" }
  ]
};

// 단어 분리 함수
function splitSentence(text: string): string[] {
  return text.split(/\s+/).filter(word => word.length > 0);
}

// 위치 생성 함수
function generateUniquePositions(count: number, boardSize: number): Array<{x: number, y: number}> {
  const positions: Array<{x: number, y: number}> = [];
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

// 워드 매핑 생성
function generateWordMappings(words: string[], boardSize: number): Array<{word: string, coords: {x: number, y: number}}> {
  const positions = generateUniquePositions(words.length, boardSize);
  
  return words.map((word, index) => ({
    word,
    coords: positions[index] // 위치 정보는 coords 필드에 저장
  }));
}

// 바둑판 크기 매핑
const boardSizeToSize: { [key: string]: number } = {
  '3x3-easy': 3,
  '5x5-medium': 5,
  '7x7-hard': 7
};

// 난이도 레벨 타입
type DifficultyLevel = '3x3-easy' | '5x5-medium' | '7x7-hard';

// 기본 설정값
const defaultSettings: Record<DifficultyLevel, {
  initialDisplayTimeMs: number;
  targetTimeMs: number;
  totalAllowedStones: number;
  minWords: number;
  maxWords: number;
}> = {
  '3x3-easy': {
    initialDisplayTimeMs: 4000, // 4초
    targetTimeMs: 30000,
    totalAllowedStones: 8, // 충분히 큰 값으로 수정
    minWords: 3, // 최소 단어 수
    maxWords: 4, // 최대 단어 수
  },
  '5x5-medium': {
    initialDisplayTimeMs: 8000, // 8초
    targetTimeMs: 60000,
    totalAllowedStones: 9, // 충분히 큰 값으로 수정
    minWords: 5, // 최소 단어 수
    maxWords: 6, // 최대 단어 수
  },
  '7x7-hard': {
    initialDisplayTimeMs: 14000, // 14초
    targetTimeMs: 90000,
    totalAllowedStones: 12, // 충분히 큰 값으로 수정
    minWords: 7, // 최소 단어 수
    maxWords: 8, // 최대 단어 수
  }
};

// 난이도별 한국어 추가 속담 목록
const additionalKoreanProverbs: Record<DifficultyLevel, { text: string }[]> = {
  '3x3-easy': [
    { text: "새벽달 보기" },
    { text: "빛 좋은 개살구" },
    { text: "서투른 변명" },
    { text: "마음이 넓다" },
    { text: "어물전 망신" },
    { text: "제 코가 석자" },
    { text: "가까운 이웃" },
    { text: "누워서 떡 먹기" },
    { text: "등잔 밑이 어둡다" },
    { text: "바늘 구멍" },
    { text: "소 잃고 외양간" },
    { text: "작은 고추가 맵다" },
    { text: "하늘의 별 따기" },
    { text: "산 넘어 산" },
    { text: "가는 날이 장날" }
  ],
  '5x5-medium': [
    { text: "가는 말이 고와야 오는 말이 곱다" },
    { text: "가랑비에 옷 젖는 줄 모른다" },
    { text: "고래 싸움에 새우 등 터진다" },
    { text: "개구리 올챙이 적 생각 못 한다" },
    { text: "똥 묻은 개가 겨 묻은 개 나무란다" },
    { text: "서당개 삼 년이면 풍월을 읊는다" },
    { text: "첫술에 배부를 것을 바라랴" },
    { text: "콩 심은데 콩 나고 팥 심은데 팥 난다" },
    { text: "하늘에서 내리는 비는 막을 수 없다" },
    { text: "쇠귀에 경 읽기" }
  ],
  '7x7-hard': [
    { text: "가루는 칠수록 고와지고 말은 할수록 거칠어진다" },
    { text: "간에 붙었다 쓸개에 붙었다 하는 것이 보약이다" },
    { text: "말을 타면 경마장으로 배를 타면 항구로 가는 법이다" },
    { text: "물에 빠진 사람은 지푸라기라도 잡고 싶은 심정이다" },
    { text: "바늘 구멍으로 하늘을 보는 것과 같은 좁은 시야이다" },
    { text: "사공이 많으면 배가 산으로 올라간다는 옛말을 명심하라" },
    { text: "아침에 먹은 마음과 저녁에 먹은 마음이 다를 수 있다" },
    { text: "자라보고 놀란 가슴 솥뚜껑 보고 놀라는 것처럼 예민하다" }
  ]
};

// 난이도별 영어 추가 속담 목록
const additionalEnglishProverbs: Record<DifficultyLevel, { text: string }[]> = {
  '3x3-easy': [
    { text: "Think before acting" },
    { text: "Live and learn" },
    { text: "Rest in peace" },
    { text: "Truth will prevail" },
    { text: "Like for like" },
    { text: "Better safe than sorry" },
    { text: "First things first" },
    { text: "Face the facts" },
    { text: "Save for later" },
    { text: "Good things come" },
    { text: "Follow your heart" },
    { text: "Walk the talk" },
    { text: "Easy does it" },
    { text: "Time flies fast" },
    { text: "Friends help friends" }
  ],
  '5x5-medium': [
    { text: "Every dog has its day" },
    { text: "Birds of a feather flock together" },
    { text: "Take the bull by the horns" },
    { text: "Time and tide wait for none" },
    { text: "The truth will set you free" },
    { text: "Eat to live not live to eat" },
    { text: "Hope for the best expect the worst" },
    { text: "A penny saved is a penny earned" },
    { text: "Every cloud has a silver lining" },
    { text: "Strike while the iron is hot" }
  ],
  '7x7-hard': [
    { text: "Do not put all your eggs in one basket at once" },
    { text: "People who live in glass houses should not throw stones" },
    { text: "One man's trash is another man's treasure to be found" },
    { text: "Empty vessels make the most noise in the crowd" },
    { text: "The early bird catches the worm but sleeps less" },
    { text: "All that glitters is not gold but fools are drawn" },
    { text: "Better late than never but better never late at all" },
    { text: "A friend in need is a friend indeed not in greed" }
  ]
};

async function cleanAndUseExpandedData() {
  try {
    console.log('작은 데이터셋 제거 및 확장 데이터셋 적용 시작...');
    
    // 데이터베이스 연결
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB에 연결되었습니다.');
    
    // 1. 데이터 백업
    console.log('기존 데이터 백업 중...');
    const backupData = await ZengoProverbContent.find({}).lean();
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(backupDir, `zengo_backup_${timestamp}.json`), 
      JSON.stringify(backupData, null, 2)
    );
    console.log(`${backupData.length}개 항목 백업 완료`);
    
    // 2. 기존 데이터 제거
    console.log('기존 Zengo 데이터 제거 중...');
    const deleteResult = await ZengoProverbContent.deleteMany({});
    console.log(`${deleteResult.deletedCount}개 항목 제거됨`);
    
    // 3. 확장 데이터셋 시드
    console.log('확장 데이터셋 시드 시작...');
    let totalInserted = 0;
    
    // 각 난이도별 카운터 초기화
    const insertedCount: Record<string, Record<string, number>> = {
      'ko': { '3x3-easy': 0, '5x5-medium': 0, '7x7-hard': 0 },
      'en': { '3x3-easy': 0, '5x5-medium': 0, '7x7-hard': 0 }
    };
    
    // 한국어 데이터 처리
    console.log('한국어 데이터 처리 중...');
    for (const [level, proverbs] of Object.entries(koreanProverbs)) {
      const diffLevel = level as DifficultyLevel;
      const boardSize = boardSizeToSize[level];
      const settings = defaultSettings[diffLevel];
      
      if (!settings) {
        console.log(`알 수 없는 난이도 레벨: ${level}, 건너뜁니다.`);
        continue;
      }

      console.log(`처리 중: 한국어 - ${level} (단어 수 ${settings.minWords}-${settings.maxWords}개)`);
      
      // 단어 수 기준에 맞는 속담만 필터링
      let filteredProverbs = proverbs.filter(proverb => {
        const words = splitSentence(proverb.text);
        return words.length >= settings.minWords && words.length <= settings.maxWords;
      });
      
      console.log(`기준에 맞는 속담: ${filteredProverbs.length}개`);
      
      // 33개가 되도록 속담을 추가 또는 제한
      if (filteredProverbs.length < 33) {
        // 추가 한국어 속담 적용
        let additionalProverbsNeeded = 33 - filteredProverbs.length;
        console.log(`추가로 필요한 속담: ${additionalProverbsNeeded}개`);
        
        if (additionalKoreanProverbs[diffLevel] && additionalKoreanProverbs[diffLevel].length > 0) {
          const additionalFiltered = additionalKoreanProverbs[diffLevel].filter(proverb => {
            const words = splitSentence(proverb.text);
            return words.length >= settings.minWords && words.length <= settings.maxWords;
          });
          
          // 필요한 만큼만 추가
          const addCount = Math.min(additionalProverbsNeeded, additionalFiltered.length);
          filteredProverbs = filteredProverbs.concat(additionalFiltered.slice(0, addCount));
          console.log(`추가 속담 ${addCount}개 적용됨`);
          
          // 여전히 부족한 경우 자동 생성
          additionalProverbsNeeded = 33 - filteredProverbs.length;
          if (additionalProverbsNeeded > 0) {
            console.log(`여전히 ${additionalProverbsNeeded}개 속담이 부족함, 자동 생성 중...`);
            
            for (let i = 0; i < additionalProverbsNeeded; i++) {
              // 단어 수에 맞게 속담 생성
              const wordCount = Math.floor(Math.random() * (settings.maxWords - settings.minWords + 1)) + settings.minWords;
              
              // 간단한 한국어 속담 생성 (예시)
              const generatedText = `자동 생성된 속담 ${i + 1}` + (wordCount > 3 ? ` 단어 ${wordCount}개` : "");
              filteredProverbs.push({ text: generatedText });
            }
            
            console.log(`${additionalProverbsNeeded}개 속담 자동 생성 완료`);
          }
        }
      } else if (filteredProverbs.length > 33) {
        console.log(`필터링된 속담이 33개보다 많습니다. 33개로 제한합니다.`);
        filteredProverbs = filteredProverbs.slice(0, 33);
      }
      
      console.log(`최종 적용될 속담: ${filteredProverbs.length}개`);
      
      // MongoDB에 저장
      for (const proverb of filteredProverbs) {
        const words = splitSentence(proverb.text);
        if (words.length === 0) continue;
        
        const wordMappings = generateWordMappings(words, boardSize);
        
        // ZengoProverbContent 모델을 사용하여 데이터 저장
        const zengoData = new ZengoProverbContent({
          proverbText: proverb.text,
          language: 'ko',
          level,
          boardSize,
          wordMappings,
          totalWords: words.length,
          totalAllowedStones: settings.totalAllowedStones,
          initialDisplayTimeMs: settings.initialDisplayTimeMs,
          targetTimeMs: settings.targetTimeMs,
          goPatternName: 'Basic Pattern' // 기본 패턴 이름 설정
        });
        
        await zengoData.save();
        totalInserted++;
        insertedCount['ko'][level]++;
      }
    }
    
    // 영어 데이터 처리
    console.log('\n영어 데이터 처리 중...');
    for (const [level, proverbs] of Object.entries(englishProverbs)) {
      const diffLevel = level as DifficultyLevel;
      const boardSize = boardSizeToSize[level];
      const settings = defaultSettings[diffLevel];
      
      if (!settings) {
        console.log(`알 수 없는 난이도 레벨: ${level}, 건너뜁니다.`);
        continue;
      }

      console.log(`처리 중: 영어 - ${level} (단어 수 ${settings.minWords}-${settings.maxWords}개)`);
      
      // 단어 수 기준에 맞는 속담만 필터링
      let filteredProverbs = proverbs.filter(proverb => {
        const words = splitSentence(proverb.text);
        return words.length >= settings.minWords && words.length <= settings.maxWords;
      });
      
      console.log(`기준에 맞는 속담: ${filteredProverbs.length}개`);
      
      // 33개가 되도록 속담을 추가 또는 제한
      if (filteredProverbs.length < 33) {
        // 추가 영어 속담 적용
        let additionalProverbsNeeded = 33 - filteredProverbs.length;
        console.log(`추가로 필요한 속담: ${additionalProverbsNeeded}개`);
        
        if (additionalEnglishProverbs[diffLevel] && additionalEnglishProverbs[diffLevel].length > 0) {
          const additionalFiltered = additionalEnglishProverbs[diffLevel].filter(proverb => {
            const words = splitSentence(proverb.text);
            return words.length >= settings.minWords && words.length <= settings.maxWords;
          });
          
          // 필요한 만큼만 추가
          const addCount = Math.min(additionalProverbsNeeded, additionalFiltered.length);
          filteredProverbs = filteredProverbs.concat(additionalFiltered.slice(0, addCount));
          console.log(`추가 속담 ${addCount}개 적용됨`);
          
          // 여전히 부족한 경우 자동 생성
          additionalProverbsNeeded = 33 - filteredProverbs.length;
          if (additionalProverbsNeeded > 0) {
            console.log(`여전히 ${additionalProverbsNeeded}개 속담이 부족함, 자동 생성 중...`);
            
            for (let i = 0; i < additionalProverbsNeeded; i++) {
              // 단어 수에 맞게 속담 생성
              const wordCount = Math.floor(Math.random() * (settings.maxWords - settings.minWords + 1)) + settings.minWords;
              
              // 간단한 영어 속담 생성 (예시)
              let generatedText = `Auto generated proverb ${i + 1}`;
              if (wordCount > 3) {
                generatedText += ` with ${wordCount} words`;
              }
              filteredProverbs.push({ text: generatedText });
            }
            
            console.log(`${additionalProverbsNeeded}개 속담 자동 생성 완료`);
          }
        }
      } else if (filteredProverbs.length > 33) {
        console.log(`필터링된 속담이 33개보다 많습니다. 33개로 제한합니다.`);
        filteredProverbs = filteredProverbs.slice(0, 33);
      }
      
      console.log(`최종 적용될 속담: ${filteredProverbs.length}개`);
      
      // MongoDB에 저장
      for (const proverb of filteredProverbs) {
        const words = splitSentence(proverb.text);
        if (words.length === 0) continue;
        
        const wordMappings = generateWordMappings(words, boardSize);
        
        // ZengoProverbContent 모델을 사용하여 데이터 저장
        const zengoData = new ZengoProverbContent({
          proverbText: proverb.text,
          language: 'en',
          level,
          boardSize,
          wordMappings,
          totalWords: words.length,
          totalAllowedStones: settings.totalAllowedStones,
          initialDisplayTimeMs: settings.initialDisplayTimeMs,
          targetTimeMs: settings.targetTimeMs,
          goPatternName: 'Basic Pattern' // 기본 패턴 이름 설정
        });
        
        await zengoData.save();
        totalInserted++;
        insertedCount['en'][level]++;
      }
    }
    
    console.log(`\n총 ${totalInserted}개 속담 시드 완료!`);
    
    // 4. 인덱스 생성 (모델에서 자동 처리됨)
    console.log('Mongoose 모델이 인덱스를 자동으로 관리합니다.');
    
    // 5. 검증
    for (const lang of ['ko', 'en']) {
      for (const level of ['3x3-easy', '5x5-medium', '7x7-hard']) {
        const count = await ZengoProverbContent.countDocuments({ language: lang, level });
        console.log(`[${lang}][${level}]: ${count}개 (목표: 33개)`);
      }
    }
    
    console.log('\n작은 데이터셋 제거 및 확장 데이터셋 적용 완료!');
    
    // 연결 종료
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('데이터 변경 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
cleanAndUseExpandedData().catch(err => {
  console.error('치명적 오류:', err);
  process.exit(1);
}); 