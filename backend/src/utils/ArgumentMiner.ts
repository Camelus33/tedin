import { ArgumentUnit } from '../types/common';

/**
 * ArgumentMiner v0.1
 * 텍스트에서 논증 단위(Claim, Premise)를 추출하는 모듈
 * 규칙 기반 패턴 매칭을 사용한 초기 구현
 */

// 주장(Claim)을 나타내는 패턴들
const CLAIM_PATTERNS = [
  // 단정적 표현
  /^(.+)이다\.?$/,
  /^(.+)해야 한다\.?$/,
  /^(.+)라고 생각한다\.?$/,
  /^(.+)라고 본다\.?$/,
  /^(.+)것이다\.?$/,
  /^(.+)다\.?$/,
  
  // 영어 패턴
  /^(.+) is (.+)\.?$/i,
  /^(.+) should (.+)\.?$/i,
  /^(.+) must (.+)\.?$/i,
  /^I think (.+)\.?$/i,
  /^I believe (.+)\.?$/i,
  /^It is (.+)\.?$/i,
];

// 전제(Premise)를 나타내는 패턴들
const PREMISE_PATTERNS = [
  // 근거 제시 표현
  /^왜냐하면 (.+)$/,
  /^(.+)때문에$/,
  /^(.+)이기 때문이다\.?$/,
  /^(.+)에 따르면$/,
  /^(.+)에 의하면$/,
  /^(.+)에서 보듯이$/,
  /^예를 들어 (.+)$/,
  /^실제로 (.+)$/,
  
  // 영어 패턴
  /^because (.+)\.?$/i,
  /^since (.+)\.?$/i,
  /^as (.+)\.?$/i,
  /^for example (.+)\.?$/i,
  /^in fact (.+)\.?$/i,
  /^according to (.+)\.?$/i,
];

// 논증 표지어(Discourse Markers)
const CLAIM_MARKERS = [
  '따라서', '그러므로', '결국', '결론적으로', '요약하면', '즉',
  'therefore', 'thus', 'consequently', 'in conclusion', 'so', 'hence'
];

const PREMISE_MARKERS = [
  '왜냐하면', '때문에', '근거로', '증거로', '예를 들어', '실제로',
  'because', 'since', 'for', 'given that', 'considering', 'for example'
];

/**
 * 텍스트에서 논증 단위들을 추출합니다.
 * @param text - 분석할 텍스트
 * @param sourceNoteId - 텍스트의 출처가 되는 노트 ID
 * @returns 추출된 논증 단위들의 배열
 */
export const extractArgumentUnits = (text: string, sourceNoteId: string): ArgumentUnit[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const argumentUnits: ArgumentUnit[] = [];
  
  // 문장 단위로 분할 (간단한 구현)
  const sentences = splitIntoSentences(text);
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    if (sentence.length === 0) continue;
    
    const argumentType = classifyArgumentType(sentence, i, sentences);
    
    if (argumentType) {
      const argumentUnit: ArgumentUnit = {
        '@type': 'ArgumentUnit',
        type: argumentType,
        text: sentence,
        sourceNoteId,
        confidence: calculateConfidence(sentence, argumentType)
      };
      
      argumentUnits.push(argumentUnit);
    }
  }
  
  return argumentUnits;
};

/**
 * 텍스트를 문장 단위로 분할합니다.
 * @param text - 분할할 텍스트
 * @returns 문장들의 배열
 */
const splitIntoSentences = (text: string): string[] => {
  // 간단한 문장 분할 (개선 여지 있음)
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
};

/**
 * 문장의 논증 타입을 분류합니다.
 * @param sentence - 분류할 문장
 * @param index - 문장의 위치
 * @param allSentences - 전체 문장 배열 (컨텍스트용)
 * @returns 논증 타입 또는 null
 */
const classifyArgumentType = (
  sentence: string, 
  index: number, 
  allSentences: string[]
): 'Claim' | 'Premise' | null => {
  
  // 1. 패턴 기반 분류
  for (const pattern of PREMISE_PATTERNS) {
    if (pattern.test(sentence)) {
      return 'Premise';
    }
  }
  
  for (const pattern of CLAIM_PATTERNS) {
    if (pattern.test(sentence)) {
      return 'Claim';
    }
  }
  
  // 2. 표지어 기반 분류
  const lowerSentence = sentence.toLowerCase();
  
  for (const marker of PREMISE_MARKERS) {
    if (lowerSentence.includes(marker.toLowerCase())) {
      return 'Premise';
    }
  }
  
  for (const marker of CLAIM_MARKERS) {
    if (lowerSentence.includes(marker.toLowerCase())) {
      return 'Claim';
    }
  }
  
  // 3. 위치 기반 휴리스틱
  // 첫 번째 문장은 주장일 가능성이 높음
  if (index === 0 && allSentences.length > 1) {
    return 'Claim';
  }
  
  // 마지막 문장도 주장일 가능성이 높음
  if (index === allSentences.length - 1 && allSentences.length > 1) {
    return 'Claim';
  }
  
  // 4. 기본값: 길이가 긴 문장은 주장, 짧은 문장은 전제로 분류
  if (sentence.length > 50) {
    return 'Claim';
  } else if (sentence.length > 20) {
    return 'Premise';
  }
  
  return null; // 분류할 수 없는 경우
};

/**
 * 논증 단위의 신뢰도를 계산합니다.
 * @param sentence - 문장
 * @param argumentType - 논증 타입
 * @returns 0-1 사이의 신뢰도 값
 */
const calculateConfidence = (sentence: string, argumentType: 'Claim' | 'Premise'): number => {
  let confidence = 0.5; // 기본 신뢰도
  
  const lowerSentence = sentence.toLowerCase();
  
  // 명확한 표지어가 있으면 신뢰도 증가
  const relevantMarkers = argumentType === 'Claim' ? CLAIM_MARKERS : PREMISE_MARKERS;
  for (const marker of relevantMarkers) {
    if (lowerSentence.includes(marker.toLowerCase())) {
      confidence += 0.3; // 0.2에서 0.3으로 증가
      break;
    }
  }
  
  // 패턴 매칭 보너스
  const relevantPatterns = argumentType === 'Claim' ? CLAIM_PATTERNS : PREMISE_PATTERNS;
  for (const pattern of relevantPatterns) {
    if (pattern.test(sentence)) {
      confidence += 0.2;
      break;
    }
  }
  
  // 문장 길이에 따른 조정
  if (sentence.length > 30 && sentence.length < 200) {
    confidence += 0.1;
  }
  
  // 구두점이 있으면 신뢰도 증가
  if (/[.!?]$/.test(sentence)) {
    confidence += 0.1;
  }
  
  // 최대값 제한
  return Math.min(confidence, 1.0);
};

/**
 * 두 논증 단위 간의 관계를 분석합니다.
 * @param unit1 - 첫 번째 논증 단위
 * @param unit2 - 두 번째 논증 단위
 * @returns 관계 타입 또는 null
 */
export const analyzeArgumentRelation = (
  unit1: ArgumentUnit, 
  unit2: ArgumentUnit
): 'supports' | 'attacks' | 'elaborates' | null => {
  
  // 빈 텍스트 처리
  if (!unit1.text || !unit2.text || unit1.text.trim().length === 0 || unit2.text.trim().length === 0) {
    return null;
  }
  
  // 너무 짧은 텍스트 처리
  if (unit1.text.trim().length < 5 || unit2.text.trim().length < 5) {
    return null;
  }
  
  // 간단한 관계 분석 로직
  // 전제가 주장을 지지하는 경우
  if (unit1.type === 'Premise' && unit2.type === 'Claim') {
    return 'supports';
  }
  
  // 주장이 전제를 정교화하는 경우
  if (unit1.type === 'Claim' && unit2.type === 'Premise') {
    return 'elaborates';
  }
  
  // 같은 타입의 단위들 간의 관계
  if (unit1.type === unit2.type) {
    // 텍스트 유사성 기반 판단 (개선된 구현)
    const similarity = calculateTextSimilarity(unit1.text, unit2.text);
    if (similarity > 0.2) { // 임계값을 0.3에서 0.2로 낮춤
      return 'elaborates';
    }
  }
  
  return null;
};

/**
 * 두 텍스트 간의 유사성을 계산합니다.
 * @param text1 - 첫 번째 텍스트
 * @param text2 - 두 번째 텍스트
 * @returns 0-1 사이의 유사성 값
 */
const calculateTextSimilarity = (text1: string, text2: string): number => {
  // 정규화된 텍스트로 변환
  const normalize = (text: string) => text.toLowerCase().replace(/[^\w\s가-힣]/g, ' ').trim();
  
  const normalizedText1 = normalize(text1);
  const normalizedText2 = normalize(text2);
  
  // 완전히 동일한 경우
  if (normalizedText1 === normalizedText2) {
    return 1.0;
  }
  
  // 단어 기반 유사성 계산 (개선된 버전)
  const words1 = normalizedText1.split(/\s+/).filter(word => word.length > 1);
  const words2 = normalizedText2.split(/\s+/).filter(word => word.length > 1);
  
  if (words1.length === 0 || words2.length === 0) {
    return 0;
  }
  
  // Jaccard 유사성 계산
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  const jaccardSimilarity = union.size > 0 ? intersection.size / union.size : 0;
  
  // 의미적 관련성 보너스 (공통 주제어 감지)
  const semanticBonus = calculateSemanticBonus(words1, words2);
  
  return Math.min(jaccardSimilarity + semanticBonus, 1.0);
};

/**
 * 의미적 관련성 보너스를 계산합니다.
 * @param words1 - 첫 번째 텍스트의 단어들
 * @param words2 - 두 번째 텍스트의 단어들
 * @returns 보너스 점수
 */
const calculateSemanticBonus = (words1: string[], words2: string[]): number => {
  // 주제어 그룹 정의
  const topicGroups = [
    ['인공지능', 'ai', 'artificial', 'intelligence', '기계학습', 'machine', 'learning'],
    ['교육', 'education', '학습', 'learning', '학교', 'school', '학생', 'student'],
    ['의료', 'medical', 'healthcare', '건강', 'health', '병원', 'hospital'],
    ['기술', 'technology', 'tech', '혁신', 'innovation', '발전', 'development'],
    ['환경', 'environment', '기후', 'climate', '지구', 'earth', '온도', 'temperature']
  ];
  
  let bonus = 0;
  
  for (const group of topicGroups) {
    const hasWords1 = words1.some(word => group.some(topic => word.includes(topic) || topic.includes(word)));
    const hasWords2 = words2.some(word => group.some(topic => word.includes(topic) || topic.includes(word)));
    
    if (hasWords1 && hasWords2) {
      bonus += 0.1; // 공통 주제 영역당 0.1 보너스
    }
  }
  
  return Math.min(bonus, 0.3); // 최대 0.3 보너스
}; 