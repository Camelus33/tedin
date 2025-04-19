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
        // 1. 단어 수 조건
        const wordCountOk = words.length >= settings.minWords && words.length <= settings.maxWords;
        // 2. 중복 단어 없음
        const noDuplicate = new Set(words).size === words.length;
        // 3. 각 단어 5자 이하
        const allShort = words.every(word => word.length <= 5);
        return wordCountOk && noDuplicate && allShort;
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
            console.warn(`${additionalProverbsNeeded}개 속담이 부족합니다. 더미 데이터는 생성하지 않습니다.`);
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
        // 1. 단어 수 조건
        const wordCountOk = words.length >= settings.minWords && words.length <= settings.maxWords;
        // 2. 중복 단어 없음
        const noDuplicate = new Set(words).size === words.length;
        // 3. 각 단어 5자 이하
        const allShort = words.every(word => word.length <= 5);
        return wordCountOk && noDuplicate && allShort;
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
            console.warn(`${additionalProverbsNeeded} English proverbs are missing. No dummy data will be generated.`);
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

// === 임시: 수동 입력 문장 업로드 ===
if (require.main === module && process.env.UPLOAD_MANUAL_PROVERBS === '1') {
  (async () => {
    await mongoose.connect(MONGODB_URI);
    const manualProverbs = [
      "낮말은 새가 듣는다",
      "꿈은 크게 가져라",
      "시간은 금이다",
      "말보다 행동이다",
      "티끌 모아 태산",
      "돌다리도 두드려라",
      "사공이 많으면 배가 산으로",
      "비가 온 뒤 땅이 굳는다",
      "바늘 도둑이 소 도둑",
      "작은 고추가 맵다",
      "소 잃고 외양간 고친다",
      "가는 날이 장날",
      "꺼진 불도 다시 보자",
      "눈 가리고 아웅",
      "미운 정도 정이다",
      "모난 돌이 정 맞는다",
      "물이 깊어야 고기가 모인다",
      "남의 떡이 커 보인다",
      "산에서 우는 호랑이",
      "낫 놓고 기역 자",
      "논에 물이 꽉 차야",
      "도둑이 제 발 저린다",
      "닭 쫓던 개 지붕 쳐다본다",
      "발 없는 말이 천리 간다",
      "하늘의 별 따기",
      "개구리 올챙이 적 생각 못한다",
      "말은 쉽고 행함은 어렵다",
      "고생 끝에 낙이 온다",
      "콩 심은 데 콩 난다",
      "천 리 길도 한 걸음부터",
      "빈 수레가 요란하다",
      "손바닥도 마주쳐야 소리 난다",
      "강물도 쓰면 준다"
    ];
    const boardSize = 3;
    const settings = {
      initialDisplayTimeMs: 4000,
      targetTimeMs: 30000,
      totalAllowedStones: 8
    };
    let inserted = 0;
    for (const text of manualProverbs) {
      const words = splitSentence(text);
      if (words.length < 3 || words.length > 4) continue;
      if (new Set(words).size !== words.length) continue;
      if (words.some(w => w.length > 5)) continue;
      const wordMappings = generateWordMappings(words, boardSize);
      const doc = new ZengoProverbContent({
        proverbText: text,
        language: 'ko',
        level: '3x3-easy',
        boardSize,
        wordMappings,
        totalWords: words.length,
        totalAllowedStones: settings.totalAllowedStones,
        initialDisplayTimeMs: settings.initialDisplayTimeMs,
        targetTimeMs: settings.targetTimeMs,
        goPatternName: 'Basic Pattern'
      });
      await doc.save();
      inserted++;
    }
    console.log(`수동 입력 문장 ${inserted}개 업로드 완료`);
    await mongoose.disconnect();
    process.exit(0);
  })();
}

// === 임시: 5x5 한글 수동 입력 문장 업로드 ===
if (require.main === module && process.env.UPLOAD_MANUAL_PROVERBS_5X5 === '1') {
  (async () => {
    await mongoose.connect(MONGODB_URI);
    const manualProverbs = [
      "가랑비에 옷 젖는 줄 모른다",
      "오늘 할 일을 내일로 미루지 마라",
      "가루는 칠수록 고와지고 말은 할수록 거칠어진다",
      "늦은 비가 콩 심은 데 내린다",
      "벼는 익을수록 고개를 숙인다",
      "바람 잘 날 없는 세상이다",
      "목구멍이 포도청이라 도리가 없다",
      "낫 놓고 기역 자도 모른다",
      "남이 장에 간 날 배 아프다",
      "하루 살 것처럼 꿈을 꾸어라",
      "만 리 길도 한 걸음에서 시작한다",
      "병 주고 약 주는 격이다",
      "구슬이 서 말이라도 꿰어야 보배",
      "남의 말 말고 제 말 들어라",
      "바늘 구멍으로 하늘 보기 격이다",
      "빈 그릇이 더 요란한 소리 낸다",
      "호랑이는 죽어서 가죽을 남긴다",
      "급할수록 돌아가는 것이 지름길이다",
      "백지장도 맞들면 낫다",
      "아는 길도 물어가는 것이 옳다",
      "남의 집 불구경이 재미있다",
      "믿는 도끼에 발등 찍힌다",
      "재주는 곰이 부리고 돈은 주인이",
      "마음이 맑으면 온 세상이 맑다",
      "돈을 잃는 것은 조금 잃는 것",
      "젊어서 고생은 금을 사는 것",
      "쇠는 달구어질 때 두드려라",
      "얕은 강물이 더 소리 크게 흐른다",
      "가까운 이웃이 먼 친척보다 낫다",
      "하늘은 스스로 돕는 자를 돕는다",
      "쓰는 돈이 들어오는 돈을 좇는다",
      "끝날 때까지 끝난 것이 아니다",
      "깊은 강물은 소리 없이 흐른다"
    ];
    const boardSize = 5;
    const settings = {
      initialDisplayTimeMs: 8000,
      targetTimeMs: 60000,
      totalAllowedStones: 9
    };
    let inserted = 0;
    for (const text of manualProverbs) {
      const words = splitSentence(text);
      if (words.length < 5 || words.length > 6) continue;
      if (new Set(words).size !== words.length) continue;
      if (words.some(w => w.length > 5)) continue;
      const wordMappings = generateWordMappings(words, boardSize);
      const doc = new ZengoProverbContent({
        proverbText: text,
        language: 'ko',
        level: '5x5-medium',
        boardSize,
        wordMappings,
        totalWords: words.length,
        totalAllowedStones: settings.totalAllowedStones,
        initialDisplayTimeMs: settings.initialDisplayTimeMs,
        targetTimeMs: settings.targetTimeMs,
        goPatternName: 'Basic Pattern'
      });
      await doc.save();
      inserted++;
    }
    console.log(`5x5 한글 수동 입력 문장 ${inserted}개 업로드 완료`);
    await mongoose.disconnect();
    process.exit(0);
  })();
}

// === 임시: 3x3-easy 한글 수동 입력 문장 업로드 ===
if (require.main === module && process.env.UPLOAD_MANUAL_PROVERBS_3X3 === '1') {
  (async () => {
    await mongoose.connect(MONGODB_URI);
    const manualProverbs = [
      "가재는 게 편",
      "같은 값이면 다홍치마",
      "꿀 먹은 벙어리",
      "꿩 대신 닭",
      "노는 물이 다르다",
      "빈 수레가 요란하다",
      "쇠귀에 경 읽기",
      "식은 죽 먹기",
      "우물 안 개구리",
      "작은 고추가 맵다",
      "티끌 모아 태산",
      "친구 따라 강남 간다",
      "배보다 배꼽이 크다",
      "가는 날이 장날",
      "개천에서 용 난다",
      "구슬 꿰어야 보배",
      "구렁이 담 넘어가듯",
      "돌다리 두들겨 건너라",
      "믿는 도끼 발등 찍힌다",
      "벼는 익을수록 고개 숙인다",
      "손바닥 하늘 가리기",
      "싼 게 비지떡",
      "앓던 이 빠진 듯",
      "울며 겨자 먹기",
      "학문에 왕도 없다",
      "천리길 한 걸음부터",
      "세 살 버릇 여든까지",
      "바람 앞 등불",
      "등잔 밑이 어둡다",
      "소 잃고 외양간 고친다",
      "공든 탑이 무너지랴",
      "누워서 떡 먹기",
      "한 우물만 파라"
    ];
    const boardSize = 3;
    const settings = {
      initialDisplayTimeMs: 4000,
      targetTimeMs: 30000,
      totalAllowedStones: 8
    };
    let inserted = 0;
    for (const text of manualProverbs) {
      const words = splitSentence(text);
      if (words.length < 3 || words.length > 4) continue;
      if (new Set(words).size !== words.length) continue;
      if (words.some(w => w.length > 5)) continue;
      const wordMappings = generateWordMappings(words, boardSize);
      const doc = new ZengoProverbContent({
        proverbText: text,
        language: 'ko',
        level: '3x3-easy',
        boardSize,
        wordMappings,
        totalWords: words.length,
        totalAllowedStones: settings.totalAllowedStones,
        initialDisplayTimeMs: settings.initialDisplayTimeMs,
        targetTimeMs: settings.targetTimeMs,
        goPatternName: 'Basic Pattern'
      });
      await doc.save();
      inserted++;
    }
    console.log(`3x3-easy 한글 수동 입력 문장 ${inserted}개 업로드 완료`);
    await mongoose.disconnect();
    process.exit(0);
  })();
}

// === 임시: 5x5-medium 한글 수동 입력 문장 업로드 ===
if (require.main === module && process.env.UPLOAD_MANUAL_PROVERBS_5X5B === '1') {
  (async () => {
    await mongoose.connect(MONGODB_URI);
    const manualProverbs = [
      "가랑비에 옷 젖는 줄 모른다",
      "세 살 버릇 여든까지 간다",
      "말 한마디로 천 냥 빚을 갚는다",
      "낮말은 새가 듣고 밤말은 쥐가 듣는다",
      "소 잃고 외양간 고친들 무슨 소용인가",
      "천 리 길도 한 걸음부터",
      "배보다 배꼽이 클 때도 있다",
      "사공이 많으면 배가 산으로 간다",
      "하룻강아지 범 무서운 줄 모른다",
      "발 없는 말이 천 리 간다",
      "결국 죽 쒀서 개 준다",
      "두 손뼉이 만나야 소리 난다",
      "절대 첫술에 배부를 수 없다",
      "종종 친구 따라 강남 간다",
      "차라리 피할 수 없으면 즐겨라",
      "하늘은 스스로 돕는 자를 돕는다",
      "가는 말이 고와야 오는 말도 곱다",
      "남의 떡이 더 커 보인다",
      "미운 놈 떡 하나 더 준다",
      "한 번 실패는 성공의 어머니",
      "호미로 막을 것을 가래로 막는다",
      "가끔 닭 잡아먹고 오리발 내민다",
      "쥐구멍에도 볕 들 날 있다",
      "하늘이 무너져도 솟아날 구멍이 있다",
      "호랑이도 제 말 하면 온다",
      "구슬이 서 말이라도 꿰어야 보배",
      "길고 짧은 것은 대 봐야 안다",
      "입에 쓴 약이 병을 고친다",
      "가까운 이웃이 먼 친척보다 낫다",
      "개구리 올챙이 적 생각 못 한다",
      "겨우 바늘 구멍으로 낙타 지나간다",
      "항상 아는 길도 물어 가라",
      "서당 개 삼 년에 풍월 읊는다"
    ];
    const boardSize = 5;
    const settings = {
      initialDisplayTimeMs: 8000,
      targetTimeMs: 60000,
      totalAllowedStones: 9
    };
    let inserted = 0;
    for (const text of manualProverbs) {
      const words = splitSentence(text);
      if (words.length < 5 || words.length > 6) continue;
      if (new Set(words).size !== words.length) continue;
      if (words.some(w => w.length > 5)) continue;
      const wordMappings = generateWordMappings(words, boardSize);
      const doc = new ZengoProverbContent({
        proverbText: text,
        language: 'ko',
        level: '5x5-medium',
        boardSize,
        wordMappings,
        totalWords: words.length,
        totalAllowedStones: settings.totalAllowedStones,
        initialDisplayTimeMs: settings.initialDisplayTimeMs,
        targetTimeMs: settings.targetTimeMs,
        goPatternName: 'Basic Pattern'
      });
      await doc.save();
      inserted++;
    }
    console.log(`5x5-medium 한글 수동 입력 문장 ${inserted}개 업로드 완료`);
    await mongoose.disconnect();
    process.exit(0);
  })();
}

// === 임시: 7x7-hard 한글 수동 입력 문장 업로드 ===
if (require.main === module && process.env.UPLOAD_MANUAL_PROVERBS_7X7 === '1') {
  (async () => {
    await mongoose.connect(MONGODB_URI);
    const manualProverbs = [
      "작은 습관이 큰 변화를 반드시 만들어 준다",
      "고난과 시련을 참으로 견디면 마음의 힘이 자라난다",
      "실패를 두려워 말고 주저 없이 다시 일어서야 한다",
      "오늘의 작은 걸음이 내일의 큰 성과로 이어진다",
      "진정한 마음을 스스로 다잡으면 길이 반드시 열린다",
      "지식은 씨앗이고 실천은 풍성한 열매를 맺게 한다",
      "스스로를 참으로 믿으면 마침내 불가능도 가능으로 바뀐다",
      "매일 끝없이 도전하는 사람만이 진정한 성취를 경험한다",
      "배움에는 끝이 없으니 늘 배우기를 멈추지 마라",
      "진정한 용기는 두려움 속에서도 앞으로 나아가는 것이다",
      "스스로를 단련하면 내일의 나를 만날 수 있다더라",
      "목표를 정하면 절반은 이미 이룬 셈이 된다더라",
      "오늘의 작은 노력들이 내일의 큰 결실을 만든다",
      "어려움이 닥쳐도 진정으로 흔들리지 않는 마음이 필요하다",
      "작은 성취도 스스로에게 큰 격려가 되어 준다",
      "하루하루 참으로 최선을 다하면 결국 빛을 보리라",
      "진리는 시간이 흐를수록 더욱 선명히 드러난다",
      "바람이 불어도 뿌리 깊은 나무는 흔들리지 않는다",
      "시련은 성장의 징검다리가 되어 준다는 말이 있다",
      "스스로를 믿는 자에게 운명은 성공의 길을 열어준다",
      "배움의 여정은 늘 끝없는 도전으로 가득차 있다",
      "오늘의 힘든 견딤이 내일의 빛나는 운명을 만든다",
      "마음의 평화는 진정 스스로를 다스릴 때 찾아온다",
      "진실된 마음은  거짓을 분간할 수 있는 힘을 준다",
      "감사하는 마음이 결국 자신의 삶을 풍성하게 만든다",
      "변화는 언제나 불편함을 통해 성장의 문을 연다",
      "자신의 단점을 인정해야 진정으로 성장할 수 있다",
      "마음에서 욕심을 비우면 새로운 축복이 열리기 마련이다",
      "자신을 이기면 세상의 모든 어려움도 넘어설 수 있다",
      "풍랑속 흔들리는 배도 노를 젓는 손에 달려 있다",
      "바쁜 하루 중에도 잠시 멈춰 호흡을 가다듬어 보라",
      "매 순간 자신의 처음 목표를 떠올리며 의지를 다져라",
      "가슴속 불씨를 꺼뜨리지 않는 것이 성공의 비결이다"
    ];
    const boardSize = 7;
    const settings = {
      initialDisplayTimeMs: 14000,
      targetTimeMs: 90000,
      totalAllowedStones: 12
    };
    let inserted = 0;
    for (const text of manualProverbs) {
      const words = splitSentence(text);
      if (words.length < 7 || words.length > 8) continue;
      if (new Set(words).size !== words.length) continue;
      if (words.some(w => w.length > 5)) continue;
      const wordMappings = generateWordMappings(words, boardSize);
      const doc = new ZengoProverbContent({
        proverbText: text,
        language: 'ko',
        level: '7x7-hard',
        boardSize,
        wordMappings,
        totalWords: words.length,
        totalAllowedStones: settings.totalAllowedStones,
        initialDisplayTimeMs: settings.initialDisplayTimeMs,
        targetTimeMs: settings.targetTimeMs,
        goPatternName: 'Basic Pattern'
      });
      await doc.save();
      inserted++;
    }
    console.log(`7x7-hard 한글 수동 입력 문장 ${inserted}개 업로드 완료`);
    await mongoose.disconnect();
    process.exit(0);
  })();
}

// === 임시: 3x3-easy 영어 수동 입력 문장 업로드 ===
if (require.main === module && process.env.UPLOAD_MANUAL_PROVERBS_EN_3X3 === '1') {
  (async () => {
    await mongoose.connect(MONGODB_URI);
    const manualProverbs = [
      "Shine with hope","Grow your grit","Learn and rise","Trust your path","Aim for more","Hope fuels joy","Work your plan","Push past fear","Rise by grit","Keep on going","Seek new ways","Build your will","Stay real bold","Grow each day","Dare to hope","Hold firm faith","Plan and act","Read and roam","Seek deep truth","Think then act","Grow past loss","Stay on path","Earn your keep","Push your mind","Heal and move","Grow wide view","Step by step","Calm your soul","Take new aim","Look then leap","Dream then do","Walk your talk","Stay on task","Live your truth","Take each step","Grow from pain","Rise and shine","Seek sure roads","Grab each shot","Grow with care"
    ];
    const boardSize = 3;
    let inserted = 0;
    for (const text of manualProverbs) {
      const words = text.split(/\s+/);
      if (words.length < 3 || words.length > 4) continue;
      if (new Set(words).size !== words.length) continue;
      if (words.some(w => w.length > 5)) continue;
      const wordMappings = generateWordMappings(words, boardSize);
      const doc = new ZengoProverbContent({
        proverbText: text,
        language: 'en',
        level: '3x3-easy',
        boardSize,
        wordMappings,
        totalWords: words.length,
        totalAllowedStones: 8,
        initialDisplayTimeMs: 4000,
        targetTimeMs: 30000,
        goPatternName: 'Basic Pattern'
      });
      await doc.save();
      inserted++;
    }
    console.log(`3x3-easy 영어 수동 입력 문장 ${inserted}개 업로드 완료`);
    await mongoose.disconnect();
    process.exit(0);
  })();
}

// === 임시: 5x5-medium 영어 수동 입력 문장 업로드 ===
if (require.main === module && process.env.UPLOAD_MANUAL_PROVERBS_EN_5X5 === '1') {
  (async () => {
    await mongoose.connect(MONGODB_URI);
    const manualProverbs = [
      "Work hard and stay true","Small steps lead to gains","Build daily habit for life","Learn from each small slip","Train your mind with grace","Be bold when fear grows","Every step helps your cause","Trust small wins each day","Never doubt your solid worth","Adapt and learn from fails","Share your light and help other","Solid work helps shape daily wins","Focus on small tasks each time","Brave steps spark fresh self trust","Small acts soon form solid will","Train daily for added sharp mind","Study well grow your deep grit","Short wins stack into grand goals","Calm logic tames doubt and worry","Honor your pace with calm nerve","Guide your mind to sunny ends","Guard hope daily and fear less","Press hard while faith still lives","Watch your flame and guard zeal","Stand tall when waves grow harsh","Early drive will shape long aim","Learn quick tips for daily tasks","Calm heart mend tough daily hits","Brisk move keeps gloom at bay","Forge ahead and claim your peace","Value your time and craft skill","Stay ready under worry or trial","Raise voice and speak your cause","Start again with pride and hope","Open doors with grit and skill","Stand guard over soul and mind","Forge grit daily for sunny aims","Shape your craft with keen focus","Grow each day with pure faith","Watch fear fade with daily deeds"
    ];
    const boardSize = 5;
    let inserted = 0;
    for (const text of manualProverbs) {
      const words = text.split(/\s+/);
      if (words.length < 5 || words.length > 6) continue;
      if (new Set(words).size !== words.length) continue;
      if (words.some(w => w.length > 5)) continue;
      const wordMappings = generateWordMappings(words, boardSize);
      const doc = new ZengoProverbContent({
        proverbText: text,
        language: 'en',
        level: '5x5-medium',
        boardSize,
        wordMappings,
        totalWords: words.length,
        totalAllowedStones: 9,
        initialDisplayTimeMs: 8000,
        targetTimeMs: 60000,
        goPatternName: 'Basic Pattern'
      });
      await doc.save();
      inserted++;
    }
    console.log(`5x5-medium 영어 수동 입력 문장 ${inserted}개 업로드 완료`);
    await mongoose.disconnect();
    process.exit(0);
  })();
}

// === 임시: 7x7-hard 영어 수동 입력 문장 업로드 ===
if (require.main === module && process.env.UPLOAD_MANUAL_PROVERBS_EN_7X7 === '1') {
  (async () => {
    await mongoose.connect(MONGODB_URI);
    const manualProverbs = [
      "Keep on move with hope and stout will","Face each day with true and calm mind","Learn new skill and trust your inner drive","Small steps stack into great feats of hope","Greet each task with a brave smile now","Sound focus helps build firm sense of self","Train daily for true skill and calm heart","March ahead with grace and keep goals alive","Honor your limit yet push past each block","Shape each day using grit and keen focus","Carry hope along your path with deep pride","Might grows when you share kind acts daily","Judge less learn more and seek pure joy","Arise early chase goals and claim your worth","Stand proud amid doubt and push for truth","Clear mind leads you to sunny new views","Waste day push forth and find your bliss","Heart stays stout when storm pound your path","Guard your spark and let big hope bloom","Trust each flaw and bend it into power","Skill grows with calm and alert daily acts","Climb each rung and seek pure inner peace","Treat your body well and mind will bloom","Offer your best daily and watch doors open","Start small then learn deep ways to grow","Ideas spark great deeds that shift your fate","Press every edge and break old inner walls","Stay aware trust slow gains and glean wins","Claim each dawn to craft your bold story","Mold your hour and spark grand leaps ahead","Storm pass soon keep sight on large aims","Light finds a way when souls deny gloom","Calm heads stand rush fears and forge trust","Dream large yet keep steps swift and sure","Early plan sets firm base for great gains","Trial come but grit grows into solid might","Seize each shot shape your true path","Carry faith deep in and carve bliss","Never cease to learn and push your craft","Align goals with your heart and track sound"
    ];
    const boardSize = 7;
    let inserted = 0;
    for (const text of manualProverbs) {
      const words = text.split(/\s+/);
      if (words.length < 7 || words.length > 8) continue;
      if (new Set(words).size !== words.length) continue;
      if (words.some(w => w.length > 5)) continue;
      const wordMappings = generateWordMappings(words, boardSize);
      const doc = new ZengoProverbContent({
        proverbText: text,
        language: 'en',
        level: '7x7-hard',
        boardSize,
        wordMappings,
        totalWords: words.length,
        totalAllowedStones: 12,
        initialDisplayTimeMs: 14000,
        targetTimeMs: 90000,
        goPatternName: 'Basic Pattern'
      });
      await doc.save();
      inserted++;
    }
    console.log(`7x7-hard 영어 수동 입력 문장 ${inserted}개 업로드 완료`);
    await mongoose.disconnect();
    process.exit(0);
  })();
}

// === 임시: 3x3-easy 한글 수동 입력 문장 업로드 ===
if (require.main === module && process.env.UPLOAD_MANUAL_PROVERBS_KO_3X3 === '1') {
  (async () => {
    await mongoose.connect(MONGODB_URI);
    const manualProverbs = [
      "용기 잃지 말자","희망 품고 살자","할 수 있다","내일 또 도전","마음 굳게 잡자","끝까지 밀고 나가","포기 금지 명심","실패 배움 터전","한 걸음 전진","작아도 계속 가자","노력하면 길 열린다","힘내고 다시 도약","실천이 답이다 확신","작은 노력 커진다","더 배워 성장","오늘 바로 시작","한계 넘어 서자","자신 믿고 가자","끝을 보며 달려","속단 금물 유념","조금씩 전진 확실","용서하고 나아가 보자","즐기면 더 좋다","늦어도 늦지 않는다","작게 시작 크게 완성","두려움 버려 내일","의심보단 실행 우선","가볍게 떠나 도전","내 꿈 소중해","끈기로 벽 넘는다","매일 새로 시작","천천히 가도 괜찮아","진정한 힘 마음","바라보고 잡아 당겨","중단 없이 밀자","긍정이 묘약 된다","겸손 배우고 걷자","피해도 다시 맞서","더 나은 내일","버티면 반드시 해낸다"
    ];
    const boardSize = 3;
    let inserted = 0;
    for (const text of manualProverbs) {
      const words = text.split(/\s+/);
      if (words.length < 3 || words.length > 4) continue;
      if (new Set(words).size !== words.length) continue;
      if (words.some(w => w.length > 5)) continue;
      const wordMappings = generateWordMappings(words, boardSize);
      const doc = new ZengoProverbContent({
        proverbText: text,
        language: 'ko',
        level: '3x3-easy',
        boardSize,
        wordMappings,
        totalWords: words.length,
        totalAllowedStones: 8,
        initialDisplayTimeMs: 4000,
        targetTimeMs: 30000,
        goPatternName: 'Basic Pattern'
      });
      await doc.save();
      inserted++;
    }
    console.log(`3x3-easy 한글 수동 입력 문장 ${inserted}개 업로드 완료`);
    await mongoose.disconnect();
    process.exit(0);
  })();
}

// === 임시: 5x5-medium 한글 수동 입력 문장 업로드 ===
if (require.main === module && process.env.UPLOAD_MANUAL_PROVERBS_KO_5X5 === '1') {
  (async () => {
    await mongoose.connect(MONGODB_URI);
    const manualProverbs = [
      "작은 노력이 큰 변화를 만든다","끝까지 포기하지 않는 마음 지켜라","늘 배우고 또 새롭게 성장하자","할 수 있다는 확신이 길을 만든다","희망 품으면 마음 속 힘이 깨어난다","매일 조금씩 달라지는 나를 경험하자","실패해도 다시 일어서면 길이 열린다","끈기 있는 마음가짐 결국 승리를 부른다","순간을 잡고 미래 향해 꿈을 키우자","한 걸음씩 전진하며 오늘보다 나은 내일","두려움 벗어나야 담대한 자신을 발견한다","새로운 지식으로 내 안을 풍성하게 채우자","꾸준함 하나가 큰 변화를 일으킨다","배움에 늦음 없다 작은 한걸음 중요하다","노력으로 인생 바꾸는 기적을 만들어가자","항상 배워 자신에게 발전 기회를 주자","희망은 스스로 키우며 삶을 윤택하게 만든다","실천할 때 진정한 내 힘을 알게된다","의지의 불꽃은 삶을 뜨겁게 이끈다","목표를 세우고 흔들림 없이 추진하자","끝까지 믿으면 현실마저 꿈으로 변화한다","매 순간 최선을 다하며 자신감 높여가자","도전 정신은 시련을 기회로 바꾼다","슬픔 뒤에 숨은 희망 반드시 찾아내자","기회는 준비된 자에게 활짝 열린다","생각 바꾸면 운명도 달라질 수 있다","강인한 마음이면 불가능조차 가능으로 바꾼다","말보다는 행동이 가슴을 더 뜨겁게 만든다","긍정적 태도가 인생 전체를 밝힌다","노력한 만큼 얻게 되는 성취는 소중하다","극복하려는 의지만 있으면 무엇이든 이룬다","습관 만들기부터 성공 향한 길이 열린다","한번 실패해도 여러번 다시 도전하자","성장의 열쇠는 꾸준함 속에 숨어있다","실패는 발판 되어 우리를 단단하게 만든다","한계를 알기에 더욱 위대해질 수 있다","결심은 짧게 행동은 길게 이어가자","배움의 열정이 삶에 커다란 꽃을 피운다","새로움 즐기면 내적 변화 크게 다가온다","믿음 깊어지면 어떠한 고난도 넘어서게 된다"
    ];
    const boardSize = 5;
    let inserted = 0;
    for (const text of manualProverbs) {
      const words = text.split(/\s+/);
      if (words.length < 5 || words.length > 6) continue;
      if (new Set(words).size !== words.length) continue;
      if (words.some(w => w.length > 5)) continue;
      const wordMappings = generateWordMappings(words, boardSize);
      const doc = new ZengoProverbContent({
        proverbText: text,
        language: 'ko',
        level: '5x5-medium',
        boardSize,
        wordMappings,
        totalWords: words.length,
        totalAllowedStones: 9,
        initialDisplayTimeMs: 8000,
        targetTimeMs: 60000,
        goPatternName: 'Basic Pattern'
      });
      await doc.save();
      inserted++;
    }
    console.log(`5x5-medium 한글 수동 입력 문장 ${inserted}개 업로드 완료`);
    await mongoose.disconnect();
    process.exit(0);
  })();
}

// === 임시: 7x7-hard 한글 수동 입력 문장 업로드 ===
if (require.main === module && process.env.UPLOAD_MANUAL_PROVERBS_KO_7X7 === '1') {
  (async () => {
    await mongoose.connect(MONGODB_URI);
    const manualProverbs = [
      "작은 실천이 큰 성공으로 이어진다 지금 바로 시작","포기하지 않는 마음이 길을 연다 모두 해내자","어제보다 나은 내가 오늘부터 가능성을 키운다 함께 나아가자","실패 속에서도 배움을 얻어 더 강해지는 도약을 하자","조금씩 바뀌는 습관이 내일을 새롭게 만든다 꾸준히 진행하자","어렵다고 멈추지 말고 천천히 전진하며 빛을 찾아봐요","희망 가득한 생각이 삶을 바꾸고 내일을 환하게 비춘다","내 안에 잠든 가능성 깨워 용기를 채운다 지금","결심했다면 흔들림 없이 전력으로 꿈을 향해 뛰어보자","오늘 도전이 미래 성공의 초석이 되니 바로 시작하자","인내심 가진 사람에게 절망은 작은 발판이 된다 확신하라","한 번의 실패에도 다시 시도하면 결국 승리를 붙잡는다","기대는 버리고 일단 행동하며 현실을 서서히 바꿔보자","생각을 열고 마음을 다해 목표에 집중해 나아가자","어려울수록 더 단단해지고 새로운 지혜 찾아내며 빛을 본다","강인함은 작은 노력들이 모여 탄생하는 강력한 무기이다","실천으로 채운 하루가 곧 인생을 비옥하게 바꿔준다","결단하고 나아가는 그 순간 모든 두려움 사라지는 마법이다","할 수 있다는 용기를 자신에게 끊임없이 되뇌어 보자","인내는 길어도 결과는 화려하다 그러니 흔들리지 말자","작은 시도들이 모여 커다란 진전을 만든다는 사실 기억하자","매일 배우고 더 넓은 세상을 만나며 견문을 키워가자","그 한걸음이 이정표 되어 먼 미래까지 안내해 줄거다","생각 깊게 하되 과감하게 실행해야 진정한 변화를 맞이한다","희망 품고 걷는 발걸음이 결국 인생을 한층 빛낸다","좌절감 대신 긍정심 채우고 밝은 내일 만들어 보자","늦지 않았다는 믿음을 스스로 되새기며 의연하게 버텨내자","용기는 행동에서 솟아나고 열정은 실천으로 확장되어 간다","꿈이 흐릿해도 나아가는 과정이 결국 방향을 밝혀준다","지치더라도 잠시 쉬고 다시 뚜벅뚜벅 전진하면 된다","실패는 넘어지는 것이 아니라 더욱 높이 오를 기회이다","자신을 믿어주면 세상마저 협력해 무한한 가능 열어준다","어둠 속 불씨 하나가 거대한 희망으로 번져 나간다","끊임없는 도전정신 키워 현실의 벽을 허물고 전진하자","내일은 오늘보다 나을 거라는 확신이 변화를 이끈다","작은 노력 모여 견고한 기반되고 빛나는 성취 남긴다","목표 향해 묵묵히 달리면 희망은 예고없이 찾아온다","반복되는 연습 속에서 진짜 자신 발견하며 빛을 찾는다","시간 투자 아끼지 말고 시야 갖추면 세상 열려요","자신감 생기면 온 세상이 무대로 바뀌는 기적 느낀다"
    ];
    const boardSize = 7;
    let inserted = 0;
    for (const text of manualProverbs) {
      const words = text.split(/\s+/);
      if (words.length < 7 || words.length > 8) continue;
      if (new Set(words).size !== words.length) continue;
      if (words.some(w => w.length > 5)) continue;
      const wordMappings = generateWordMappings(words, boardSize);
      const doc = new ZengoProverbContent({
        proverbText: text,
        language: 'ko',
        level: '7x7-hard',
        boardSize,
        wordMappings,
        totalWords: words.length,
        totalAllowedStones: 12,
        initialDisplayTimeMs: 14000,
        targetTimeMs: 90000,
        goPatternName: 'Basic Pattern'
      });
      await doc.save();
      inserted++;
    }
    console.log(`7x7-hard 한글 수동 입력 문장 ${inserted}개 업로드 완료`);
    await mongoose.disconnect();
    process.exit(0);
  })();
} 