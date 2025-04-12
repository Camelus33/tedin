/**
 * 교육적 가치가 높은 명문장/명언/속담 데이터 템플릿
 * 
 * 이 파일은 MongoDB zengo 컬렉션에 추가할 데이터 형식을 보여줍니다.
 * 각 언어와 난이도별로 33개씩의 데이터가 필요합니다.
 * 
 * 사용 방법:
 * 1. 이 템플릿을 복사하여 새 파일(예: zengo-proverbs-en.js)을 만듭니다.
 * 2. 템플릿의 데이터를 실제 속담/명언으로 채웁니다.
 * 3. 실행 스크립트로 데이터를 MongoDB에 추가합니다.
 * 
 * 주의사항:
 * - 텍스트 오버플로우: 단어의 길이가 너무 길면 보드에서 표시가 잘릴 수 있습니다.
 * - 중복 단어: 같은 철자의 단어가 여러 번 나오는 문장은 피해야 합니다.
 *   (같은 단어는 같은 바둑돌로 표시되어 게임 플레이에 혼란을 줄 수 있음)
 */

// 데이터 형식 예시 (각 언어 및 난이도별로 33개씩 필요)
const zengoProverbsTemplate = [
  // === 3x3 EASY 예시 (총 33개 필요) ===
  {
    level: '3x3-easy',
    language: 'en', // 언어 코드: ko, en, zh, ja
    boardSize: 3,
    proverbText: '교육적 명언/속담 전체 텍스트', // 예: "The journey of a thousand miles begins with a single step"
    goPatternName: '패턴명',
    wordMappings: [
      { word: '첫번째단어', coords: { x: 0, y: 0 } },
      { word: '두번째단어', coords: { x: 1, y: 0 } },
      { word: '세번째단어', coords: { x: 2, y: 0 } },
      // 필요한 만큼 단어 매핑 추가 (보드 사이즈에 맞게)
    ],
    totalWords: 0, // wordMappings.length와 동일하게 설정됨
    totalAllowedStones: 0, // totalWords + 여유 돌 수 (자동 계산됨)
    initialDisplayTimeMs: 3000, // 초기 표시 시간 (ms)
    targetTimeMs: 10000, // 목표 완료 시간 (ms)
  },
  // 추가 데이터...
  
  // === 5x5 MEDIUM 예시 (총 33개 필요) ===
  {
    level: '5x5-medium',
    language: 'en',
    boardSize: 5,
    proverbText: '교육적 명언/속담 전체 텍스트',
    goPatternName: '패턴명',
    wordMappings: [
      { word: '첫번째단어', coords: { x: 0, y: 0 } },
      { word: '두번째단어', coords: { x: 1, y: 1 } },
      // 5x5 보드에 맞게 단어 매핑 추가
    ],
    totalWords: 0,
    totalAllowedStones: 0,
    initialDisplayTimeMs: 5000,
    targetTimeMs: 15000,
  },
  // 추가 데이터...
  
  // === 7x7 HARD 예시 (총 33개 필요) ===
  {
    level: '7x7-hard',
    language: 'en',
    boardSize: 7,
    proverbText: '교육적 명언/속담 전체 텍스트',
    goPatternName: '패턴명',
    wordMappings: [
      { word: '첫번째단어', coords: { x: 0, y: 0 } },
      { word: '두번째단어', coords: { x: 1, y: 1 } },
      // 7x7 보드에 맞게 단어 매핑 추가
    ],
    totalWords: 0,
    totalAllowedStones: 0,
    initialDisplayTimeMs: 7000,
    targetTimeMs: 20000,
  },
  // 추가 데이터...
];

module.exports = zengoProverbsTemplate;

/**
 * 추가할 명문장/명언/속담 수집 시 고려사항:
 * 
 * 1. 교육적 가치
 *   - 학생들에게 도움이 되는 교훈이 담긴 내용
 *   - 긍정적인 메시지가 담긴 내용
 *   - 문화적, 역사적 가치가 있는 내용
 * 
 * 2. 난이도별 특성
 *   - 3x3-easy: 짧고 간단한 속담/명언 (3-8 단어)
 *   - 5x5-medium: 중간 길이의 속담/명언 (5-12 단어)
 *   - 7x7-hard: 긴 속담/명언 (7-15 단어)
 * 
 * 3. 언어별 특성
 *   - 각 언어의 문화적 특성을 반영한 속담/명언 선택
 *   - 번역보다는 해당 언어권에서 널리 알려진 속담/명언 우선
 * 
 * 4. 보드 패턴
 *   - 단어 배치가 의미 있는 패턴을 이루도록 배치
 *   - 예: 직선, 대각선, 십자가, 사각형 등
 * 
 * 5. 단어 분리
 *   - 속담/명언을 적절히 단어 단위로 분리
 *   - 너무 작은 단위(관사, 접속사 등)는 묶음 처리 고려
 * 
 * 6. 오버플로우 및 중복 방지
 *   - 각 단어의 길이가 8자 이하가 되도록 조절 (특히 작은 보드에서)
 *   - 같은 철자의 단어가 반복되는 문장은 피하거나 다른 형태로 변형
 *   - 반복되는 단어가 있는 경우, 약간 다르게 표기하거나 묶어서 처리
 */ 