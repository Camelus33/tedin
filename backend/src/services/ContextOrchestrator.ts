import { IUser } from '../models/User';
import { INote } from '../models/Note';

// 나중에 실제 온톨로지 기반 쿼리 결과로 대체될 인터페이스
interface RawGraphResult {
  notes: INote[];
  // 추가적인 그래프 데이터...
}

// AI에 전달될 최종 컨텍스트 묶음의 구조
export interface ContextBundle {
  targetConcept: string;
  relevantNotes: Pick<INote, 'content' | 'tags'>[];
  // 책에서 발췌한 내용, 관련 개념 등 추가될 수 있음
  bookExcerpts?: string[];
  relatedConcepts?: string[];
}

/**
 * ContextOrchestrator
 * 사용자의 목표에 맞춰 지식 그래프에서 최적의 컨텍스트를 조합하는 서비스
 */
export class ContextOrchestrator {
  private user: IUser;

  constructor(user: IUser) {
    this.user = user;
  }

  /**
   * 지식 그래프에서 컨텍스트를 조회 (현재는 Mock 구현)
   * @param targetConcept - 목표 개념
   * @returns SPARQL 쿼리 결과 (가상)
   */
  private async queryGraph(targetConcept: string): Promise<RawGraphResult> {
    // TODO: 여기에 실제 GraphDB(e.g., Stardog, Neo4j)에
    // SPARQL 쿼리를 실행하는 로직이 들어갑니다.
    // 예시: `SELECT ?note WHERE { ?note :hasConcept "${targetConcept}" ... }`

    console.log(`[ContextOrchestrator] Simulating graph query for user ${this.user.id} and concept "${targetConcept}"`);

    // --- Mock 데이터 생성 ---
    const mockNotes: INote[] = [
      { content: `${targetConcept}의 정의는 다음과 같습니다...`, tags: [targetConcept, 'definition'] },
      { content: `${targetConcept}은 실제 사례에서 이렇게 사용됩니다...`, tags: [targetConcept, 'example'] },
      { content: `반면, ${targetConcept}과 유사한 X개념은...`, tags: [targetConcept, 'comparison'] },
    ] as INote[];

    return Promise.resolve({ notes: mockNotes });
  }

  /**
   * 조회된 그래프 데이터를 AI에 적합한 ContextBundle로 가공
   * @param rawData - 그래프 조회 결과
   * @returns ContextBundle
   */
  private buildBundle(targetConcept: string, rawData: RawGraphResult): ContextBundle {
    const relevantNotes = rawData.notes.map(note => ({
      content: note.content,
      tags: note.tags,
    }));

    // TODO: 토큰 제한, 관련도 순 정렬 등 고도화 로직 추가
    return {
      targetConcept,
      relevantNotes,
    };
  }

  /**
   * 특정 목표 개념에 대한 컨텍스트 묶음을 가져옵니다.
   * @param targetConcept - 목표 개념 (예: "머신러닝")
   * @returns ContextBundle
   */
  public async getContextBundle(targetConcept: string): Promise<ContextBundle> {
    const rawData = await this.queryGraph(targetConcept);
    const contextBundle = this.buildBundle(targetConcept, rawData);
    return contextBundle;
  }
} 