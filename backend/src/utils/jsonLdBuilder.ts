import {
  ActionModule,
  CognitiveProvenance,
  KnowledgePersonality,
} from '../types/common';

// frontend/components/ts/TSNoteCard.tsx 에서 가져온 타입 정의를
// 백엔드에서 사용할 수 있도록 아래에 직접 정의하거나, 공유 타입 파일에서 가져와야 합니다.
// 여기서는 직접 정의하여 의존성 문제를 해결합니다.

export interface RelatedLink {
  type: 'book' | 'paper' | 'youtube' | 'media' | 'website';
  url: string;
  reason?: string;
  _id?: string;
}

export interface TSNote {
  _id: string;
  bookId: string;
  userId?: string;
  content: string;
  tags: string[];
  importanceReason?: string;
  momentContext?: string;
  relatedKnowledge?: string;
  mentalImage?: string;
  nickname?: string;
  relatedLinks?: RelatedLink[];
  isArchived?: boolean;
  isTemporary?: boolean;
  originSession?: string;
}

export interface TSSessionDetails {
  createdAtISO?: string;
  durationSeconds?: number;
  startPage?: number;
  actualEndPage?: number;
  targetPage?: number;
  ppm?: number;
  book?: any;
}

// --- Type Definitions for Builder ---
// These interfaces are now partially imported from PublicShareService
// We keep local definitions for clarity and potential backend-specific extensions.

interface BookInfo {
  _id: string;
  title: string;
  author?: string;
  isbn?: string;
}

interface UserInfo {
  _id: string;
  name?: string;
  email: string;
}

// Combine TSNote with populated details for the builder's input
interface PopulatedTSNote extends TSNote {
  sessionDetails?: TSSessionDetails;
  book?: BookInfo;
  // readingPurpose is a prop, we pass it to the service later
}

interface SummaryNoteData {
  _id: string;
  title: string;
  description: string;
  userMarkdownContent?: string; // 사용자가 작성한 마크다운 인사이트
  createdAt: Date;
  user: UserInfo; // Assume user info is populated
  notes: PopulatedTSNote[];
  readingPurpose?: string; // Pass reading purpose for context
  totalReadingTimeISO?: string; // 총 독서 시간 (ISO 8601 형식)
  allTags?: string[]; // 모든 노트의 태그 집합
}

// Mapping of reading purposes to question sets for memo evolution
const memoEvolutionQuestionMap: Record<string, string[]> = {
  exam_prep: ['핵심 개념/공식', '어려웠던 부분', '연관 지식', '시각적 암기법'],
  practical_knowledge: ['적용 방안', '필요했던 경험', '연관 경험/지식', '핵심 원리 설명'],
  humanities_self_reflection: ['느낀 감정/생각', '당시 상황', '연상되는 지식', '떠오른 장면'],
  reading_pleasure: ['흥미로웠던 점', '느꼈던 기분', '연상되는 작품/경험', '생생한 장면'],
};

const getMemoEvolutionQuestion = (fieldKey: string, purpose: string = 'humanities_self_reflection'): string => {
  const questions = memoEvolutionQuestionMap[purpose] || memoEvolutionQuestionMap.humanities_self_reflection;
  const keyMap: { [key: string]: number } = {
    importanceReason: 0,
    momentContext: 1,
    relatedKnowledge: 2,
    mentalImage: 3,
  };
  return questions[keyMap[fieldKey]] || fieldKey;
};


// =================================================================
// PHASE 1: 상수 및 헬퍼 함수 정의
// =================================================================

// --- 1. 목표 기반 액션 모듈 상수 ---
const ACTION_MODULES = {
  exam_prep: [
    {
      '@type': 'HowToAction',
      name: '시험 대비 모의고사 즉시 생성',
      description: "중요 개념 기반으로 객관식, 단답형, 서술형 문항을 포함한 모의고사를 생성합니다.",
      llmPrompt: "제공된 노트 중 '중요성'이 강조된 내용을 중심으로, 객관식 5문제, 단답형 3문제, 그리고 여러 노트의 개념을 통합해야 하는 서술형 2문제로 구성된 총 10문항의 모의고사를 즉시 생성하고, 상세한 해설을 포함한 정답지를 제공하시오."
    },
    {
      '@type': 'HowToAction',
      name: '학습 취약점 분석 및 보완 전략 제시',
      description: "메모 진화 단계를 분석하여 학습 취약점을 식별하고 구체적인 보완 전략을 제안합니다.",
      llmPrompt: "모든 노트의 '메모 진화' 단계를 분석하여, '중요성은 알지만(importanceReason) 구체적인 심상(mentalImage)이나 연결 지식(relatedKnowledge)이 부족한' 개념들을 '학습 취약점'으로 식별하시오. 각 취약점별로 구체적인 보완 학습 전략(예: 관련 유튜브 영상 추천, 추가 읽기 자료 제안)을 보고서 형태로 제시하시오."
    }
  ],
  practical_knowledge: [
    {
      '@type': 'HowToAction',
      name: '원페이지 실행 보고서 초안 작성',
      description: "팀장에게 보고할 수 있는 형식의 원페이지 실행 보고서 초안을 작성합니다.",
      llmPrompt: "모든 노트를 종합하여, 팀장에게 보고할 수 있는 '원페이지 실행 보고서' 초안을 작성하시오. 보고서에는 [핵심 인사이트], [근거 데이터(노트 내용 인용)], [당장 실행할 액션 아이템 3가지] 항목이 반드시 포함되어야 합니다."
    },
    {
      '@type': 'HowToAction',
      name: '내부 발표 자료 자동 생성',
      description: "노트 내용을 기반으로 5장짜리 내부 발표 자료의 개요를 생성합니다.",
      llmPrompt: "이 노트들을 기반으로, 5장짜리 내부 발표 자료의 개요를 마크다운 형식으로 생성하시오. 각 슬라이드는 [제목], [핵심 메시지(3줄 요약)], [관련 노트 내용]으로 구성되어야 합니다."
    }
  ]
} as const;

// --- 2. 지식 페르소나 상수 ---
const KNOWLEDGE_PERSONAS = {
  Visualizer: {
    profileDescription: "이 학습자는 개념을 공고히 하기 위해 '시각적 이미지'를 활용하는 경향이 강합니다.",
    interactionStrategyForLLM: {
      communicationStyle: "아이디어들을 시각적으로 구조화할 수 있도록 마인드맵이나 순서도 생성을 먼저 제안하시오.",
      questioningStyle: "'이것을 그림으로 표현한다면 어떤 모습일까요?' 와 같이 시각화를 유도하는 질문을 던져 학습자의 사고를 자극하시오."
    }
  },
  Connector: {
    profileDescription: "이 학습자는 새로운 정보를 기존 지식과 '연결'하여 이해하는 것을 선호합니다.",
    interactionStrategyForLLM: {
      communicationStyle: "유추와 비유를 적극적으로 사용하여 설명하시오.",
      questioningStyle: "'이것은 무엇을 떠오르게 하나요?' 와 같이 연결을 유도하는 질문을 던져 학습자의 사고를 자극하시오."
    }
  },
  Theorist: {
    profileDescription: "이 학습자는 개별 사실보다 그背后의 '핵심 원리나 이론'을 파악하는 것을 중요하게 생각합니다.",
    interactionStrategyForLLM: {
      communicationStyle: "논리적이고 체계적인 구조로 설명하고, 관련 이론이나 모델을 함께 제시하시오.",
      questioningStyle: "'이 현상의 근본적인 원칙은 무엇일까요?' 와 같이 본질을 탐구하는 질문을 던지시오."
    }
  },
  Pragmatist: {
    profileDescription: "이 학습자는 지식이 '실제 어떤 상황'에서 어떻게 사용되는지에 대한 실용적 맥락을 중시합니다.",
    interactionStrategyForLLM: {
      communicationStyle: "구체적인 사례나 실제 적용 예시를 중심으로 설명하시오.",
      questioningStyle: "'이 지식을 실제로 어떻게 사용할 수 있을까요?' 와 같이 적용을 유도하는 질문을 던지시오."
    }
  }
};


// =================================================================
// PHASE 2: 핵심 기능 헬퍼 함수 구현
// =================================================================

/**
 * @function buildActionModules
 * @description 독서 목적에 맞는 액션 모듈 배열을 반환합니다.
 */
const buildActionModules = (readingPurpose: string = 'general_knowledge') => {
  return ACTION_MODULES[readingPurpose as keyof typeof ACTION_MODULES] || [];
};

/**
 * @function analyzeKnowledgePersonality
 * @description 노트 리스트를 분석하여 지식 페르소나를 결정합니다.
 */
const analyzeKnowledgePersonality = (notes: PopulatedTSNote[]): KnowledgePersonality | null => {
  if (!notes || notes.length === 0) {
    return {
      '@type': 'KnowledgePersonality',
      primaryType: 'Balanced',
      profileDescription: "이 학습자는 다양한 메모 방식을 균형있게 활용합니다.",
      interactionStrategyForLLM: {
        communicationStyle: "상황에 맞는 다양한 설명 방식을 사용하고, 학습자의 다음 행동을 예측하여 여러 옵션을 제안하시오.",
        questioningStyle: "개방형 질문과 구체적인 질문을 조합하여 학습자의 사고를 다각도로 자극하시오."
      }
    };
  }

  const counts = { Visualizer: 0, Connector: 0, Theorist: 0, Pragmatist: 0 };
  notes.forEach(note => {
    if (note.mentalImage) counts.Visualizer++;
    if (note.relatedKnowledge) counts.Connector++;
    if (note.importanceReason) counts.Theorist++;
    if (note.momentContext) counts.Pragmatist++;
  });

  const totalCounts = Object.values(counts).reduce((sum, count) => sum + count, 0);

  if (totalCounts === 0) {
    return {
      '@type': 'KnowledgePersonality',
      primaryType: 'Balanced',
      profileDescription: "이 학습자는 다양한 메모 방식을 균형있게 활용하거나, 아직 메모 진화 기능을 사용하지 않았습니다.",
      interactionStrategyForLLM: {
        communicationStyle: "상황에 맞는 다양한 설명 방식을 사용하고, 학습자의 다음 행동을 예측하여 여러 옵션을 제안하시오.",
        questioningStyle: "개방형 질문과 구체적인 질문을 조합하여 학습자의 사고를 다각도로 자극하시오."
      }
    };
  }

  const primaryType = Object.keys(counts).reduce((a, b) => counts[a as keyof typeof counts] > counts[b as keyof typeof counts] ? a : b) as keyof typeof KNOWLEDGE_PERSONAS;

  const personaData = KNOWLEDGE_PERSONAS[primaryType];

  return {
    '@type': 'KnowledgePersonality',
    primaryType: primaryType,
    ...personaData
  };
};

/**
 * @function analyzeCognitiveProvenance
 * @description 개별 노트의 인지적 출처를 분석합니다.
 */
const analyzeCognitiveProvenance = (note: PopulatedTSNote): CognitiveProvenance => {
  // --- 방어 코드 강화: sessionDetails가 없는 경우 즉시 기본값 반환 ---
  if (!note.sessionDetails) {
    return {
      '@type': 'CognitiveContext',
      readingPace: 'unknown',
      timeOfDayContext: 'unknown',
      memoMaturity: 'initial_idea',
      description: 'This note was recorded without a session, so detailed context is unavailable.'
    };
  }

  let readingPace: CognitiveProvenance['readingPace'] = 'unknown';
  const ppm = note.sessionDetails?.ppm;
  const duration = note.sessionDetails?.durationSeconds;

  // --- 방어 코드 강화: ppm과 duration이 유효한 숫자인지 확인 ---
  if (typeof ppm === 'number' && typeof duration === 'number') {
    if (ppm < 2 && duration > 180) {
      readingPace = 'deep_focus';
    } else if (ppm > 4 && duration < 180) {
      readingPace = 'skimming_review';
    } else {
      readingPace = 'steady_reading';
    }
  }
  
  let timeOfDayContext: CognitiveProvenance['timeOfDayContext'] = 'unknown';
  // --- 방어 코드 강화: createdAtISO가 유효한 날짜 문자열인지 확인 ---
  if(note.sessionDetails?.createdAtISO && !isNaN(new Date(note.sessionDetails.createdAtISO).getTime())) {
    const hour = new Date(note.sessionDetails.createdAtISO).getUTCHours();
    if (hour >= 0 && hour < 5) timeOfDayContext = 'late_night_insight';
    else if (hour >= 6 && hour < 10) timeOfDayContext = 'morning_routine';
    else if (hour >= 10 && hour < 18) timeOfDayContext = 'day_activity';
    else timeOfDayContext = 'evening_learning';
  }

  const memoMaturity: CognitiveProvenance['memoMaturity'] = 
    note.mentalImage ? 'fully_evolved' :
    note.relatedKnowledge ? 'partially_evolved' :
    'initial_idea';

  const description = `This note was likely recorded during a session with a '${readingPace}' pace, identified as a '${timeOfDayContext}'. The memo itself is considered '${memoMaturity}'.`;

  return {
    '@type': 'CognitiveContext',
    readingPace,
    sessionPPM: ppm,
    timeOfDayContext,
    memoMaturity,
    description,
  };
};


// =================================================================
// PHASE 3: buildJsonLd 메인 함수 통합
// =================================================================

/**
 * @function buildJsonLd
 * @description Takes aggregated summary note data and builds a JSON-LD object for SEO and AI crawlers.
 * @param {SummaryNoteData} summaryNoteData - The complete data of the summary note.
 * @returns {object} A JSON-LD object following schema.org standards.
 */
export const buildJsonLd = (summaryNoteData: SummaryNoteData): object => {
  const {
    _id,
    title,
    description,
    createdAt,
    user,
    notes,
    readingPurpose = 'general_knowledge',
    userMarkdownContent,
    totalReadingTimeISO,
    allTags = [],
  } = summaryNoteData;

  // --- 총 독서 시간 계산 ---
  const totalReadingDurationSeconds = notes?.reduce((total, note) => {
    return total + (note.sessionDetails?.durationSeconds || 0);
  }, 0) || 0;

  // 초를 ISO 8601 기간 형식으로 변환 (e.g., PT1H30M5S)
  const formatDurationISO8601 = (seconds: number) => {
    if (seconds === 0) return "PT0S";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `PT${h > 0 ? h + 'H' : ''}${m > 0 ? m + 'M' : ''}${s > 0 ? s + 'S' : ''}`;
  };
  const timeRequired = formatDurationISO8601(totalReadingDurationSeconds);


  // --- 신규 기능 호출 ---
  const actionableModules = buildActionModules(readingPurpose);
  const knowledgePersonality = analyzeKnowledgePersonality(notes);


  // 하비투스33 학습 방법론 및 시스템 맥락 정보
  const methodologyContext = {
    "@type": "EducationalFramework",
    "name": "하비투스33 Atomic Reading 학습 시스템",
    "description": "3분 11페이지 단위의 초집중 독서를 통한 개인화된 지식관리 방법론",
    "methodology": {
      "atomicReading": {
        "definition": "3분간 11페이지를 읽는 최소 독서 단위로, 인지부하를 최소화하면서 지속가능한 학습 리듬을 형성하는 방법론",
        "timeUnit": "3분 (180초)",
        "pageUnit": "11페이지",
        "cognitiveLoad": "최소화된 인지부하로 지속가능한 학습 패턴 형성",
        "purpose": "완독 부담 제거, 첫 페이지를 넘기는 용기 제공, 성취감을 통한 학습 동기 유지"
      },
      "thoughtSprints": {
        "definition": "TS(Thought Sprints) 모드를 통한 집중독서 세션",
        "dataCollection": "독서 시간, 페이지 수, 분당 페이지 속도(PPM), 집중도 측정",
        "personalization": "개인별 읽기 속도, 정보처리 능력, 문해력 수준 분석 데이터 수집"
      },
      "memoEvolution": {
        "definition": "1줄메모를 4단계 질문을 통해 체계적으로 발전시키는 지식 내재화 과정",
        "stages": [
          "1단계: 중요성 인식 (왜 이것이 중요한가?)",
          "2단계: 맥락 기록 (언제, 어떤 상황에서?)", 
          "3단계: 지식 연결 (기존 지식과의 연관성)",
          "4단계: 심상 형성 (구체적 이미지, 기억 고정)"
        ],
        "purposeAdaptation": "읽기 목적(시험준비, 실무지식, 인문학적 성찰, 독서즐거움)에 따른 맞춤형 질문 체계"
      },
      "knowledgeManagement": {
        "atomicNotes": "최소 의미 단위의 1줄메모로 복잡한 지식을 원자 단위로 분해",
        "contextualLinking": "관련링크를 통한 지식 네트워크 형성, 연결 이유 명시로 맥락 보존",
        "spacedRepetition": "플래시카드를 통한 간격반복학습으로 장기기억 전환",
        "synthesisMode": "단권화 노트를 통한 지식 재구성 및 개인적 인사이트 도출"
      }
    },
    "dataMetrics": {
      "ppmSignificance": "분당 페이지 수(PPM)는 읽기속도, 정보처리능력, 문해력을 종합한 개인화 지표",
      "sessionAnalysis": "3분 단위 세션데이터는 학습자의 인지적 특성과 최적 학습 리듬 발견에 활용",
      "progressTracking": "지속적 데이터 수집을 통한 개인별 학습 효율성 최적화"
    }
  };

  const hasPart = notes?.map((note, index) => {
    const {
      content,
      sessionDetails,
      book,
      importanceReason,
      momentContext,
      relatedKnowledge,
      mentalImage,
      relatedLinks,
      tags,
    } = note;

    // --- 개별 노트의 인지 출처 분석 ---
    const cognitiveProvenance = analyzeCognitiveProvenance(note);

    const notePart: any = {
      "@type": "NoteDigitalDocument",
      "text": content,
      "identifier": `atomic-note-${index + 1}`,
      "description": `하비투스33 Atomic Reading 방법론으로 추출된 ${index + 1}번째 1줄메모`,
      "educationalUse": "지식의 원자 단위로 분해된 핵심 인사이트",
      "cognitiveProvenance": cognitiveProvenance, // 인지 출처 데이터 추가
    };

    // --- 태그 정보 추가 ---
    if (tags && tags.length > 0) {
      notePart.keywords = tags.join(', ');
    }

    // 세션 정보: Atomic Reading의 핵심 데이터
    if (sessionDetails?.createdAtISO) {
      notePart.dateCreated = new Date(sessionDetails.createdAtISO).toISOString();
      
      // 세션 성과 데이터를 구조화된 형태로 포함
      notePart.learningActivity = {
        "@type": "LearningActivity",
        "name": "Thought Sprints (TS) 집중독서 세션",
        "duration": `PT${sessionDetails.durationSeconds}S`, // ISO 8601 duration format
        "pageRange": {
          "startPage": sessionDetails.startPage || 0,
          "endPage": sessionDetails.actualEndPage || 0,
          "targetPages": sessionDetails.targetPage || 0,
          "actualProgress": sessionDetails.actualEndPage && sessionDetails.startPage ? 
            sessionDetails.actualEndPage - sessionDetails.startPage + 1 : 0
        },
        "performanceMetrics": {
          "pagesPerMinute": sessionDetails.ppm || 0,
          "readingSpeed": sessionDetails.ppm ? `${sessionDetails.ppm} PPM` : "측정 불가",
          "cognitiveLoad": sessionDetails.durationSeconds <= 180 ? "최적 (3분 이내)" : "높음",
          "efficiency": sessionDetails.ppm && sessionDetails.ppm > 3 ? "높은 정보처리능력" : 
                       sessionDetails.ppm && sessionDetails.ppm > 2 ? "보통 정보처리능력" : "신중한 독서 패턴"
        },
        "educationalContext": "3분 11페이지 Atomic Reading 원칙에 따른 지속가능한 학습 세션"
      };
    }

    if (book) {
      notePart.about = {
        "@type": "Book",
        "name": book.title ?? "제목 정보 없음",
      };
      if (book.author && book.author !== '알 수 없음') {
        notePart.about.author = {
          "@type": "Person",
          "name": book.author,
        };
      }
    }

    // 메모 진화: 4단계 지식 내재화 프로세스
    const mainEntity = [];
    const evolutionStages = [
      { field: 'importanceReason', stage: 1, purpose: '중요성 인식', cognitiveProcess: '선택적 주의와 우선순위 설정' },
      { field: 'momentContext', stage: 2, purpose: '맥락 기록', cognitiveProcess: '상황적 기억과 에피소드 부호화' },
      { field: 'relatedKnowledge', stage: 3, purpose: '지식 연결', cognitiveProcess: '기존 스키마와의 통합 및 연관학습' },
      { field: 'mentalImage', stage: 4, purpose: '심상 형성', cognitiveProcess: '시각적 기억과 장기기억 고착화' }
    ];

    evolutionStages.forEach(({ field, stage, purpose, cognitiveProcess }) => {
      const fieldValue = note[field as keyof typeof note] as string;
      if (fieldValue) {
        mainEntity.push({
          "@type": "Question",
          "name": getMemoEvolutionQuestion(field, readingPurpose),
          "educationalAlignment": {
            "readingPurpose": readingPurpose,
            "evolutionStage": stage,
            "cognitiveGoal": purpose,
            "cognitiveProcess": cognitiveProcess,
            "learningTheory": "하비투스33 4단계 메모진화 방법론"
          },
          "acceptedAnswer": { 
            "@type": "Answer", 
            "text": fieldValue,
            "author": {
              "@type": "Person",
              "name": user?.name ?? user?.email ?? "학습자",
            },
            "dateCreated": sessionDetails?.createdAtISO ? new Date(sessionDetails.createdAtISO).toISOString() : undefined,
            "learningContext": `${purpose} 단계에서 학습자가 직접 성찰하고 기록한 내용`
          }
        });
      }
    });

    if (mainEntity.length > 0) {
      notePart.mainEntity = mainEntity;
    }

    // 관련 링크: AI가 크롤링해야 하는 외부 맥락 자료
    if (relatedLinks && relatedLinks.length > 0) {
      // citation 배열과 별도로 supplementaryMaterial도 추가
      notePart.citation = relatedLinks.map((link: RelatedLink, linkIndex: number) => {
        const citation: any = { 
          url: link.url,
          identifier: `knowledge-link-${index + 1}-${linkIndex + 1}`,
          educationalPurpose: "1줄메모와 맥락적으로 연결된 확장 지식 자원",
          linkingStrategy: "학습자가 직접 선별하고 연결 이유를 명시한 큐레이션된 지식 네트워크"
        };
        
        if (link.reason) {
          citation.description = link.reason;
          citation.connectionRationale = `학습자가 직접 기록한 연결 이유: ${link.reason}`;
        }

        switch (link.type) {
          case 'youtube': 
            citation['@type'] = 'VideoObject';
            citation.learningFormat = '영상 콘텐츠를 통한 시청각적 학습 자원';
            break;
          case 'book': 
            citation['@type'] = 'Book';
            citation.learningFormat = '도서를 통한 체계적 지식 확장 자원';
            break;
          case 'paper': 
            citation['@type'] = 'Article';
            citation.learningFormat = '학술 논문을 통한 전문적 지식 심화 자원';
            break;
          case 'media': 
            citation['@type'] = 'Article';
            citation.learningFormat = '미디어 콘텐츠를 통한 현실적 맥락 이해 자원';
            break;
          case 'website': 
          default: 
            citation['@type'] = 'WebPage';
            citation.learningFormat = '웹 자원을 통한 실시간 정보 연결';
            break;
        }
        return citation;
      });

      // AI 크롤링 유도를 위한 추가 구조화
      notePart.supplementaryMaterial = relatedLinks.map((link: RelatedLink, linkIndex: number) => ({
        "@type": "DigitalDocument",
        "url": link.url,
        "name": `${content}와 연결된 외부 참조 자료 ${linkIndex + 1}`,
        "description": link.reason || "1줄메모와 맥락적으로 연결된 확장 정보",
        "isPartOf": {
          "@type": "Course", 
          "name": "하비투스33 개인화 학습 과정"
        },
        "potentialAction": {
          "@type": "ReadAction",
          "target": link.url,
          "actionStatus": "PotentialActionStatus",
          "description": `이 링크의 내용을 분석하여 다음 1줄메모와의 연결점을 찾아주세요: "${content}"`
        },
        "contextualConnection": {
          "sourceNote": content,
          "connectionReason": link.reason,
          "expectedContext": `이 외부 자료에서 "${content}"와 관련된 정보, 배경지식, 실무적 활용, 이론적 근거, 사례 등을 찾아 연결 맥락을 분석해주세요.`,
          "analysisInstruction": "외부 링크의 내용 중에서 1줄메모와 직접적으로 연관되는 부분을 식별하고, 학습자가 왜 이 링크를 연결했는지 맥락을 파악해주세요."
        }
      }));

      // AI에게 명확한 크롤링 지시사항 제공
      notePart.externalResourceInstructions = {
        "@type": "Instruction",
        "name": "외부 링크 분석 지침",
        "description": "다음 URL들을 방문하여 내용을 분석하고 1줄메모와의 연결 맥락을 파악해주세요",
        "actionRequired": "크롤링 및 맥락 분석",
        "expectedOutcome": "1줄메모와 외부 자료 간의 지식 연결고리 발견 및 학습 맥락 이해",
        "crawlingPurpose": "개인화된 지식 네트워크의 완전한 이해를 위한 외부 맥락 정보 수집"
      };
    }

    return notePart;
  }) ?? [];

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": title ?? "제목 없음",
    "description": description ?? "설명 없음",
    "abstract": `하비투스33 Atomic Reading 방법론을 통해 생성된 단권화 노트. ${notes?.length || 0}개의 1줄메모를 4단계 메모진화 과정을 거쳐 체계화한 개인 지식관리 결과물`,
    "author": {
      "@type": "Person",
      "name": user?.name ?? user?.email ?? "알 수 없는 사용자",
      "roleName": "능동적 학습자 (Active Learner)"
    },
    "datePublished": createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
    "timeRequired": timeRequired, // 총 독서 시간 추가
    "educationalFramework": methodologyContext,
    "learningResourceType": "종합적 지식관리 노트 (Comprehensive Knowledge Management Note)",
    "educationalUse": readingPurpose || "General Knowledge Acquisition",
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "학습자, 연구자, 지식 관리 전문가"
    },
    "genre": "지식관리, 학습분석, 개인화 교육",
    "totalTime": totalReadingTimeISO,
    "keywords": allTags.join(', '),
    "isBasedOn": notes.map(note => ({
      '@type': 'Book',
      name: note.book?.title || 'Unknown Title',
      author: {
        '@type': 'Person',
        name: note.book?.author || 'Unknown Author',
      },
      isbn: note.book?.isbn,
    })).filter((v, i, a) => a.findIndex(t => (t.isbn === v.isbn)) === i),
  };

  // 사용자가 작성한 마크다운 인사이트를 구조화된 형태로 포함
  if (userMarkdownContent && userMarkdownContent.trim() !== '') {
    // 메인 아티클 본문으로 포함
    jsonLd.articleBody = userMarkdownContent;
    
    // 사용자 인사이트를 별도의 Comment/Analysis 엔티티로도 구조화
    jsonLd.comment = {
      "@type": "Comment", 
      "text": userMarkdownContent,
      "author": {
        "@type": "Person",
        "name": user?.name ?? user?.email ?? "알 수 없는 사용자",
      },
      "about": "독서 노트에 대한 개인적 인사이트 및 분석",
      "commentType": "personal_insight", // 커스텀 필드: 개인적 통찰
      "dateCreated": createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
    };
    
    // 사용자 종합 인사이트: 지식 통합 및 메타인지적 성찰
    const insightEntity = {
      "@type": "Question",
      "name": "이 노트들을 통해 얻은 핵심 인사이트와 분석은 무엇인가요?",
      "educationalAlignment": {
        "cognitiveLevel": "종합(Synthesis) 및 평가(Evaluation)",
        "learningOutcome": "지식 통합과 메타인지적 성찰을 통한 개인적 통찰 도출",
        "pedagogicalApproach": "구성주의적 지식 재구성 (Constructivist Knowledge Reconstruction)"
      },
      "acceptedAnswer": {
        "@type": "Answer", 
        "text": userMarkdownContent,
        "author": {
          "@type": "Person",
          "name": user?.name ?? user?.email ?? "알 수 없는 사용자",
          "roleName": "지식 큐레이터 및 통합자"
        },
        "answerType": "개인적 인사이트 및 종합적 분석",
        "cognitiveProcess": "다수의 1줄메모를 통합하여 고차원적 통찰 생성",
        "learningEvidence": "학습자의 지식 연결능력, 비판적 사고, 창의적 통합 능력의 증거"
      }
    };
    
    // 기존 hasPart가 있다면 인사이트 엔티티를 추가
    if (!jsonLd.mainEntity) {
      jsonLd.mainEntity = [insightEntity];
    } else if (Array.isArray(jsonLd.mainEntity)) {
      jsonLd.mainEntity.unshift(insightEntity); // 맨 앞에 추가
    } else {
      jsonLd.mainEntity = [insightEntity, jsonLd.mainEntity];
    }
  }

  if (hasPart.length > 0) {
    jsonLd.hasPart = hasPart;
  }

  if (actionableModules.length > 0) {
    jsonLd.actionableModules = actionableModules;
  }
  if (knowledgePersonality) {
    jsonLd.knowledgePersonality = knowledgePersonality;
  }


  // 전체 문서에 대한 외부 리소스 크롤링 안내
  const allExternalLinks = notes?.flatMap(note => note.relatedLinks || []) || [];
  if (allExternalLinks.length > 0) {
    jsonLd.relatedResource = {
      "@type": "Collection",
      "name": "연결된 외부 지식 자원",
      "description": "이 단권화 노트의 1줄메모들과 맥락적으로 연결된 외부 자료들",
      "numberOfItems": allExternalLinks.length,
      "collectionSize": allExternalLinks.length,
      "itemListElement": allExternalLinks.map((link, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "WebPage",
          "url": link.url,
          "description": link.reason || "1줄메모와 연결된 외부 자료"
        }
      }))
    };

    // AI 크롤러를 위한 종합적인 분석 지침
    jsonLd.analysisInstructions = {
      "@type": "AnalysisGuideline", 
      "name": "외부 링크 종합 분석 가이드라인",
      "objective": "1줄메모와 외부 자료 간의 지식 연결망 완전 분석",
      "methodology": [
        "1단계: 각 외부 링크의 콘텐츠를 크롤링하여 전체 내용 파악",
        "2단계: 연결된 1줄메모와의 직접적 관련성 식별", 
        "3단계: 학습자가 기록한 연결 이유의 타당성 검증",
        "4단계: 외부 자료에서 1줄메모를 보완하는 추가 맥락 정보 발견",
        "5단계: 지식 네트워크 전체의 일관성과 학습 목적 달성도 평가"
      ],
      "expectedDeliverables": [
        "각 링크별 핵심 내용 요약",
        "1줄메모와 외부 자료의 연결 맥락 분석",
        "학습자의 지식 큐레이션 패턴 파악",
        "누락된 연결고리나 추가 학습 자료 제안",
        "종합적인 개인화 학습 경로 분석"
      ],
      "crawlingPriority": "높음 - 완전한 맥락 이해를 위해 필수적",
      "contextualImportance": "외부 링크 없이는 1줄메모의 진정한 의미와 학습자의 사고 과정을 완전히 이해할 수 없음"
    };
  }

  return jsonLd;
}; 