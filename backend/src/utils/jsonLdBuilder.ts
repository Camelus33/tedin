import {
  ActionModule,
  CognitiveProvenance,
  KnowledgePersonality,
} from '../types/common';
import { TimeUtils } from './timeUtils';

// frontend/components/ts/TSNoteCard.tsx 에서 가져온 타입 정의를
// 백엔드에서 사용할 수 있도록 아래에 직접 정의하거나, 공유 타입 파일에서 가져와야 합니다.
// 여기서는 직접 정의하여 의존성 문제를 해결합니다.

export interface RelatedLink {
  type: 'book' | 'paper' | 'youtube' | 'media' | 'website';
  url: string;
  reason?: string;
  _id?: string;
  addedAt?: Date | string; // 링크 추가 시점
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
  noteType?: 'quote' | 'thought' | 'question'; // 1줄메모 유형
  noteCreatedAt?: Date | string; // 메모 생성 시점
  memoEvolutionTimestamp?: Date | string; // 메모 진화 시점
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
  category?: string; // 책 장르/카테고리
  readingPurpose?: 'exam_prep' | 'practical_knowledge' | 'humanities_self_reflection' | 'reading_pleasure'; // 읽는 목적
  purchaseLink?: string; // 구매 링크
  createdAt?: Date | string; // 책 등록 시점
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
  exam_prep: ['어떤 부분이 중요하다고 느껴졌나요?', '처음 봤을 때, 어떤 느낌이 들었나요?', '기존의 어떤 지식이 연상되나요?', '표현할 수 있는 방법은 무엇인가요?'],
  practical_knowledge: ['어떻게 내 업무와 연결되나요?', '이것을 몰라 불편했던 경험이 있나요?', '이 메모는 어떤 나의 경험/지식과 연상시키나요?', '이것의 핵심을 한 문장으로 설명해 본다면?'],
  humanities_self_reflection: ['이 메모, 어떤 감정/생각을 불러일으켰나요?', '메모를 적던 당시 상황은 무엇을 떠올리게 하나요?', '이 메모, 어떤 다른 지식을 연상시키나요?', '이 메모의 내용을 한 폭의 그림이나 장면으로 묘사한다면?'],
  reading_pleasure: ['이 메모, 어떤 점이 가장 흥미로웠나요?', '이 구절을 읽을 때, 어떤 기분이었나요?', '이 메모의 즐거움, 어떤 다른 작품/경험을 떠올리게 하나요?', '책 속의 어떤 장면이 머릿속에 생생하게 그려졌나요?'],
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

  // TimeUtils를 사용하여 ISO 8601 기간 형식으로 변환
  const timeRequired = TimeUtils.formatDurationISO8601(totalReadingDurationSeconds);


  // --- 신규 기능 호출 ---
  const actionableModules = buildActionModules(readingPurpose);
  const knowledgePersonality = analyzeKnowledgePersonality(notes);

  // --- 학습 여정 시간 흐름 빌더 함수 ---
  const buildLearningJourney = (summaryNoteData: SummaryNoteData): any => {
    const learningEvents: Array<{
      timestamp: Date;
      type: string;
      description: string;
      data: any;
    }> = [];

    // 1. 책 등록 시점들 수집
    const bookRegistrations = new Map<string, Date>();
    notes?.forEach(note => {
      if (note.book?.createdAt && note.book._id) {
        const bookCreatedAt = TimeUtils.ensureDate(note.book.createdAt);
        if (!bookRegistrations.has(note.book._id) || bookRegistrations.get(note.book._id)! > bookCreatedAt) {
          bookRegistrations.set(note.book._id, bookCreatedAt);
        }
      }
    });

    bookRegistrations.forEach((createdAt, bookId) => {
      const book = notes?.find(n => n.book?._id === bookId)?.book;
      if (book) {
        learningEvents.push({
          timestamp: createdAt,
          type: 'book_registration',
          description: '책 등록',
          data: {
            '@type': 'RegisterAction',
            object: {
              '@id': `h33r:book:${book._id}`
            },
            startTime: TimeUtils.toISOString(createdAt)
          }
        });
      }
    });

    // 2. 아토믹 리딩 세션들 수집
    notes?.forEach((note, index) => {
      if (note.sessionDetails?.createdAtISO) {
        const sessionTime = TimeUtils.ensureDate(note.sessionDetails.createdAtISO);
        learningEvents.push({
          timestamp: sessionTime,
          type: 'atomic_reading_session',
          description: `아토믹 리딩 세션 ${index + 1}`,
          data: {
            '@type': 'ReadAction',
            object: {
              '@id': `h33r:book:${note.book?._id}`
            },
            startTime: TimeUtils.toISOString(sessionTime),
            duration: TimeUtils.formatDurationISO8601(note.sessionDetails.durationSeconds || 0),
            result: {
              '@type': 'Note',
              text: note.content,
              noteType: note.noteType || 'thought',
              pageRange: {
                startPage: note.sessionDetails.startPage,
                endPage: note.sessionDetails.actualEndPage
              },
              performanceMetrics: {
                ppm: note.sessionDetails.ppm,
                efficiency: note.sessionDetails.ppm && note.sessionDetails.ppm > 3 ? 'high' : 'normal'
              }
            }
          }
        });
      }

      // 3. 1줄 메모 작성 시점 (세션과 다를 수 있음)
      if (note.noteCreatedAt) {
        const noteTime = TimeUtils.ensureDate(note.noteCreatedAt);
        learningEvents.push({
          timestamp: noteTime,
          type: 'memo_creation',
          description: `1줄 메모 작성: "${note.content.substring(0, 30)}..."`,
          data: {
            '@type': 'WriteAction',
            result: {
              '@type': 'Note',
              text: note.content,
              noteType: note.noteType,
              tags: note.tags
            },
            startTime: TimeUtils.toISOString(noteTime)
          }
        });
      }

      // 4. 메모 진화 시점들
      if (note.memoEvolutionTimestamp) {
        const evolutionTime = TimeUtils.ensureDate(note.memoEvolutionTimestamp);
        const evolutionStages = [];
        
        if (note.importanceReason) evolutionStages.push('중요성 인식');
        if (note.momentContext) evolutionStages.push('맥락 기록');
        if (note.relatedKnowledge) evolutionStages.push('지식 연결');
        if (note.mentalImage) evolutionStages.push('심상 형성');

        if (evolutionStages.length > 0) {
          learningEvents.push({
            timestamp: evolutionTime,
            type: 'memo_evolution',
            description: `메모 진화: ${evolutionStages.join(', ')}`,
            data: {
              '@type': 'UpdateAction',
              object: {
                '@type': 'Note',
                text: note.content
              },
              result: {
                '@type': 'EnhancedNote',
                evolutionStages: evolutionStages,
                importanceReason: note.importanceReason,
                momentContext: note.momentContext,
                relatedKnowledge: note.relatedKnowledge,
                mentalImage: note.mentalImage
              },
              startTime: TimeUtils.toISOString(evolutionTime)
            }
          });
        }
      }

      // 5. 관련 링크 추가 시점들
      note.relatedLinks?.forEach((link, linkIndex) => {
        if (link.addedAt) {
          const linkTime = TimeUtils.ensureDate(link.addedAt);
          learningEvents.push({
            timestamp: linkTime,
            type: 'knowledge_linking',
            description: `지식 연결: ${link.type} 링크 추가`,
            data: {
              '@type': 'LinkAction',
              object: {
                '@type': 'Note',
                text: note.content
              },
              target: {
                '@type': 'WebPage',
                url: link.url,
                linkType: link.type
              },
              reason: link.reason,
              startTime: TimeUtils.toISOString(linkTime)
            }
          });
        }
      });
    });

    // 6. 단권화 노트 생성 시점
    if (summaryNoteData.createdAt) {
      const summaryTime = TimeUtils.ensureDate(summaryNoteData.createdAt);
      learningEvents.push({
        timestamp: summaryTime,
        type: 'summary_note_creation',
        description: '단권화 노트 생성',
        data: {
          '@type': 'CreateAction',
          result: {
            '@type': 'Article',
            headline: summaryNoteData.title,
            description: summaryNoteData.description,
            articleBody: summaryNoteData.userMarkdownContent,
            hasPart: notes?.map(n => ({ '@type': 'Note', text: n.content }))
          },
          startTime: TimeUtils.toISOString(summaryTime)
        }
      });
    }

    // 7. AI 링크 생성 시점 (현재 시점으로 추정)
    const currentTime = new Date();
    learningEvents.push({
      timestamp: currentTime,
      type: 'ai_link_generation',
      description: 'AI 링크 생성',
      data: {
        '@type': 'ShareAction',
        object: {
          '@type': 'Article',
          headline: summaryNoteData.title
        },
        result: {
          '@type': 'WebPage',
          description: 'AI 에이전트가 분석 가능한 구조화된 학습 데이터'
        },
        startTime: TimeUtils.toISOString(currentTime)
      }
    });

    // 시간순으로 정렬
    learningEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Schema.org HowTo 구조로 변환
    return {
      '@type': 'HowTo',
      name: '하비투스33 학습 여정',
      description: '아토믹 리딩부터 AI 링크 생성까지의 완전한 학습 과정',
      totalTime: timeRequired,
      step: learningEvents.map((event, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: event.description,
        description: `${event.type} 단계: ${event.description}`,
        startTime: TimeUtils.toISOString(event.timestamp),
        action: event.data
      })),
      learningOutcome: {
        '@type': 'LearningOutcome',
        description: '체계적인 지식 관리와 AI 에이전트와의 효과적 상호작용을 위한 구조화된 학습 데이터 생성',
        totalSteps: learningEvents.length,
        timeSpan: learningEvents.length > 0 ? {
          startDate: TimeUtils.toISOString(learningEvents[0].timestamp),
          endDate: TimeUtils.toISOString(learningEvents[learningEvents.length - 1].timestamp)
        } : null
      }
    };
  };

  // 학습 여정 생성
  const learningJourney = buildLearningJourney(summaryNoteData);

  // 하비투스33 학습 방법론 및 시스템 맥락 정보
  const methodologyContext = {
    "@type": "EducationalFramework",
    "name": "Atomic Reading",
    "description": "3분 읽고 1줄 메모 단위의 초집중 독서를 통한 개인화된 지식관리 방법론",
    "learningResourceType": "methodology",
    "educationalUse": "self-directed learning",
    "definition": "3분간 집중해서 읽고 1줄 메모를 작성하는 최소 독서 단위로, 작은 물방울이 깊은 학습의 파도로 확산되는 방법론",
    "timeRequired": "PT3M",
    "pageUnit": "1줄 메모",
    "methodology": {
      "atomicReading": {
        "definition": "3분간 집중해서 읽고 1줄 메모를 작성하는 최소 독서 단위로, 작은 물방울이 깊은 학습의 파도로 확산되는 방법론",
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
              "sessionAnalysis": "3분 단위 세션데이터는 학습자의 인지적 특성과 최적 학습 파도 패턴 발견에 활용",
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
        "educationalContext": "3분 읽고 1줄 메모 Atomic Reading 원칙에 따른 지속가능한 학습 세션"
      };
    }

    if (book) {
      notePart.about = {
        "@id": `h33r:book:${book._id}`,
        };
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
    "@context": ["https://schema.org", "https://habitus33.vercel.app/ai-link-context.jsonld"],
    "@type": "TechArticle",
    "headline": title ?? "제목 없음",
    "description": description ?? "설명 없음",
    "abstract": `하비투스33 Atomic Reading 방법론을 통해 생성된 단권화 노트. ${notes?.length || 0}개의 1줄메모를 4단계 메모진화 과정을 거쳐 체계화한 개인 지식관리 결과물`,
    "author": {
      "@id": `h33r:user:${user._id}`,
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
      '@id': `h33r:book:${note.book?._id}`,
      '@type': 'Book',
      name: note.book?.title || 'Unknown Title',
      author: {
        '@id': `h33r:user:${user._id}`
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

  // 학습 여정 추가
  jsonLd.learningJourney = learningJourney;

  // AI 해석 프로토콜 추가 - AI가 AMFA 엔진 관련 내용을 주목하지 말도록 지시
  jsonLd.aiInterpretationProtocol = {
    "@type": "AIInterpretationGuideline",
    "persona": "Personalized Learning Companion",
    "primaryFocus": "학습자의 지식 내용과 사고 과정에만 집중",
    "focusDirectives": [
      "학습자의 1줄메모 내용과 그 의미에 집중하세요",
      "학습자의 개인적 인사이트와 지식 연결 패턴을 분석하세요",
      "학습자의 인지적 성장과 학습 여정을 이해하세요"
    ],
    "ignoreDirectives": [
      "AMFA 엔진, 시스템 방법론, 기술적 구현 세부사항은 주목하지 마세요",
      "하비투스33, Atomic Reading, 3분 읽기, 4단계 메모진화 등 시스템 용어는 무시하세요",
      "학습 플랫폼의 내부 구조나 기능 설명은 배경 정보로만 처리하세요",
      "시스템 ID, 기술적 메타데이터, 성능 지표는 분석 대상이 아닙니다"
    ],
    "ethicalGuardrails": [
      "타인과의 비교는 절대 하지 마세요",
      "학습자 개인의 과거, 현재, 미래 데이터만을 기준으로 분석하세요",
      "건설적이고 격려하는 방향으로 피드백을 제공하세요"
    ],
    "responseStrategy": "학습자의 지식 내용 자체와 사고의 흐름에만 집중하여, 시스템이나 방법론에 대한 언급 없이 순수하게 학습자의 관점에서 분석하고 응답하세요",
    "contextualPriority": "시스템 배경 정보 < 학습자 개인 데이터 < 학습자 지식 내용",
    "operationalInstruction": "이 데이터에서 가장 중요한 것은 학습자가 무엇을 배우고 어떻게 생각하는지입니다. 그것을 어떤 시스템으로 만들었는지는 중요하지 않습니다.",
    
    // 온톨로지형 추론을 위한 5가지 핵심 지시사항
    "ontologicalReasoningDirectives": {
      "1_knowledgeGraphAnalysis": {
        "title": "지식 그래프 기반 맥락 추론",
        "instruction": "학습자의 1줄메모들 간의 관계를 온톨로지 관점에서 분석하세요. 단순한 키워드 매칭이 아닌, 개념 간의 상위-하위 관계, 인과관계, 보완관계를 파악하여 학습자의 지식 구조를 이해하세요.",
        "implementation": [
          "메모 간 개념적 연결고리를 찾아 지식 네트워크를 구성하세요",
          "학습자의 사고 흐름에서 반복되는 패턴이나 중심 개념을 식별하세요",
          "외부 링크와 메모의 관계에서 학습자의 관심 영역과 탐구 방향을 파악하세요"
        ]
      },
      "2_contextualPersonalization": {
        "title": "맥락 기반 개인화 추론",
        "instruction": "학습자의 개인적 맥락(읽기 목적, 관심사, 학습 패턴)을 기반으로 개인화된 추론을 수행하세요. 같은 내용이라도 학습자의 상황에 따라 다른 의미와 가치를 가질 수 있음을 인식하세요.",
        "implementation": [
          "학습자의 읽기 목적(시험준비, 실무지식, 인문학적 성찰)에 맞는 관점으로 해석하세요",
          "학습자가 중요하게 여기는 가치나 관심사를 메모에서 추출하여 반영하세요",
          "학습자의 직업, 전공, 생활 맥락을 고려한 실용적 연결점을 제안하세요"
        ]
      },
      "3_temporalEvolutionTracking": {
        "title": "시간적 변화 패턴 인식",
        "instruction": "학습자의 지식과 사고가 시간에 따라 어떻게 진화하고 있는지 추적하세요. 초기 아이디어가 어떻게 발전하고 심화되는지, 새로운 관점이 어떻게 기존 지식과 통합되는지 파악하세요.",
        "implementation": [
          "메모 생성 시점을 고려하여 학습자의 사고 발전 과정을 분석하세요",
          "초기 메모와 후기 메모 간의 관점 변화나 이해 심화를 인식하세요",
          "학습자의 지식 성장 궤적을 바탕으로 다음 학습 방향을 예측하세요"
        ]
      },
      "4_insightSynthesis": {
        "title": "지식 연결망 기반 통찰 도출",
        "instruction": "개별 메모들을 연결하여 학습자가 명시적으로 표현하지 않은 잠재적 통찰을 도출하세요. 서로 다른 영역의 지식을 연결하여 새로운 관점을 제시하세요.",
        "implementation": [
          "서로 다른 책이나 주제의 메모들 간의 숨겨진 연결점을 찾아 제시하세요",
          "학습자의 메모에서 드러나는 암묵적 관심사나 가치관을 언어화하세요",
          "분산된 지식 조각들을 통합하여 학습자만의 독특한 관점을 구성하세요"
        ]
      },
      "5_metacognitiveReflection": {
        "title": "메타인지적 성찰 유도",
        "instruction": "학습자가 자신의 학습 과정과 사고 방식을 더 깊이 이해할 수 있도록 메타인지적 질문과 성찰을 유도하세요. 학습자의 지식 습득 패턴과 선호하는 사고 방식을 인식하게 도와주세요.",
        "implementation": [
          "학습자의 메모 작성 패턴에서 선호하는 사고 방식(시각적, 논리적, 실용적 등)을 파악하세요",
          "학습자의 강점과 관심 영역을 바탕으로 효과적인 학습 전략을 제안하세요",
          "학습자가 자신의 지식과 경험을 새로운 관점에서 재해석할 수 있도록 도와주세요"
        ]
      }
    },
    
    // 고품질 답변을 위한 실행 가이드라인
    "qualityAssuranceProtocol": {
      "depthRequirement": "표면적 분석이 아닌, 학습자의 지식 맥락 깊숙이 들어가서 의미 있는 통찰을 제공하세요",
      "personalizationLevel": "일반적 답변이 아닌, 오직 이 학습자에게만 적용되는 개인화된 답변을 만드세요",
      "connectionFocus": "학습자의 기존 지식과 새로운 정보 간의 연결고리를 명확히 제시하세요",
      "actionableGuidance": "학습자가 실제로 활용할 수 있는 구체적이고 실천 가능한 가이드를 포함하세요",
      "respectfulTone": "학습자의 지적 여정을 존중하고 격려하는 톤으로 소통하세요"
    }
  };

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