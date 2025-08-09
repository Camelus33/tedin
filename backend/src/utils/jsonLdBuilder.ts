import {
  ActionModule,
  CognitiveProvenance,
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
  noteCreatedAt?: Date | string; // 메모 생성 시점 (서버 시간)
  clientCreatedAt?: Date | string; // 메모 생성 시점 (클라이언트 시간)
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
  
  // 다이어그램 데이터 추가
  diagram?: {
    imageUrl?: string;           // SVG 이미지 URL/base64
    data?: {
      nodes: Array<{
        noteId: string;
        content: string;
        order: number;
        color: string;
        position: { x: number; y: number };
      }>;
      connections: Array<{
        id: string;
        sourceNoteId: string;
        targetNoteId: string;
        relationshipType: 'cause-effect' | 'before-after' | 'foundation-extension' | 'contains' | 'contrast';
      }>;
    };
    lastModified?: string;       // 마지막 수정 시간
  };
}

// Mapping of reading purposes to question sets for memo evolution
// 질문은 공통 4문항으로 통일하고, 목적별 차이는 프론트 placeholder에서만 표현합니다.
const memoEvolutionQuestionMap: Record<string, string[]> = {
  exam_prep: ['왜 이 문장을 메모했나요?', '그때의 장소나 상황은 어땠나요?', '이 문장이 어떤 지식/문장/경험과 연결되나요?', '이 문장을 읽으면 마음속에 어떤 장면이 떠오르나요?'],
  practical_knowledge: ['왜 이 문장을 메모했나요?', '그때의 장소나 상황은 어땠나요?', '이 문장이 어떤 지식/문장/경험과 연결되나요?', '이 문장을 읽으면 마음속에 어떤 장면이 떠오르나요?'],
  humanities_self_reflection: ['왜 이 문장을 메모했나요?', '그때의 장소나 상황은 어땠나요?', '이 문장이 어떤 지식/문장/경험과 연결되나요?', '이 문장을 읽으면 마음속에 어떤 장면이 떠오르나요?'],
  reading_pleasure: ['왜 이 문장을 메모했나요?', '그때의 장소나 상황은 어땠나요?', '이 문장이 어떤 지식/문장/경험과 연결되나요?', '이 문장을 읽으면 마음속에 어떤 장면이 떠오르나요?'],
};

/**
 * @function getNoteTypeSemantics
 * @description 메모 타입에 따른 시맨틱 분류 정보를 반환합니다.
 */
const getNoteTypeSemantics = (noteType?: string) => {
  switch (noteType) {
    case 'quote':
      return {
        schemaType: 'Quotation',
        rdfType: 'h33r:QuotationNote',
        typeLabel: '인용',
        classification: 'ExternalKnowledge',
        epistemicStatus: 'AuthorityBased',
        cognitiveFunction: 'KnowledgePreservation'
      };
    case 'question':
      return {
        schemaType: 'Question',
        rdfType: 'h33r:QuestionNote', 
        typeLabel: '질문',
        classification: 'InquiryDriven',
        epistemicStatus: 'Exploratory',
        cognitiveFunction: 'KnowledgeDiscovery'
      };
    case 'thought':
    default:
      return {
        schemaType: 'CreativeWork',
        rdfType: 'h33r:ThoughtNote',
        typeLabel: '생각',
        classification: 'PersonalInsight',
        epistemicStatus: 'ReflectiveSynthesis',
        cognitiveFunction: 'KnowledgeCreation'
      };
  }
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

/**
 * @function getPreferredNoteCreatedAt
 * @description 노트의 생성 시간을 가져올 때 클라이언트 시간을 우선적으로 사용합니다.
 * 이는 UI에서 표시되는 시간과 AI-Link 데이터의 시간이 일치하도록 보장합니다.
 */
const getPreferredNoteCreatedAt = (note: PopulatedTSNote): Date | null => {
  // 1순위: clientCreatedAt (사용자 현지 시간)
  if (note.clientCreatedAt) {
    return TimeUtils.ensureDate(note.clientCreatedAt);
  }
  
  // 2순위: noteCreatedAt (서버 시간)
  if (note.noteCreatedAt) {
    return TimeUtils.ensureDate(note.noteCreatedAt);
  }
  
  // 3순위: 세션 시간 (fallback)
  if (note.sessionDetails?.createdAtISO) {
    return TimeUtils.ensureDate(note.sessionDetails.createdAtISO);
  }
  
  return null;
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







/**
 * @function buildExecutiveSummary
 * @description AI-Link의 최상단에 위치할 요약문을 생성합니다. 외부 AI가 이 문서의 정체성과 사용법을 빠르게 파악하도록 돕습니다.
 * @param summaryNoteData 단권화 노트의 전체 데이터
 * @param knowledgePersonality 추론된 지식 페르소나
 * @param creativePersona 추론된 창의적 페르소나
 * @param epistemicFramework 인식론적 프레임워크 (PBAM 분석 결과)
 * @returns {string} 구조화된 요약 텍스트
 */
const buildExecutiveSummary = (summaryNoteData: SummaryNoteData): string => {
  const { user, allTags = [] } = summaryNoteData;
  const userName = user?.name ?? user?.email ?? '해당 사용자';
  const mainTopics = allTags.slice(0, 5).join(', ');

  return `
### AI-Link Executive Summary
이 문서는 개인화된 지식 캡슐입니다.
이 요약은 외부 AI 에이전트가 이 문서의 내용과 구조를 효과적으로 활용하도록 돕기 위한 가이드입니다.

**1. 문서의 핵심 내용:**
• 주요 주제: ${mainTopics}
• 포함된 1줄메모 수: ${summaryNoteData.notes?.length || 0}개
• 사용자 정의 관계 수: ${summaryNoteData.diagram?.data?.connections?.length || 0}개

**2. AI 에이전트 활용 가이드:**
• **메모카드 내용 분석:** 'memoSummary' 필드에서 사용자가 작성한 1줄메모들의 핵심 내용을 확인하세요. 각 메모의 text, noteType, evolutionLevel, 그리고 진화 과정(importanceReason, momentContext, relatedKnowledge, mentalImage)을 분석하여 사용자의 사고 과정을 파악하세요.
• **시간순 지식 성장 분석:** 'knowledgeGrowthTimeline'을 통해 사용자의 지식이 시간에 따라 어떻게 발전했는지 분석하세요. 각 성장 단계의 새로운 개념, 반복 주제, 사고 깊이 변화를 파악하여 학습 패턴을 이해하세요.
• **온톨로지 기반 관계 분석:** 'memoRelationships'는 사용자가 설정한 5가지 관계 타입(원인-결과, 전-후, 기반-확장, 포함, 대조)을 온톨로지 기반으로 구조화한 지식 그래프입니다. 각 관계의 ontologicalProperties와 llmAnalysisGuidance를 활용하여 사용자의 사고 패턴을 깊이 분석하세요.
• **상세 지식 분석:** 'hasPart' 배열의 각 'NoteDigitalDocument'는 사용자의 핵심 생각 단위입니다. 'cognitiveProvenance'과 'mainEntity'를 분석하여 사고의 맥락을 파악하세요.
• **실행 가능한 액션:** 'potentialAction' 배열에는 이 지식을 바탕으로 즉시 실행할 수 있는 제안(예: 이미지 생성, 보고서 작성)들이 포함되어 있습니다. 사용자에게 이 액션들을 제안하세요.
• **외부 정보 연결:** 'supplementaryMaterial'과 'relatedResource'에 포함된 URL들을 크롤링하여 더 깊은 맥락을 파악하세요. 'analysisInstructions'는 크롤링 가이드라인을 제공합니다.
• **존중해야 할 원칙:** 최상위 'aiInterpretationProtocol'은 사용자와 상호작용할 때 반드시 지켜야 할 윤리적 가이드라인과 기술적 지침을 담고 있습니다. 이 프로토콜을 최우선으로 준수하세요.
`.trim();
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
export const buildJsonLd = async (summaryNoteData: SummaryNoteData): Promise<object> => {
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

  // --- 액션 모듈 생성 ---
  const actionableModules = buildActionModules(readingPurpose);
  
  const executiveSummary = buildExecutiveSummary(summaryNoteData);

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
      const noteTime = getPreferredNoteCreatedAt(note);
      if (noteTime) {
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
          description: 'AI 에이전트가 분석 가능한 구조화된 생각진화 데이터'
        },
        startTime: TimeUtils.toISOString(currentTime)
      }
    });

    // 시간순으로 정렬
    learningEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Schema.org HowTo 구조로 변환
    return {
      '@type': 'HowTo',
      name: '생각진화 과정',
      description: '독서에서 생각진화 과정을 AI에게 전달하고, 온톨로지 지식 그래프 기반 인과 추론까지 이어지는 전체 흐름',
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
        description: '체계적인 지식 관리와 AI 에이전트와의 효과적 상호작용을 위한 구조화된 사고 데이터 생성',
        totalSteps: learningEvents.length,
        timeSpan: learningEvents.length > 0 ? {
          startDate: TimeUtils.toISOString(learningEvents[0].timestamp),
          endDate: TimeUtils.toISOString(learningEvents[learningEvents.length - 1].timestamp)
        } : null
      }
    };
  };

  // 학습 여정 생성 (시간순 지식 성장 패턴)
  const learningJourney = buildLearningJourney(summaryNoteData);
  
  // 시간순 지식 성장 분석을 위한 추가 구조화
  const buildKnowledgeGrowthTimeline = (summaryNoteData: SummaryNoteData): any => {
    const { notes } = summaryNoteData;
    
    // 시간순으로 정렬된 메모들
    const timeSortedNotes = notes
      ?.map(note => ({
        note,
        timestamp: getPreferredNoteCreatedAt(note) || 
                  (note.sessionDetails?.createdAtISO ? new Date(note.sessionDetails.createdAtISO) : new Date())
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()) || [];
    
    // 지식 성장 단계별 분석
    const growthStages = [];
    let cumulativeInsights = [];
    
    timeSortedNotes.forEach(({ note, timestamp }, index) => {
      const stage = {
        "@type": "KnowledgeGrowthStage",
        "stageNumber": index + 1,
        "timestamp": TimeUtils.toISOString(timestamp),
        "timeFromStart": index === 0 ? "PT0S" : TimeUtils.formatDurationISO8601(
          timestamp.getTime() - timeSortedNotes[0].timestamp.getTime()
        ),
        "note": {
          "@type": "Note",
          "text": note.content,
          "noteType": note.noteType || 'thought',
          "evolutionLevel": note.mentalImage ? 'fully_evolved' : 
                           note.relatedKnowledge ? 'partially_evolved' : 'initial_idea'
        },
        "cognitiveContext": {
          "readingPace": note.sessionDetails?.ppm ? 
            (note.sessionDetails.ppm > 3 ? 'fast_processing' : 
             note.sessionDetails.ppm > 2 ? 'steady_reading' : 'deep_contemplation') : 'unknown',
          "timeOfDay": note.sessionDetails?.createdAtISO ? 
            (() => {
              const hour = new Date(note.sessionDetails.createdAtISO).getHours();
              if (hour >= 0 && hour < 5) return 'late_night_insight';
              if (hour >= 6 && hour < 10) return 'morning_routine';
              if (hour >= 10 && hour < 18) return 'day_activity';
              return 'evening_learning';
            })() : 'unknown'
        },
        "growthPattern": {
          "newConcepts": note.tags?.filter(tag => !cumulativeInsights.includes(tag)) || [],
          "recurringThemes": note.tags?.filter(tag => cumulativeInsights.includes(tag)) || [],
          "knowledgeDepth": note.mentalImage ? 'deep_integration' : 
                           note.relatedKnowledge ? 'connection_building' : 'initial_capture'
        }
      };
      
      // 누적 인사이트 업데이트
      if (note.tags) {
        cumulativeInsights = [...new Set([...cumulativeInsights, ...note.tags])];
      }
      
      growthStages.push(stage);
    });
    
    // 전체 성장 패턴 분석
    const growthAnalysis = {
      "@type": "KnowledgeGrowthAnalysis",
      "totalStages": growthStages.length,
      "timeSpan": growthStages.length > 0 ? {
        "startDate": TimeUtils.toISOString(timeSortedNotes[0]?.timestamp),
        "endDate": TimeUtils.toISOString(timeSortedNotes[timeSortedNotes.length - 1]?.timestamp),
        "duration": TimeUtils.formatDurationISO8601(
          timeSortedNotes[timeSortedNotes.length - 1]?.timestamp.getTime() - 
          timeSortedNotes[0]?.timestamp.getTime()
        )
      } : null,
      "growthPatterns": {
        "conceptEvolution": cumulativeInsights,
        "depthProgression": growthStages.map(stage => stage.note.evolutionLevel),
        "cognitiveIntensity": growthStages.map(stage => stage.cognitiveContext.readingPace),
        "temporalPatterns": growthStages.map(stage => stage.cognitiveContext.timeOfDay)
      },
      "llmAnalysisGuidance": {
        "objective": "사용자의 지식이 시간에 따라 어떻게 발전했는지 분석",
        "keyQuestions": [
          "어떤 개념들이 처음 등장하고 나중에 어떻게 발전했나요?",
          "사용자의 사고 깊이가 시간에 따라 어떻게 변화했나요?",
          "특정 시간대나 상황에서 더 깊은 통찰이 나왔나요?",
          "반복되는 주제나 패턴이 있나요?"
        ],
        "analysisMethod": [
          "1단계: 각 성장 단계의 새로운 개념과 반복 주제 식별",
          "2단계: 사고 깊이의 변화 패턴 분석 (initial → partially → fully evolved)",
          "3단계: 시간대별 인지적 특성과 통찰의 연관성 파악",
          "4단계: 전체적인 지식 성장 궤적과 학습 패턴 도출"
        ]
      }
    };
    
    return {
      "@type": "KnowledgeGrowthTimeline",
      "name": "사용자 지식 성장 타임라인",
      "description": "시간순으로 정렬된 메모들을 통해 사용자의 지식이 어떻게 발전했는지 보여주는 타임라인",
      "stages": growthStages,
      "analysis": growthAnalysis
    };
  };
  
  // 지식 성장 타임라인 생성
  const knowledgeGrowthTimeline = buildKnowledgeGrowthTimeline(summaryNoteData);

  /**
   * @function buildConciseMemoSummary
   * @description 사용자의 1줄메모 내용을 LLM이 쉽게 접근하고 이해할 수 있도록 간결하게 요약합니다.
   * 각 메모의 핵심 내용과 진화 단계를 포함합니다.
   */
  const buildConciseMemoSummary = (notes: PopulatedTSNote[]): string => {
    if (!notes || notes.length === 0) {
      return "사용자가 작성한 메모가 없습니다.";
    }

    const summaryLines: string[] = [];
    notes.forEach((note, index) => {
      const evolutionStatus = note.mentalImage ? '완전 진화됨' : 
                              note.relatedKnowledge ? '부분 진화됨' : '초기 아이디어';
      const tags = note.tags?.length > 0 ? ` (#${note.tags.join(', #')})` : '';
      summaryLines.push(
        `${index + 1}. [${evolutionStatus}] "${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}"${tags}`
      );
    });

    return `사용자의 1줄메모 요약:
${summaryLines.join('\n')}`;
  };

  const conciseMemoSummary = buildConciseMemoSummary(notes);

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

    // 메모 타입별 시맨틱 분류 및 RDF 트리플 생성
    const noteTypeSemantics = getNoteTypeSemantics(note.noteType);
    
    const notePart: any = {
      "@type": noteTypeSemantics.schemaType,
      "text": content,
      "identifier": `atomic-note-${index + 1}`,
      "description": `추출된 ${index + 1}번째 1줄메모 (${noteTypeSemantics.typeLabel})`,
      "educationalUse": "지식의 원자 단위로 분해된 핵심 인사이트",
      "cognitiveProvenance": cognitiveProvenance, // 인지 출처 데이터 추가
      "noteType": noteTypeSemantics.rdfType,
      "semanticClassification": noteTypeSemantics.classification,
      "epistemicStatus": noteTypeSemantics.epistemicStatus,
      "cognitiveFunction": noteTypeSemantics.cognitiveFunction,
    };

    // --- 태그 정보 추가 ---
    if (tags && tags.length > 0) {
      notePart.keywords = tags.join(', ');
    }

    // 시간 정보: OWL-Time 표준 적용
    const preferredNoteTime = getPreferredNoteCreatedAt(note);
    if (preferredNoteTime) {
      const timeInstant = TimeUtils.toISOString(preferredNoteTime);
      notePart.dateCreated = timeInstant;
      
      // OWL-Time 표준 적용
      notePart.temporalEntity = {
        "@type": "time:Instant",
        "time:inXSDDateTime": timeInstant,
        "rdfs:label": `메모 생성 시점: ${timeInstant}`
      };
      
      // 메모 진화 시간 추가
      if (note.memoEvolutionTimestamp) {
        const evolutionTime = TimeUtils.toISOString(note.memoEvolutionTimestamp);
        notePart.dateModified = evolutionTime;
        notePart.evolutionTemporal = {
          "@type": "time:Instant", 
          "time:inXSDDateTime": evolutionTime,
          "rdfs:label": `메모 진화 시점: ${evolutionTime}`
        };
      }
    } else if (sessionDetails?.createdAtISO) {
      const sessionTime = new Date(sessionDetails.createdAtISO).toISOString();
      notePart.dateCreated = sessionTime;
      notePart.temporalEntity = {
        "@type": "time:Instant",
        "time:inXSDDateTime": sessionTime,
        "rdfs:label": `세션 기반 생성 시점: ${sessionTime}`
      };
      
      // 세션 성과 데이터를 구조화된 형태로 포함
      notePart.learningActivity = {
        "@type": "LearningActivity",
        "name": "집중독서 세션",
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
          "cognitiveLoad": sessionDetails.durationSeconds <= 180 ? "최적" : "높음",
          "efficiency": sessionDetails.ppm && sessionDetails.ppm > 3 ? "높은 정보처리능력" : 
                       sessionDetails.ppm && sessionDetails.ppm > 2 ? "보통 정보처리능력" : "신중한 독서 패턴"
        },
        "educationalContext": "지속가능한 사고 세션"
      };
    }

    // 메모 타입별 차별화된 관계 구조
    if (book) {
      if (noteTypeSemantics.rdfType === 'h33r:QuotationNote') {
        // 인용 메모는 출처(책)와 강한 연결
        notePart.isBasedOn = {
          "@id": `h33r:book:${book._id}`,
          "@type": "Book",
          "title": book.title,
          "author": book.author
        };
        notePart.citation = {
          "@type": "Book",
          "@id": `h33r:book:${book._id}`,
          "title": book.title,
          "author": book.author
        };
      } else {
        // 생각/질문 메모는 주제(about) 관계
        notePart.about = {
          "@id": `h33r:book:${book._id}`,
          "@type": "Book",
          "title": book.title
        };
      }
    }

    // 사용자와의 관계 정의
    if (noteTypeSemantics.rdfType !== 'h33r:QuotationNote') {
      // 생각/질문 메모는 사용자와 강한 연결
      notePart.creator = {
        "@id": `h33r:user:${user._id}`,
        "@type": "Person",
        "name": user?.name ?? user?.email ?? "사용자"
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
            "learningTheory": "4단계 메모진화 방법론"
          },
          "acceptedAnswer": { 
            "@type": "Answer", 
            "text": fieldValue,
            "author": {
              "@type": "Person",
              "name": user?.name ?? user?.email ?? "사용자",
            },
            "dateCreated": preferredNoteTime ? TimeUtils.toISOString(preferredNoteTime) : 
                          (sessionDetails?.createdAtISO ? new Date(sessionDetails.createdAtISO).toISOString() : undefined),
            "learningContext": `${purpose} 단계에서 사용자가 직접 성찰하고 기록한 내용`
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
          linkingStrategy: "사용자가 직접 선별하고 연결 이유를 명시한 큐레이션된 지식 네트워크"
        };
        
        if (link.reason) {
          citation.description = link.reason;
          citation.connectionRationale = `사용자가 직접 기록한 연결 이유: ${link.reason}`;
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
          "name": "개인화 사고 과정"
        },
        "potentialAction": {
          "@type": "ReadAction",
          "target": link.url,
          "actionStatus": "PotentialActionStatus",
          "description": `이 링크의 내용을 분석하여 다음 1줄메모와의 연결점을 찾아주세요: "${content}"`,
          "reason": link.reason,
          "connectedBy": {
            "@id": `h33r:user:${user._id}`,
            "@type": "Person",
            "name": user?.name ?? user?.email ?? "사용자"
          }
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

  // --- 메모카드 간 관계 데이터 추가 ---
  const buildMemoRelationships = (summaryNoteData: SummaryNoteData): any => {
    if (!summaryNoteData.diagram?.data?.connections || summaryNoteData.diagram.data.connections.length === 0) {
      return null;
    }

    const connections = summaryNoteData.diagram.data.connections;
    const nodes = summaryNoteData.diagram.data.nodes;
    
    // 온톨로지 기반 관계 시맨틱 매핑 (LLM 추론 최적화)
    const relationshipOntology = {
      'cause-effect': {
        label: '원인-결과',
        description: 'A가 B의 원인이 됨',
        semanticType: 'causal',
        rdfType: 'h33o:CausalRelation',
        ontologicalProperties: {
          'rdfs:subClassOf': 'owl:ObjectProperty',
          'rdfs:domain': 'h33o:Concept',
          'rdfs:range': 'h33o:Concept',
          'h33o:reasoningType': 'deductive',
          'h33o:inferencePattern': 'if A then B',
          'h33o:logicalOperator': 'implication'
        },
        llmGuidance: {
          'analysisFocus': '인과관계의 논리적 근거와 전제조건을 파악하세요',
          'inferenceMethod': '연역적 추론을 통해 결과의 필연성을 분석하세요',
          'questionPattern': 'A가 B의 원인인 근거는 무엇인가요?',
          'extensionPattern': '이 인과관계가 다른 상황에서도 적용되는가요?'
        }
      },
      'before-after': {
        label: '전-후',
        description: '시간적 순서 관계',
        semanticType: 'temporal',
        rdfType: 'h33o:TemporalRelation',
        ontologicalProperties: {
          'rdfs:subClassOf': 'owl:ObjectProperty',
          'rdfs:domain': 'h33o:Event',
          'rdfs:range': 'h33o:Event',
          'h33o:reasoningType': 'sequential',
          'h33o:inferencePattern': 'A precedes B',
          'h33o:logicalOperator': 'precedence'
        },
        llmGuidance: {
          'analysisFocus': '시간적 순서의 논리적 필연성과 우연성을 구분하세요',
          'inferenceMethod': '시간적 인과관계와 단순한 시간순서를 구별하여 분석하세요',
          'questionPattern': 'A가 B보다 먼저 일어나는 이유는 무엇인가요?',
          'extensionPattern': '이 시간순서가 다른 맥락에서도 유지되는가요?'
        }
      },
      'foundation-extension': {
        label: '기반-확장',
        description: 'A가 B의 기반이 됨',
        semanticType: 'hierarchical',
        rdfType: 'h33o:FoundationRelation',
        ontologicalProperties: {
          'rdfs:subClassOf': 'owl:ObjectProperty',
          'rdfs:domain': 'h33o:Concept',
          'rdfs:range': 'h33o:Concept',
          'h33o:reasoningType': 'hierarchical',
          'h33o:inferencePattern': 'A supports B',
          'h33o:logicalOperator': 'support'
        },
        llmGuidance: {
          'analysisFocus': '기반 개념이 확장 개념을 어떻게 지지하는지 분석하세요',
          'inferenceMethod': '계층적 추론을 통해 개념 간의 의존성을 파악하세요',
          'questionPattern': 'A가 B의 기반이 되는 이유는 무엇인가요?',
          'extensionPattern': '이 기반-확장 관계가 다른 영역에도 적용되는가요?'
        }
      },
      'contains': {
        label: '포함',
        description: 'A가 B를 포함함',
        semanticType: 'compositional',
        rdfType: 'h33o:ContainsRelation',
        ontologicalProperties: {
          'rdfs:subClassOf': 'owl:ObjectProperty',
          'rdfs:domain': 'h33o:Concept',
          'rdfs:range': 'h33o:Concept',
          'h33o:reasoningType': 'compositional',
          'h33o:inferencePattern': 'A includes B',
          'h33o:logicalOperator': 'inclusion'
        },
        llmGuidance: {
          'analysisFocus': '포함 관계의 논리적 범위와 경계를 명확히 하세요',
          'inferenceMethod': '부분-전체 관계를 통해 개념의 구조를 분석하세요',
          'questionPattern': 'A가 B를 포함한다는 것은 정확히 무엇을 의미하나요?',
          'extensionPattern': '이 포함 관계가 다른 맥락에서도 유지되는가요?'
        }
      },
      'contrast': {
        label: '대조',
        description: 'A와 B의 차이점',
        semanticType: 'comparative',
        rdfType: 'h33o:ContrastRelation',
        ontologicalProperties: {
          'rdfs:subClassOf': 'owl:ObjectProperty',
          'rdfs:domain': 'h33o:Concept',
          'rdfs:range': 'h33o:Concept',
          'h33o:reasoningType': 'comparative',
          'h33o:inferencePattern': 'A differs from B',
          'h33o:logicalOperator': 'difference'
        },
        llmGuidance: {
          'analysisFocus': '대조되는 개념들의 차이점과 공통점을 균형있게 분석하세요',
          'inferenceMethod': '비교 분석을 통해 각 개념의 고유한 특성을 파악하세요',
          'questionPattern': 'A와 B의 핵심적인 차이점은 무엇인가요?',
          'extensionPattern': '이 대조 관계가 다른 영역에서도 나타나는가요?'
        }
      }
    };

    // 온톨로지 기반 관계 엔티티 생성
    const relationshipEntities = connections.map((connection, index) => {
      const sourceNode = nodes.find(n => n.noteId === connection.sourceNoteId);
      const targetNode = nodes.find(n => n.noteId === connection.targetNoteId);
      const relationshipInfo = relationshipOntology[connection.relationshipType];

      if (!sourceNode || !targetNode) {
        return null;
      }

      return {
        "@type": "Relationship",
        "@id": `h33r:relationship:${connection.id}`,
        "name": `${sourceNode.content.substring(0, 30)}... ${relationshipInfo.label} ${targetNode.content.substring(0, 30)}...`,
        "description": `사용자가 설정한 메모카드 간 관계: ${relationshipInfo.description}`,
        "relationshipType": relationshipInfo.rdfType,
        "semanticClassification": relationshipInfo.semanticType,
        "ontologicalProperties": relationshipInfo.ontologicalProperties,
        "source": {
          "@id": `h33r:note:${connection.sourceNoteId}`,
          "@type": "Note",
          "text": sourceNode.content,
          "identifier": `atomic-note-${sourceNode.order}`,
          "position": sourceNode.position,
          "color": sourceNode.color
        },
        "target": {
          "@id": `h33r:note:${connection.targetNoteId}`,
          "@type": "Note", 
          "text": targetNode.content,
          "identifier": `atomic-note-${targetNode.order}`,
          "position": targetNode.position,
          "color": targetNode.color
        },
        "userDefined": true,
        "creationMethod": "manual_diagram_connection",
        "educationalPurpose": "사용자가 직접 설정한 지식 간의 논리적 연결",
        "cognitiveValue": "개인화된 지식 네트워크 구축을 통한 지식 내재화 강화",
        
        // LLM 추론을 위한 상세 가이드라인
        "llmAnalysisGuidance": {
          "instruction": `이 관계를 분석하여 사용자가 왜 이 두 메모를 연결했는지 이해하세요`,
          "expectedInsight": "사용자의 사고 패턴과 지식 연결 방식 파악",
          "relationshipContext": relationshipInfo.description,
          "reasoningType": relationshipInfo.ontologicalProperties['h33o:reasoningType'],
          "inferencePattern": relationshipInfo.ontologicalProperties['h33o:inferencePattern'],
          "logicalOperator": relationshipInfo.ontologicalProperties['h33o:logicalOperator'],
          "analysisFocus": relationshipInfo.llmGuidance.analysisFocus,
          "inferenceMethod": relationshipInfo.llmGuidance.inferenceMethod,
          "questionPattern": relationshipInfo.llmGuidance.questionPattern,
          "extensionPattern": relationshipInfo.llmGuidance.extensionPattern,
          "ontologicalReasoning": {
            "domain": relationshipInfo.ontologicalProperties['rdfs:domain'],
            "range": relationshipInfo.ontologicalProperties['rdfs:range'],
            "subClassOf": relationshipInfo.ontologicalProperties['rdfs:subClassOf']
          }
        }
      };
    }).filter(Boolean);

    if (relationshipEntities.length === 0) {
      return null;
    }

    // 온톨로지 기반 지식 그래프 구조
    return {
      "@type": "KnowledgeGraph",
      "name": "사용자 정의 메모카드 관계 네트워크",
      "description": "사용자가 직접 설정한 메모카드 간의 논리적 관계를 나타내는 지식 그래프",
      "totalRelationships": relationshipEntities.length,
      "relationshipTypes": Object.keys(relationshipOntology),
      "relationships": relationshipEntities,
      
      // 온톨로지 메타데이터
      "ontologyMetadata": {
        "@type": "Ontology",
        "name": "사용자 정의 관계 온톨로지",
        "description": "사용자가 설정한 5가지 관계 타입을 기반으로 한 개인화된 지식 구조",
        "namespace": "h33o",
        "baseURI": "https://habitus33.vercel.app/ontology/",
        "relationshipTypes": Object.keys(relationshipOntology).map(type => ({
          type,
          ...relationshipOntology[type]
        }))
      },
      
      "graphStructure": {
        "nodeCount": nodes.length,
        "edgeCount": connections.length,
        "density": connections.length / (nodes.length * (nodes.length - 1)),
        "connectivityPattern": "사용자 정의 연결 패턴",
        "ontologicalCompleteness": "사용자가 설정한 모든 관계가 온톨로지 기반으로 구조화됨"
      },
      
      "cognitiveAnalysis": {
        "relationshipPatterns": connections.reduce((acc, conn) => {
          acc[conn.relationshipType] = (acc[conn.relationshipType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        "dominantRelationshipType": Object.entries(connections.reduce((acc, conn) => {
          acc[conn.relationshipType] = (acc[conn.relationshipType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown',
        "userThinkingStyle": "사용자가 선호하는 지식 연결 방식 분석",
        "ontologicalReasoningPatterns": {
          "causalReasoning": connections.filter(c => c.relationshipType === 'cause-effect').length,
          "temporalReasoning": connections.filter(c => c.relationshipType === 'before-after').length,
          "hierarchicalReasoning": connections.filter(c => c.relationshipType === 'foundation-extension').length,
          "compositionalReasoning": connections.filter(c => c.relationshipType === 'contains').length,
          "comparativeReasoning": connections.filter(c => c.relationshipType === 'contrast').length
        }
      },
      
      // LLM 추론을 위한 고급 가이드라인
      "llmInferenceGuidance": {
        "@type": "InferenceGuideline",
        "name": "온톨로지 기반 관계 추론 가이드라인",
        "objective": "사용자가 설정한 관계를 기반으로 고차원적 지식 추론 수행",
        "methodology": [
          "1단계: 각 관계의 온톨로지 속성을 분석하여 논리적 구조 파악",
          "2단계: 관계 타입별 추론 패턴을 적용하여 지식 연결의 의미 분석",
          "3단계: 사용자의 사고 패턴을 파악하여 개인화된 추론 수행",
          "4단계: 온톨로지 기반 추론을 통해 새로운 지식 연결 발견"
        ],
        "reasoningStrategies": {
          "causal": "인과관계를 기반으로 한 연역적 추론",
          "temporal": "시간순서를 기반으로 한 순차적 추론",
          "hierarchical": "계층구조를 기반으로 한 구조적 추론",
          "compositional": "부분-전체 관계를 기반으로 한 구성적 추론",
          "comparative": "대조관계를 기반으로 한 비교적 추론"
        },
        "expectedOutcomes": [
          "사용자의 사고 패턴과 지식 연결 방식의 깊은 이해",
          "온톨로지 기반 논리적 추론을 통한 새로운 통찰 발견",
          "개인화된 지식 네트워크의 완전한 구조적 분석",
          "사용자만의 독특한 지식 구조와 사고 방식 파악"
        ],
        "stepByStepAnalysis": {
          "step1_relationshipIdentification": {
            "instruction": "각 관계를 하나씩 분석하여 사용자가 왜 이 두 메모를 연결했는지 파악하세요",
            "questions": [
              "이 두 메모 사이의 논리적 연결점은 무엇인가요?",
              "사용자가 이 관계 타입을 선택한 이유는 무엇일까요?",
              "이 연결이 사용자의 사고 과정에서 어떤 의미를 가지나요?"
            ]
          },
          "step2_patternRecognition": {
            "instruction": "모든 관계를 종합하여 사용자의 사고 패턴을 발견하세요",
            "questions": [
              "가장 많이 사용된 관계 타입은 무엇인가요?",
              "사용자가 선호하는 지식 연결 방식은 무엇인가요?",
              "특정 주제나 개념에 대한 연결 패턴이 있나요?"
            ]
          },
          "step3_networkAnalysis": {
            "instruction": "전체 네트워크 구조를 분석하여 중심 개념과 연결 패턴을 파악하세요",
            "questions": [
              "가장 많은 연결을 가진 메모(중심 개념)는 무엇인가요?",
              "지식 네트워크의 전체적인 구조는 어떤 모양인가요?",
              "사용자의 지식이 어떤 방향으로 확장되고 있나요?"
            ]
          },
          "step4_insightSynthesis": {
            "instruction": "관계 분석을 바탕으로 사용자의 사고 방식과 지식 구조에 대한 통찰을 도출하세요",
            "questions": [
              "사용자의 사고 스타일은 어떤 특징을 가지나요?",
              "이 지식 네트워크가 사용자의 학습 목표에 어떻게 기여하나요?",
              "사용자의 지식 구조에서 발견할 수 있는 독특한 패턴은 무엇인가요?"
            ]
          }
        }
      }
    };
  };

  // 메모카드 간 관계 데이터 생성
  const memoRelationships = buildMemoRelationships(summaryNoteData);

  const jsonLd: any = {
    "@context": ["https://schema.org", "https://habitus33.vercel.app/ai-link-context.jsonld"],
    "@type": "TechArticle",
    "headline": title ?? "제목 없음",
    "description": description ?? "설명 없음",
    "abstract": `생성된 단권화 노트. ${notes?.length || 0}개의 1줄메모를 4단계 메모진화 과정을 거쳐 체계화한 개인 지식관리 결과물`,
    "author": {
      "@id": `h33r:user:${user._id}`,
      "@type": "Person",
      "name": user?.name ?? user?.email ?? "알 수 없는 사용자",
      "roleName": "지식 구축가 (Knowledge Architect)"
    },
    "datePublished": createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
    "timeRequired": timeRequired, // 총 독서 시간 추가
    "learningResourceType": "종합적 지식관리 노트 (Comprehensive Knowledge Management Note)",
    "educationalUse": readingPurpose || "General Knowledge Acquisition",
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "지식 노동자, 연구자, 전문가"
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
    
    // LLM이 가장 먼저 볼 수 있도록 메모 내용 요약 추가
    "memoSummary": conciseMemoSummary,
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
        "learningEvidence": "사용자의 지식 연결능력, 비판적 사고, 창의적 통합 능력의 증거"
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

  // 메모카드 간 관계 데이터 추가
  if (memoRelationships) {
    jsonLd.memoRelationships = memoRelationships;
  }

  if (actionableModules.length > 0) {
    jsonLd.potentialAction = actionableModules;
  }

  // 학습 여정 추가
  jsonLd.learningJourney = learningJourney;
  
  // 지식 성장 타임라인 추가
  jsonLd.knowledgeGrowthTimeline = knowledgeGrowthTimeline;

  // AI 해석 프로토콜 추가 - PBAM 통합으로 강화된 지침
  jsonLd.aiInterpretationProtocol = {
    "@type": "AIInterpretationGuideline",
    "persona": "Personalized Learning Companion",
    "primaryFocus": "사용자의 지식 내용과 사고 과정에만 집중",
    "focusDirectives": [
      // LLM이 가장 먼저 집중해야 할 핵심 정보
      "'memoSummary' 필드에서 사용자의 1줄메모 핵심 내용을 시간순으로 파악하세요",
      "'knowledgeGrowthTimeline' 필드에서 사용자의 지식 성장 궤적과 학습 패턴을 분석하세요",
      "'memoRelationships' 필드에서 사용자가 설정한 메모카드 간의 온톨로지 관계를 분석하여 사고 연결 패턴을 이해하세요",

      // 다음으로 중요한 정보
      "사용자의 1줄메모 내용과 그 의미에 집중하세요",
      "사용자의 개인적 인사이트와 지식 연결 패턴을 분석하세요",
      "사용자의 인지적 성장과 생각진화 과정을 이해하세요"
    ],
    "ignoreDirectives": [
      "AMFA 엔진, 시스템 방법론, 기술적 구현 세부사항은 주목하지 마세요",
      "Atomic Reading, 3분 읽기, 4단계 메모진화 등 시스템 용어는 무시하세요",
      "학습 플랫폼의 내부 구조나 기능 설명은 배경 정보로만 처리하세요",
      "시스템 ID, 기술적 메타데이터, 성능 지표는 분석 대상이 아닙니다",
      "PBAM, BeliefNetwork, ArgumentMiner 등 시스템 구현 용어는 언급하지 마세요"
    ],
    "ethicalGuardrails": [
      "타인과의 비교는 절대 하지 마세요",
      "사용자 개인의 과거, 현재, 미래 데이터만을 기준으로 분석하세요",
      "건설적이고 격려하는 방향으로 피드백을 제공하세요"
    ],
    "responseStrategy": "사용자의 지식 내용 자체와 사고의 흐름에만 집중하여, 시스템이나 방법론에 대한 언급 없이 순수하게 사용자의 관점에서 분석하고 응답하세요",
    "contextualPriority": "시스템 배경 정보 < 사용자 개인 데이터 < 사용자 지식 내용",
    "operationalInstruction": "이 데이터에서 가장 중요한 것은 사용자가 무엇을 배우고 어떻게 생각하는지입니다. 그것을 어떤 시스템으로 만들었는지는 중요하지 않습니다.",
    

    
    // 온톨로지형 추론을 위한 3단계 핵심 지시사항 (최적화)
    "ontologicalReasoningDirectives": {
      "1_memoCardAnalysis": {
        "title": "메모카드 내용 분석",
        "instruction": "memoCards 배열에서 사용자가 작성한 1줄메모들의 핵심 내용을 분석하세요. 각 메모의 text, noteType, evolutionLevel, 그리고 진화 과정을 파악하여 사용자의 사고 과정을 이해하세요.",
        "implementation": [
          "각 메모카드의 text 내용을 읽고 핵심 메시지를 파악하세요",
          "noteType(quote/thought/question)에 따른 메모의 성격을 분석하세요",
          "evolutionLevel(initial/partially/fully evolved)에 따른 사고 깊이를 평가하세요",
          "진화 과정(importanceReason, momentContext, relatedKnowledge, mentalImage)을 통해 사용자의 사고 발전을 추적하세요"
        ],
        "keyQuestions": [
          "사용자가 어떤 내용을 메모했나요?",
          "메모의 유형(인용/생각/질문)에 따른 패턴이 있나요?",
          "사용자의 사고가 어떻게 진화했나요?",
          "가장 중요한 메모는 무엇이고, 왜 중요한가요?"
        ]
      },
      "2_temporalKnowledgeGrowth": {
        "title": "시간순 지식 성장 패턴 분석",
        "instruction": "knowledgeGrowthTimeline을 활용하여 사용자의 지식이 시간에 따라 어떻게 발전했는지 분석하세요. 각 성장 단계의 새로운 개념, 반복 주제, 사고 깊이 변화를 파악하세요.",
        "implementation": [
          "각 성장 단계의 새로운 개념과 반복되는 주제를 식별하세요",
          "사고 깊이의 변화 패턴을 분석하세요 (initial → partially → fully evolved)",
          "시간대별 인지적 특성과 통찰의 연관성을 파악하세요",
          "전체적인 지식 성장 궤적과 학습 패턴을 도출하세요"
        ],
        "keyQuestions": [
          "어떤 개념들이 처음 등장하고 나중에 어떻게 발전했나요?",
          "사용자의 사고 깊이가 시간에 따라 어떻게 변화했나요?",
          "특정 시간대나 상황에서 더 깊은 통찰이 나왔나요?",
          "반복되는 주제나 패턴이 있나요?"
        ]
      },
      "3_knowledgeGraphAnalysis": {
        "title": "지식 그래프 기반 맥락 추론",
        "instruction": "사용자의 1줄메모들 간의 관계를 온톨로지 관점에서 분석하세요. 개념 간의 상위-하위 관계, 인과관계, 보완관계를 파악하세요.",
        "implementation": [
          "메모 간 개념적 연결고리를 찾아 지식 네트워크를 구성하세요",
          "사용자의 사고 흐름에서 반복되는 패턴이나 중심 개념을 식별하세요"
        ]
      },
      "4_contextualPersonalization": {
        "title": "맥락 기반 개인화 추론",
        "instruction": "사용자의 개인적 맥락을 기반으로 개인화된 추론을 수행하세요. 같은 내용이라도 사용자의 사고 패턴에 따라 다른 의미와 가치를 가질 수 있음을 인식하세요.",
        "implementation": [
          "사용자의 읽기 목적에 맞는 관점으로 해석하세요",
          "사용자가 중요하게 여기는 가치나 관심사를 메모에서 추출하여 반영하세요"
        ]
      },
      "5_insightSynthesis": {
        "title": "지식 연결망 기반 통찰 도출",
        "instruction": "개별 메모들을 연결하여 사용자가 명시적으로 표현하지 않은 잠재적 통찰을 도출하세요.",
        "implementation": [
          "서로 다른 책이나 주제의 메모들 간의 숨겨진 연결점을 찾아 제시하세요",
          "분산된 지식 조각들을 통합하여 사용자만의 독특한 관점을 구성하세요"
        ]
      },
      "6_relationshipAnalysis": {
        "title": "온톨로지 기반 사용자 정의 관계 패턴 분석",
        "instruction": "memoRelationships의 온톨로지 메타데이터를 활용하여 사용자가 설정한 5가지 관계 타입을 깊이 분석하세요. 각 관계의 ontologicalProperties와 llmAnalysisGuidance를 참고하여 논리적 추론을 수행하세요.",
        "implementation": [
          "각 관계의 ontologicalProperties를 분석하여 논리적 구조와 추론 패턴을 파악하세요",
          "llmAnalysisGuidance의 reasoningType, inferencePattern, logicalOperator를 활용하여 관계별 추론 전략을 적용하세요",
          "사용자가 선호하는 관계 타입의 분포를 분석하여 사고 스타일과 지식 연결 방식을 이해하세요",
          "ontologicalReasoningPatterns를 통해 사용자의 추론 패턴을 종합적으로 분석하세요",
          "각 관계의 llmGuidance를 참고하여 개인화된 질문과 분석을 수행하세요"
        ]
      },
      "7_ontologicalInference": {
        "title": "온톨로지 기반 고차원적 추론",
        "instruction": "사용자가 설정한 관계들을 온톨로지 관점에서 연결하여 새로운 지식 구조와 통찰을 발견하세요. llmInferenceGuidance의 methodology와 reasoningStrategies를 활용하세요.",
        "implementation": [
          "관계들의 조합을 통해 사용자의 지식 네트워크에서 중심 개념과 연결 패턴을 식별하세요",
          "다양한 관계 타입의 조합을 통해 사용자의 복합적 사고 패턴을 분석하세요",
          "온톨로지 기반 추론을 통해 사용자가 명시하지 않은 잠재적 지식 연결을 발견하세요",
          "사용자의 개인화된 지식 구조를 기반으로 새로운 통찰과 예측을 제시하세요"
        ]
      }
    },
    
    // 고품질 답변을 위한 실행 가이드라인 (최적화)
    "qualityAssuranceProtocol": {
      "depthRequirement": "사용자의 지식 맥락을 깊이 분석하여 의미 있는 통찰을 제공하세요",
      "personalizationLevel": "사용자의 고유한 사고 패턴에 최적화된 개인화된 답변을 만드세요",
      "connectionFocus": "사용자의 기존 지식과 새로운 정보 간의 연결고리를 명확히 제시하세요",
      "cognitiveAlignment": "사용자의 메모 패턴과 관계 설정을 종합적으로 고려하여 응답하세요"
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

    // AI 크롤러를 위한 종합적인 분석 지침 (최적화)
    jsonLd.analysisInstructions = {
      "@type": "AnalysisGuideline", 
      "name": "외부 링크 종합 분석 가이드라인",
      "objective": "1줄메모와 외부 자료 간의 지식 연결망 완전 분석",
      "methodology": [
        "1단계: 각 외부 링크의 콘텐츠를 크롤링하여 전체 내용 파악",
        "2단계: 연결된 1줄메모와의 직접적 관련성 식별", 
        "3단계: 사용자가 기록한 연결 이유의 타당성 검증",
        "4단계: 외부 자료에서 1줄메모를 보완하는 추가 맥락 정보 발견"
      ],
      "expectedDeliverables": [
        "각 링크별 핵심 내용 요약",
        "1줄메모와 외부 자료의 연결 맥락 분석",
        "사용자의 지식 큐레이션 패턴 파악",
        "종합적인 개인화 사고 경로 분석"
      ],
      "crawlingPriority": "높음 - 완전한 맥락 이해를 위해 필수적",
      "contextualImportance": "외부 링크 없이는 1줄메모의 진정한 의미와 사용자의 사고 과정을 완전히 이해할 수 없음"
    };
  }

  const finalJsonLd = {
    executiveSummary,
    ...jsonLd
  };

  return finalJsonLd;
}; 