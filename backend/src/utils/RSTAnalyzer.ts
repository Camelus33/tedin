import { RhetoricalRelation, ArgumentUnit } from '../types/common';

/**
 * RSTAnalyzer v0.1
 * 수사적 구조 이론(Rhetorical Structure Theory)을 기반으로 한 관계 분석 모듈
 * 담화 표지어(Discourse Markers) 분석을 중심으로 한 초기 구현
 */

// RST 관계 타입별 담화 표지어 매핑
const RST_DISCOURSE_MARKERS = {
  supports: {
    korean: [
      '왜냐하면', '때문에', '근거로', '증거로', '실제로', '사실', '예를 들어',
      '이를 통해', '이로써', '이에 따라', '그 결과', '따라서', '그러므로'
    ],
    english: [
      'because', 'since', 'for', 'as', 'given that', 'considering',
      'for example', 'for instance', 'in fact', 'actually', 'indeed',
      'therefore', 'thus', 'consequently', 'as a result'
    ]
  },
  attacks: {
    korean: [
      '그러나', '하지만', '반면에', '오히려', '그럼에도', '하지만',
      '그렇지만', '그와 반대로', '이와 달리', '반대로', '하지만'
    ],
    english: [
      'however', 'but', 'although', 'though', 'despite', 'in spite of',
      'nevertheless', 'nonetheless', 'on the contrary', 'conversely',
      'while', 'whereas', 'yet', 'still'
    ]
  },
  elaborates: {
    korean: [
      '즉', '다시 말해', '구체적으로', '세부적으로', '예를 들면',
      '특히', '또한', '더불어', '아울러', '게다가', '더 나아가'
    ],
    english: [
      'that is', 'in other words', 'specifically', 'particularly',
      'for example', 'for instance', 'also', 'moreover', 'furthermore',
      'in addition', 'additionally', 'besides'
    ]
  }
};

// 접속 관계 표지어 (Conjunction markers)
const CONJUNCTION_MARKERS = {
  cause_effect: {
    korean: ['때문에', '결과로', '따라서', '그러므로', '그 결과'],
    english: ['because', 'as a result', 'therefore', 'thus', 'consequently']
  },
  contrast: {
    korean: ['그러나', '반면에', '하지만', '그럼에도', '오히려'],
    english: ['however', 'on the other hand', 'but', 'nevertheless', 'rather']
  },
  addition: {
    korean: ['또한', '게다가', '더불어', '아울러', '더 나아가'],
    english: ['also', 'moreover', 'furthermore', 'in addition', 'besides']
  }
};

/**
 * 두 논증 단위 간의 수사적 관계를 분석합니다.
 * @param sourceUnit - 출발 논증 단위
 * @param targetUnit - 목표 논증 단위
 * @returns 수사적 관계 또는 null
 */
export const analyzeRhetoricalRelation = (
  sourceUnit: ArgumentUnit,
  targetUnit: ArgumentUnit
): RhetoricalRelation | null => {
  
  const relationType = determineRelationType(sourceUnit, targetUnit);
  if (!relationType) {
    return null;
  }
  
  const strength = calculateRelationStrength(sourceUnit, targetUnit, relationType);
  
  return {
    '@type': 'RhetoricalRelation',
    sourceUnit,
    targetUnit,
    relationType,
    strength
  };
};

/**
 * 두 논증 단위 간의 관계 타입을 결정합니다.
 * @param sourceUnit - 출발 논증 단위
 * @param targetUnit - 목표 논증 단위
 * @returns 관계 타입 또는 null
 */
const determineRelationType = (
  sourceUnit: ArgumentUnit,
  targetUnit: ArgumentUnit
): 'supports' | 'attacks' | 'elaborates' | null => {
  
  // 빈 텍스트 또는 매우 짧은 텍스트 처리
  if (!sourceUnit.text || !targetUnit.text || 
      sourceUnit.text.trim().length < 3 || targetUnit.text.trim().length < 3) {
    return null;
  }
  
  // 1. 담화 표지어 기반 분석
  const markerRelation = analyzeDiscourseMarkers(sourceUnit.text, targetUnit.text);
  if (markerRelation) {
    return markerRelation;
  }
  
  // 2. 논증 타입 기반 휴리스틱
  const typeRelation = analyzeByArgumentTypes(sourceUnit, targetUnit);
  if (typeRelation) {
    return typeRelation;
  }
  
  // 3. 텍스트 유사성 기반 분석 (더 엄격한 기준)
  const similarity = calculateSemanticSimilarity(sourceUnit.text, targetUnit.text);
  if (similarity > 0.5) { // 임계값을 0.4에서 0.5로 높임
    return 'elaborates';
  }
  
  return null;
};

/**
 * 담화 표지어를 분석하여 관계를 결정합니다.
 * @param sourceText - 출발 텍스트
 * @param targetText - 목표 텍스트
 * @returns 관계 타입 또는 null
 */
const analyzeDiscourseMarkers = (
  sourceText: string,
  targetText: string
): 'supports' | 'attacks' | 'elaborates' | null => {
  
  const combinedText = `${sourceText} ${targetText}`.toLowerCase();
  
  // 각 관계 타입별로 표지어 검사
  for (const [relationType, markers] of Object.entries(RST_DISCOURSE_MARKERS)) {
    const allMarkers = [...markers.korean, ...markers.english];
    
    for (const marker of allMarkers) {
      if (combinedText.includes(marker.toLowerCase())) {
        return relationType as 'supports' | 'attacks' | 'elaborates';
      }
    }
  }
  
  return null;
};

/**
 * 논증 타입을 기반으로 관계를 분석합니다.
 * @param sourceUnit - 출발 논증 단위
 * @param targetUnit - 목표 논증 단위
 * @returns 관계 타입 또는 null
 */
const analyzeByArgumentTypes = (
  sourceUnit: ArgumentUnit,
  targetUnit: ArgumentUnit
): 'supports' | 'attacks' | 'elaborates' | null => {
  
  // 전제가 주장을 지지하는 기본 관계
  if (sourceUnit.type === 'Premise' && targetUnit.type === 'Claim') {
    return 'supports';
  }
  
  // 주장이 다른 주장을 정교화하는 관계
  if (sourceUnit.type === 'Claim' && targetUnit.type === 'Claim') {
    // 텍스트 내용 분석으로 세분화
    const hasContrastMarkers = hasContrastiveMarkers(sourceUnit.text, targetUnit.text);
    if (hasContrastMarkers) {
      return 'attacks';
    }
    
    const hasSupportMarkers = hasSupportiveMarkers(sourceUnit.text, targetUnit.text);
    if (hasSupportMarkers) {
      return 'supports';
    }
    
    // 의미적 유사성 확인 후에만 elaborates 반환
    const similarity = calculateSemanticSimilarity(sourceUnit.text, targetUnit.text);
    if (similarity > 0.3) {
      return 'elaborates';
    }
    
    return null; // 관련성이 없으면 null 반환
  }
  
  // 전제들 간의 관계
  if (sourceUnit.type === 'Premise' && targetUnit.type === 'Premise') {
    // 의미적 유사성 확인 후에만 elaborates 반환
    const similarity = calculateSemanticSimilarity(sourceUnit.text, targetUnit.text);
    if (similarity > 0.3) {
      return 'elaborates';
    }
    return null;
  }
  
  return null;
};

/**
 * 대조적 표지어가 있는지 확인합니다.
 * @param text1 - 첫 번째 텍스트
 * @param text2 - 두 번째 텍스트
 * @returns 대조적 표지어 존재 여부
 */
const hasContrastiveMarkers = (text1: string, text2: string): boolean => {
  const combinedText = `${text1} ${text2}`.toLowerCase();
  const contrastMarkers = [
    ...CONJUNCTION_MARKERS.contrast.korean,
    ...CONJUNCTION_MARKERS.contrast.english
  ];
  
  return contrastMarkers.some(marker => 
    combinedText.includes(marker.toLowerCase())
  );
};

/**
 * 지지적 표지어가 있는지 확인합니다.
 * @param text1 - 첫 번째 텍스트
 * @param text2 - 두 번째 텍스트
 * @returns 지지적 표지어 존재 여부
 */
const hasSupportiveMarkers = (text1: string, text2: string): boolean => {
  const combinedText = `${text1} ${text2}`.toLowerCase();
  const supportMarkers = [
    ...CONJUNCTION_MARKERS.cause_effect.korean,
    ...CONJUNCTION_MARKERS.cause_effect.english,
    ...CONJUNCTION_MARKERS.addition.korean,
    ...CONJUNCTION_MARKERS.addition.english
  ];
  
  return supportMarkers.some(marker => 
    combinedText.includes(marker.toLowerCase())
  );
};

/**
 * 관계의 강도를 계산합니다.
 * @param sourceUnit - 출발 논증 단위
 * @param targetUnit - 목표 논증 단위
 * @param relationType - 관계 타입
 * @returns 0-1 사이의 강도 값
 */
const calculateRelationStrength = (
  sourceUnit: ArgumentUnit,
  targetUnit: ArgumentUnit,
  relationType: 'supports' | 'attacks' | 'elaborates'
): number => {
  
  let strength = 0.5; // 기본 강도
  
  // 1. 담화 표지어 존재 시 강도 증가
  const hasMarkers = analyzeDiscourseMarkers(sourceUnit.text, targetUnit.text);
  if (hasMarkers === relationType) {
    strength += 0.2;
  }
  
  // 2. 논증 단위의 신뢰도에 따른 조정
  const avgConfidence = ((sourceUnit.confidence || 0.5) + (targetUnit.confidence || 0.5)) / 2;
  strength += (avgConfidence - 0.5) * 0.2;
  
  // 3. 텍스트 길이에 따른 조정 (적절한 길이일 때 강도 증가)
  const totalLength = sourceUnit.text.length + targetUnit.text.length;
  if (totalLength > 50 && totalLength < 500) {
    strength += 0.1;
  }
  
  // 4. 의미적 유사성에 따른 조정
  const similarity = calculateSemanticSimilarity(sourceUnit.text, targetUnit.text);
  if (relationType === 'elaborates') {
    strength += similarity * 0.3; // 정교화는 유사성이 높을수록 강함 (0.2에서 0.3으로 증가)
    
    // 완전히 동일한 텍스트에 대한 특별 보너스
    if (similarity >= 1.0) {
      strength += 0.2;
    }
  } else {
    strength += (1 - similarity) * 0.1; // 지지/공격은 다양성이 있을 때 강함
  }
  
  return Math.min(Math.max(strength, 0.1), 1.0); // 0.1 ~ 1.0 범위로 제한
};

/**
 * 두 텍스트 간의 의미적 유사성을 계산합니다.
 * @param text1 - 첫 번째 텍스트
 * @param text2 - 두 번째 텍스트
 * @returns 0-1 사이의 유사성 값
 */
const calculateSemanticSimilarity = (text1: string, text2: string): number => {
  // 정규화된 텍스트로 변환
  const normalize = (text: string) => text.toLowerCase().replace(/[^\w\s가-힣]/g, ' ').trim();
  
  const normalizedText1 = normalize(text1);
  const normalizedText2 = normalize(text2);
  
  // 완전히 동일한 경우
  if (normalizedText1 === normalizedText2) {
    return 1.0;
  }
  
  // 단어 기반 유사성 (개선된 버전)
  const words1 = tokenizeText(text1);
  const words2 = tokenizeText(text2);
  
  if (words1.length === 0 || words2.length === 0) {
    return 0;
  }
  
  // Jaccard 유사성 계산
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  const jaccardSimilarity = union.size > 0 ? intersection.size / union.size : 0;
  
  // 의미적 관련성 보너스
  const semanticBonus = calculateSemanticRelatednessBonusRST(words1, words2);
  
  return Math.min(jaccardSimilarity + semanticBonus, 1.0);
};

/**
 * RST용 의미적 관련성 보너스를 계산합니다.
 * @param words1 - 첫 번째 텍스트의 단어들
 * @param words2 - 두 번째 텍스트의 단어들
 * @returns 보너스 점수
 */
const calculateSemanticRelatednessBonusRST = (words1: string[], words2: string[]): number => {
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
      bonus += 0.15; // 공통 주제 영역당 0.15 보너스 (더 높은 보너스)
    }
  }
  
  return Math.min(bonus, 0.4); // 최대 0.4 보너스
};

/**
 * 텍스트를 토큰화합니다.
 * @param text - 토큰화할 텍스트
 * @returns 토큰 배열
 */
const tokenizeText = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, ' ') // 특수문자 제거, 한글 유지
    .split(/\s+/)
    .filter(word => word.length > 1) // 1글자 단어 제거
    .filter(word => !isStopWord(word)); // 불용어 제거
};

/**
 * 불용어인지 확인합니다.
 * @param word - 확인할 단어
 * @returns 불용어 여부
 */
const isStopWord = (word: string): boolean => {
  const stopWords = [
    // 한국어 불용어
    '이', '그', '저', '것', '의', '가', '을', '를', '에', '와', '과', '도', '는', '은',
    '이다', '있다', '없다', '하다', '되다', '같다', '다른', '많다', '적다',
    // 영어 불용어
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had'
  ];
  
  return stopWords.includes(word.toLowerCase());
};

/**
 * 텍스트 블록들 간의 전체적인 수사적 구조를 분석합니다.
 * @param argumentUnits - 분석할 논증 단위들
 * @returns 수사적 관계들의 배열
 */
export const analyzeRhetoricalStructure = (
  argumentUnits: ArgumentUnit[]
): RhetoricalRelation[] => {
  
  const relations: RhetoricalRelation[] = [];
  
  // 인접한 논증 단위들 간의 관계 분석
  for (let i = 0; i < argumentUnits.length - 1; i++) {
    const relation = analyzeRhetoricalRelation(argumentUnits[i], argumentUnits[i + 1]);
    if (relation) {
      relations.push(relation);
    }
  }
  
  // 비인접 단위들 간의 잠재적 관계 분석 (거리 제한)
  for (let i = 0; i < argumentUnits.length; i++) {
    for (let j = i + 2; j < Math.min(i + 4, argumentUnits.length); j++) {
      const relation = analyzeRhetoricalRelation(argumentUnits[i], argumentUnits[j]);
      if (relation && relation.strength && relation.strength > 0.6) {
        relations.push(relation);
      }
    }
  }
  
  return relations;
}; 