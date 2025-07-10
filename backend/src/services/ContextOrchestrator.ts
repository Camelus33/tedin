import { IUser } from '../models/User';
import { INote } from '../models/Note';
import { getGraphClient } from '../lib/graphClient';

// 실제 그래프 쿼리 결과 인터페이스
interface GraphQueryResult {
  uri: string;
  type: 'note' | 'book';
  content: string;
  tags: string[];
  title?: string; // for books
  author?: string; // for books
  pageNumber?: number; // for notes
  createdAt?: string; // for notes
  relevanceScore?: number; // 관련도 점수
}

interface RawGraphResult {
  notes: GraphQueryResult[];
  books: GraphQueryResult[];
  totalResults: number;
}

// AI에 전달될 최종 컨텍스트 묶음의 구조
export interface ContextBundle {
  targetConcept: string;
  relevantNotes: (Pick<INote, 'content' | 'tags'> & { relevanceScore?: number })[];
  // 책에서 발췌한 내용, 관련 개념 등 추가될 수 있음
  bookExcerpts?: string[];
  relatedConcepts?: string[];
  queryMetadata?: {
    executionTime: number;
    resultCount: number;
    queryType: string;
  };
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
   * 지식 그래프에서 컨텍스트를 조회 (실제 SPARQL 쿼리 구현)
   * @param targetConcept - 목표 개념
   * @returns SPARQL 쿼리 결과
   */
  private async queryGraph(targetConcept: string): Promise<RawGraphResult> {
    const startTime = Date.now();
    const client = getGraphClient();
    
    try {
      // SPARQL 쿼리 생성: 노트와 책에서 목표 개념과 관련된 내용 검색
      const sparqlQuery = this.generateSparqlQuery(targetConcept);
      
      console.log(`[ContextOrchestrator] Executing SPARQL query for concept "${targetConcept}"`);
      console.log('Query:', sparqlQuery);
      
      // SPARQL 쿼리 실행
      const stream = await client.query.select(sparqlQuery);
      const results: any[] = [];
      
      return new Promise<RawGraphResult>((resolve, reject) => {
        stream.on('data', (row: any) => {
          results.push(row);
        });
        
        stream.on('end', () => {
          const processedResults = this.processQueryResults(results, targetConcept);
          const executionTime = Date.now() - startTime;
          
          console.log(`[ContextOrchestrator] Query completed in ${executionTime}ms, found ${processedResults.totalResults} results`);
          
          resolve({
            ...processedResults,
            totalResults: processedResults.notes.length + processedResults.books.length
          });
        });
        
        stream.on('error', (error: any) => {
          console.error('[ContextOrchestrator] SPARQL query failed:', error);
          reject(new Error(`SPARQL query execution failed: ${error.message}`));
        });
      });
      
    } catch (error: any) {
      console.error('[ContextOrchestrator] Graph query error:', error);
      // 폴백: 빈 결과 반환
      return {
        notes: [],
        books: [],
        totalResults: 0
      };
    }
  }

  /**
   * 목표 개념에 대한 SPARQL 쿼리 생성
   * @param targetConcept - 검색할 개념
   * @returns SPARQL SELECT 쿼리 문자열
   */
  private generateSparqlQuery(targetConcept: string): string {
    // SPARQL에서 특수 문자 이스케이핑
    const escapedConcept = this.escapeSparqlString(targetConcept);
    
    return `
      PREFIX habitus: <https://w3id.org/habitus33/resource/>
      PREFIX core-k-unit: <https://w3id.org/habitus33/ontology/core/k-unit#>
      PREFIX core-k-resource: <https://w3id.org/habitus33/ontology/core/k-resource#>
      PREFIX dcterms: <http://purl.org/dc/terms/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      
      SELECT ?uri ?type ?content ?tag ?title ?author ?pageNumber ?createdAt
      WHERE {
        {
          # 노트 검색
          ?uri rdf:type core-k-unit:Note ;
               core-k-unit:text ?content .
          OPTIONAL { ?uri skos:subject ?tag }
          OPTIONAL { ?uri dcterms:created ?createdAt }
          OPTIONAL { ?uri <https://w3id.org/habitus33/ontology/app#pageNumber> ?pageNumber }
          BIND("note" AS ?type)
          
          # 내용 또는 태그에서 개념 검색 (대소문자 무시)
          FILTER(
            CONTAINS(LCASE(?content), "${escapedConcept}") ||
            EXISTS { ?uri skos:subject ?tagMatch . FILTER(CONTAINS(LCASE(?tagMatch), "${escapedConcept}")) }
          )
        }
        UNION
        {
          # 책 검색
          ?uri rdf:type core-k-resource:Book ;
               dcterms:title ?title .
          OPTIONAL { ?uri dcterms:creator ?author }
          OPTIONAL { ?uri skos:subject ?tag }
          BIND(?title AS ?content)
          BIND("book" AS ?type)
          
          # 제목, 작가, 또는 태그에서 개념 검색 (대소문자 무시)
          FILTER(
            CONTAINS(LCASE(?title), "${escapedConcept}") ||
            (BOUND(?author) && CONTAINS(LCASE(?author), "${escapedConcept}")) ||
            EXISTS { ?uri skos:subject ?tagMatch . FILTER(CONTAINS(LCASE(?tagMatch), "${escapedConcept}")) }
          )
        }
      }
      ORDER BY ?type ?uri
      LIMIT 50
    `;
  }

  /**
   * SPARQL 문자열에서 특수 문자 이스케이핑
   * @param str - 이스케이핑할 문자열
   * @returns 이스케이핑된 문자열
   */
  private escapeSparqlString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')  // 백슬래시 이스케이핑
      .replace(/"/g, '\\"')    // 따옴표 이스케이핑
      .replace(/'/g, "\\'")    // 단일 따옴표 이스케이핑
      .replace(/\n/g, '\\n')   // 개행 문자 이스케이핑
      .replace(/\r/g, '\\r')   // 캐리지 리턴 이스케이핑
      .replace(/\t/g, '\\t');  // 탭 문자 이스케이핑
  }

  /**
   * SPARQL 쿼리 결과를 구조화된 데이터로 변환
   * @param rawResults - sparql-http-client에서 반환된 결과
   * @returns 구조화된 GraphQueryResult 배열
   */
  private processQueryResults(rawResults: any[], targetConcept: string): { notes: GraphQueryResult[], books: GraphQueryResult[], totalResults: number } {
    const notes: GraphQueryResult[] = [];
    const books: GraphQueryResult[] = [];
    const seenUris = new Set<string>(); // 중복 제거용
    
    for (const row of rawResults) {
      const uri = row.uri?.value;
      const type = row.type?.value;
      
      if (!uri || !type || seenUris.has(uri)) continue;
      seenUris.add(uri);
      
      const baseResult: GraphQueryResult = {
        uri,
        type: type as 'note' | 'book',
        content: row.content?.value || '',
        tags: [], // 태그는 별도로 수집해야 함
      };
      
      if (type === 'note') {
        notes.push({
          ...baseResult,
          pageNumber: row.pageNumber?.value ? parseInt(row.pageNumber.value, 10) : undefined,
          createdAt: row.createdAt?.value,
        });
      } else if (type === 'book') {
        books.push({
          ...baseResult,
          title: row.title?.value,
          author: row.author?.value,
        });
      }
    }
    
    // 각 결과에 대해 태그 수집 (현재는 단순화)
    this.collectTagsForResults(notes, rawResults);
    this.collectTagsForResults(books, rawResults);

    // 관련도 점수 계산 및 정렬
    this.calculateRelevanceScores(notes, targetConcept);
    this.calculateRelevanceScores(books, targetConcept);
    this.sortResultsByRelevance(notes);
    this.sortResultsByRelevance(books);

    return { notes, books, totalResults: notes.length + books.length };
  }
  
  /**
   * 결과에 태그 정보 추가
   * @param results - 결과 배열
   * @param rawResults - 원본 SPARQL 결과
   */
  private collectTagsForResults(results: GraphQueryResult[], rawResults: any[]): void {
    const tagsByUri = new Map<string, Set<string>>();
    
    // 원본 결과에서 태그 수집
    for (const row of rawResults) {
      const uri = row.uri?.value;
      const tag = row.tag?.value;
      
      if (uri && tag) {
        if (!tagsByUri.has(uri)) {
          tagsByUri.set(uri, new Set());
        }
        tagsByUri.get(uri)!.add(tag);
      }
    }
    
    // 결과에 태그 추가
    for (const result of results) {
      const tags = tagsByUri.get(result.uri);
      result.tags = tags ? Array.from(tags) : [];
    }
  }

  /**
   * 결과에 관련도 점수를 계산하고 추가
   * @param results - 결과 배열
   * @param targetConcept - 검색 대상 개념
   */
  private calculateRelevanceScores(results: GraphQueryResult[], targetConcept: string): void {
    const conceptLower = targetConcept.toLowerCase();
    
    for (const result of results) {
      let score = 0;
      
      // 1. 정확한 매치 점수 (가장 높은 가중치)
      const exactMatchScore = this.calculateExactMatchScore(result, conceptLower);
      score += exactMatchScore * 100;
      
      // 2. 태그 매치 점수
      const tagMatchScore = this.calculateTagMatchScore(result.tags, conceptLower);
      score += tagMatchScore * 50;
      
      // 3. 내용 빈도 점수
      const frequencyScore = this.calculateFrequencyScore(result.content, conceptLower);
      score += frequencyScore * 25;
      
      // 4. 내용 길이 대비 매치 밀도
      const densityScore = this.calculateDensityScore(result.content, conceptLower);
      score += densityScore * 10;
      
      // 5. 타입별 보너스 (노트가 더 구체적이므로 약간 높은 점수)
      if (result.type === 'note') {
        score += 5;
      }
      
      result.relevanceScore = Math.round(score * 100) / 100; // 소수점 2자리로 반올림
    }
  }
  
  /**
   * 정확한 매치 점수 계산
   * @param result - 결과 항목
   * @param conceptLower - 소문자 변환된 검색 개념
   * @returns 정확한 매치 점수 (0-1)
   */
  private calculateExactMatchScore(result: GraphQueryResult, conceptLower: string): number {
    let exactMatches = 0;
    
    // 내용에서 정확한 매치
    if (result.content.toLowerCase().includes(conceptLower)) {
      exactMatches += 1;
    }
    
    // 제목에서 정확한 매치 (책의 경우)
    if (result.title && result.title.toLowerCase().includes(conceptLower)) {
      exactMatches += 1.5; // 제목 매치는 더 높은 가중치
    }
    
    // 작가에서 정확한 매치
    if (result.author && result.author.toLowerCase().includes(conceptLower)) {
      exactMatches += 0.8;
    }
    
    return Math.min(exactMatches, 1); // 최대 1점
  }
  
  /**
   * 태그 매치 점수 계산
   * @param tags - 태그 배열
   * @param conceptLower - 소문자 변환된 검색 개념
   * @returns 태그 매치 점수 (0-1)
   */
  private calculateTagMatchScore(tags: string[], conceptLower: string): number {
    if (!tags || tags.length === 0) return 0;
    
    let tagMatches = 0;
    for (const tag of tags) {
      if (tag.toLowerCase().includes(conceptLower)) {
        tagMatches += 1;
      }
      // 정확한 태그 매치는 더 높은 점수
      if (tag.toLowerCase() === conceptLower) {
        tagMatches += 0.5;
      }
    }
    
    // 태그 매치 비율 (최대 1점)
    return Math.min(tagMatches / tags.length, 1);
  }
  
  /**
   * 빈도 점수 계산
   * @param content - 내용 텍스트
   * @param conceptLower - 소문자 변환된 검색 개념
   * @returns 빈도 점수 (0-1)
   */
  private calculateFrequencyScore(content: string, conceptLower: string): number {
    if (!content) return 0;
    
    const contentLower = content.toLowerCase();
    const matches = (contentLower.match(new RegExp(conceptLower, 'g')) || []).length;
    
    // 빈도를 정규화 (최대 5번 등장시 1점)
    return Math.min(matches / 5, 1);
  }
  
  /**
   * 밀도 점수 계산 (내용 길이 대비 매치 비율)
   * @param content - 내용 텍스트
   * @param conceptLower - 소문자 변환된 검색 개념
   * @returns 밀도 점수 (0-1)
   */
  private calculateDensityScore(content: string, conceptLower: string): number {
    if (!content) return 0;
    
    const contentLower = content.toLowerCase();
    const conceptLength = conceptLower.length;
    const contentLength = content.length;
    const matches = (contentLower.match(new RegExp(conceptLower, 'g')) || []).length;
    
    if (matches === 0 || contentLength === 0) return 0;
    
    // 매치된 문자 수 / 전체 내용 길이
    const density = (matches * conceptLength) / contentLength;
    
    // 밀도를 정규화 (5% 밀도에서 1점)
    return Math.min(density * 20, 1);
  }
  
  /**
   * 결과를 관련도 점수에 따라 정렬
   * @param results - 정렬할 결과 배열
   */
  private sortResultsByRelevance(results: GraphQueryResult[]): void {
    results.sort((a, b) => {
      const scoreA = a.relevanceScore || 0;
      const scoreB = b.relevanceScore || 0;
      return scoreB - scoreA; // 내림차순 정렬 (높은 점수가 먼저)
    });
  }

  /**
   * 조회된 그래프 데이터를 AI에 적합한 ContextBundle로 가공
   * @param rawData - 그래프 조회 결과
   * @returns ContextBundle
   */
  private buildBundle(targetConcept: string, rawData: RawGraphResult): ContextBundle {
    // 노트를 INote 형식으로 변환
    const relevantNotes = rawData.notes.map(note => ({
      content: note.content,
      tags: note.tags,
      relevanceScore: note.relevanceScore,
    }));
    
    // 책에서 발췌한 내용 생성
    const bookExcerpts = rawData.books.map(book => 
      `${book.title}${book.author ? ` by ${book.author}` : ''}`
    );
    
    // 모든 태그에서 관련 개념 추출
    const allTags = new Set<string>();
    [...rawData.notes, ...rawData.books].forEach(item => {
      item.tags.forEach(tag => allTags.add(tag));
    });
    const relatedConcepts = Array.from(allTags).filter(tag => 
      tag.toLowerCase() !== targetConcept.toLowerCase()
    );

    return {
      targetConcept,
      relevantNotes,
      bookExcerpts,
      relatedConcepts,
      queryMetadata: {
        executionTime: 0, // 실제 실행 시간은 queryGraph에서 설정
        resultCount: rawData.totalResults,
        queryType: 'sparql-concept-search'
      }
    };
  }

  /**
   * 특정 목표 개념에 대한 컨텍스트 묶음을 가져옵니다.
   * @param targetConcept - 목표 개념 (예: "머신러닝")
   * @returns ContextBundle
   */
  public async getContextBundle(targetConcept: string): Promise<ContextBundle> {
    const startTime = Date.now();
    const rawData = await this.queryGraph(targetConcept);
    const contextBundle = this.buildBundle(targetConcept, rawData);
    
    // 실행 시간 업데이트
    if (contextBundle.queryMetadata) {
      contextBundle.queryMetadata.executionTime = Date.now() - startTime;
    }
    
    return contextBundle;
  }
} 