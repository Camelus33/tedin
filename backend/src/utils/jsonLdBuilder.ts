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
// These interfaces should ideally be imported from a central type definition file.
// We define them here based on available information for clarity.

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


/**
 * @function buildJsonLd
 * @description Takes aggregated summary note data and builds a JSON-LD object for SEO and AI crawlers.
 * @param {SummaryNoteData} summaryNoteData - The complete data of the summary note.
 * @returns {object} A JSON-LD object following schema.org standards.
 */
export const buildJsonLd = (summaryNoteData: SummaryNoteData): object => {
  const { title, description, userMarkdownContent, createdAt, user, notes, readingPurpose } = summaryNoteData;

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
    } = note;

    const notePart: any = {
      "@type": "NoteDigitalDocument",
      "text": content,
      "identifier": `atomic-note-${index + 1}`,
      "description": `하비투스33 Atomic Reading 방법론으로 추출된 ${index + 1}번째 1줄메모`,
      "educationalUse": "지식의 원자 단위로 분해된 핵심 인사이트",
    };

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

    // 관련 링크: 지식 네트워크 확장을 위한 맥락적 연결
    if (relatedLinks && relatedLinks.length > 0) {
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
    "educationalFramework": methodologyContext,
    "learningResourceType": "종합적 지식관리 노트 (Comprehensive Knowledge Management Note)",
    "educationalUse": [
      "개인화된 학습 패턴 분석",
      "지식 네트워크 시각화", 
      "학습 효율성 최적화",
      "장기기억 전환 지원",
      "메타인지 능력 향상"
    ],
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "학습자, 연구자, 지식 관리 전문가"
    },
    "genre": "지식관리, 학습분석, 개인화 교육"
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

  return jsonLd;
}; 