/**
 * @file creativePersonaUtils.ts
 * @description 사용자의 창의적 페르소나를 추론하기 위한 유틸리티 함수들을 포함합니다.
 * 이 파일은 mentalImage 텍스트 분석, 시각적 어휘 사전 구축 등 추론 엔진의 핵심 로직을 담당합니다.
 */

/**
 * mentalImage 텍스트를 분석하여 시각적 단서(키워드)를 추출합니다.
 * 정규식과 사전 기반 분석을 통해 색상, 분위기, 핵심 사물 등을 식별합니다.
 * 
 * @param text 사용자의 mentalImage 텍스트
 * @returns 추출된 시각적 키워드의 배열
 */
export const analyzeMentalImage = (text: string): string[] => {
  if (!text) {
    return [];
  }

  // TODO: 정교한 정규식 및 키워드 사전 구현
  const keywords = new Set<string>();

  // 1. 색상 추출 (예시)
  const colorRegex = /붉은|푸른|노란|녹색|검은|하얀|보라색/g;
  const colorMatches = text.match(colorRegex);
  if (colorMatches) {
    colorMatches.forEach(color => keywords.add(color));
  }

  // 2. 분위기 추출 (예시)
  const moodKeywords = ['고요한', '역동적인', '신비로운', '어두운', '밝은', '따뜻한', '차가운'];
  moodKeywords.forEach(mood => {
    if (text.includes(mood)) {
      keywords.add(mood);
    }
  });

  // 결과 반환 (중복 제거)
  return Array.from(keywords);
};

import { INote } from '../models/Note';

/**
 * 사용자의 노트 목록을 기반으로 '시각적 어휘 사전(visualLexicon)'을 구축합니다.
 * 각 노트의 핵심 개념(태그)과 mentalImage에서 추출된 시각적 키워드를 매핑합니다.
 * 
 * @param notes 사용자의 전체 노트(INote) 배열
 * @returns {Map<string, Set<string>>} Key: 핵심 개념(태그), Value: 연관된 시각적 키워드 Set
 */
export const buildVisualLexicon = (notes: INote[]): Map<string, Set<string>> => {
  const lexicon = new Map<string, Set<string>>();

  notes.forEach(note => {
    // 노트의 핵심 개념으로 태그를 사용합니다. 태그가 없으면 함수를 종료합니다.
    if (!note.tags || note.tags.length === 0) {
      return;
    }

    // mentalImage에서 시각적 키워드를 추출합니다.
    const visualKeywords = analyzeMentalImage(note.mentalImage || '');
    if (visualKeywords.length === 0) {
      return;
    }

    // 각 태그에 대해 시각적 키워드를 매핑합니다.
    note.tags.forEach(tag => {
      if (!lexicon.has(tag)) {
        lexicon.set(tag, new Set());
      }
      const keywordSet = lexicon.get(tag)!;
      visualKeywords.forEach(keyword => keywordSet.add(keyword));
    });
  });

  return lexicon;
};

// --- 추론을 위한 상수 정의 ---
const PREDEFINED_COLORS = ['붉은', '푸른', '노란', '녹색', '검은', '하얀', '보라색', '주황색', '분홍색', '금색', '은색'];
const PREDEFINED_MOODS = ['고요한', '역동적인', '신비로운', '어두운', '밝은', '따뜻한', '차가운', '우울한', '활기찬', '몽환적인'];

/**
 * Aesthetic Style 추론 결과 인터페이스
 */
export interface IAestheticStyle {
  dominantColors: string[];
  dominantMoods: string[];
  inspirationSources: string[];
}

/**
 * 사용자의 노트 목록을 통계적으로 분석하여 대표 스타일(Aesthetic Style)을 추론합니다.
 * @param notes 사용자의 전체 노트(INote) 배열
 * @returns {IAestheticStyle} 추론된 대표 스타일 객체
 */
export const inferAestheticStyle = (notes: INote[]): IAestheticStyle => {
  const allVisualKeywords = notes
    .map(note => analyzeMentalImage(note.mentalImage || ''))
    .flat();
  
  const allLinks = notes
    .map(note => note.relatedLinks?.map(link => link.url) || [])
    .flat();

  // 가장 빈번하게 등장하는 아이템을 찾는 헬퍼 함수
  const getTopItems = (items: string[], count: number): string[] => {
    const frequency: Record<string, number> = {};
    items.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(entry => entry[0]);
  };
  
  const dominantColors = getTopItems(
    allVisualKeywords.filter(kw => PREDEFINED_COLORS.includes(kw)), 
    3
  );

  const dominantMoods = getTopItems(
    allVisualKeywords.filter(kw => PREDEFINED_MOODS.includes(kw)),
    3
  );

  // TODO: 단순 URL이 아닌, 도메인 분석 등 더 정교한 로직으로 고도화 필요
  const inspirationSources = getTopItems(
    allLinks.map(link => new URL(link).hostname),
    3
  );

  return {
    dominantColors,
    dominantMoods,
    inspirationSources,
  };
};

/**
 * Creative Persona 추론 엔진의 최종 결과물 인터페이스
 */
export interface IInferredPersona {
  aestheticStyle: IAestheticStyle;
  visualLexicon: Record<string, string[]>;
}

/**
 * @class CreativePersonaEngine
 * @description 개별 추론 함수들을 통합하여 최종 Creative Persona를 도출하는 엔진
 */
export const CreativePersonaEngine = {
  /**
   * 사용자의 노트 목록을 입력받아, 완전한 형태의 Creative Persona 객체를 추론하여 반환합니다.
   * @param notes 사용자의 전체 노트(INote) 배열
   * @returns {IInferredPersona} 추론된 Creative Persona 데이터
   */
  infer: (notes: INote[]): IInferredPersona => {
    const aestheticStyle = inferAestheticStyle(notes);
    const visualLexiconMap = buildVisualLexicon(notes);

    // Map을 JSON으로 저장하기 위해 Record<string, string[]> 형태로 변환
    const visualLexicon: Record<string, string[]> = {};
    visualLexiconMap.forEach((value, key) => {
      visualLexicon[key] = Array.from(value);
    });

    return {
      aestheticStyle,
      visualLexicon,
    };
  },
}; 