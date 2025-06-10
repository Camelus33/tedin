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
  const { title, description, createdAt, user, notes, readingPurpose } = summaryNoteData;

  const hasPart = notes?.map(note => {
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
    };

    if (sessionDetails?.createdAtISO) {
      notePart.dateCreated = new Date(sessionDetails.createdAtISO).toISOString();
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

    // Memo Evolution as Question/Answer pairs
    const mainEntity = [];
    if (importanceReason) {
      mainEntity.push({
        "@type": "Question",
        "name": getMemoEvolutionQuestion('importanceReason', readingPurpose),
        "acceptedAnswer": { "@type": "Answer", "text": importanceReason }
      });
    }
    if (momentContext) {
      mainEntity.push({
        "@type": "Question",
        "name": getMemoEvolutionQuestion('momentContext', readingPurpose),
        "acceptedAnswer": { "@type": "Answer", "text": momentContext }
      });
    }
    if (relatedKnowledge) {
      mainEntity.push({
        "@type": "Question",
        "name": getMemoEvolutionQuestion('relatedKnowledge', readingPurpose),
        "acceptedAnswer": { "@type": "Answer", "text": relatedKnowledge }
      });
    }
    if (mentalImage) {
      mainEntity.push({
        "@type": "Question",
        "name": getMemoEvolutionQuestion('mentalImage', readingPurpose),
        "acceptedAnswer": { "@type": "Answer", "text": mentalImage }
      });
    }

    if (mainEntity.length > 0) {
      notePart.mainEntity = mainEntity;
    }

    // Related Links as Citations
    if (relatedLinks && relatedLinks.length > 0) {
      notePart.citation = relatedLinks.map((link: RelatedLink) => {
        const citation: any = { url: link.url };
        if (link.reason) {
          citation.description = link.reason;
        }

        switch (link.type) {
          case 'youtube': citation['@type'] = 'VideoObject'; break;
          case 'book': citation['@type'] = 'Book'; break;
          case 'paper': case 'media': citation['@type'] = 'Article'; break;
          case 'website': default: citation['@type'] = 'WebPage'; break;
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
    "author": {
      "@type": "Person",
      "name": user?.name ?? user?.email ?? "알 수 없는 사용자",
    },
    "datePublished": createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
  };

  if (hasPart.length > 0) {
    jsonLd.hasPart = hasPart;
  }

  return jsonLd;
}; 