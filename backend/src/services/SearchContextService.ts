import { SearchResult, SearchStatistics } from '../types/search';

/**
 * 검색 결과를 AI 컨텍스트로 변환하는 서비스
 * LLM이 이해할 수 있는 형태로 검색 결과를 포맷팅합니다.
 */
export class SearchContextService {
  
  /**
   * 검색 결과를 AI 컨텍스트로 변환
   * @param searchResults 검색 결과 배열
   * @param searchQuery 원본 검색 쿼리
   * @param maxResults 최대 결과 수 (기본값: 10)
   * @returns 포맷팅된 컨텍스트 문자열
   */
  static formatSearchResultsForAI(
    searchResults: SearchResult[],
    searchQuery: string,
    maxResults: number = 10
  ): string {
    if (!searchResults || searchResults.length === 0) {
      return `검색 쿼리 "${searchQuery}"에 대한 결과를 찾을 수 없습니다.`;
    }

    // 상위 결과만 선택
    const topResults = searchResults.slice(0, maxResults);
    
    // 컨텍스트 헤더
    let context = `다음은 "${searchQuery}"에 대한 검색 결과입니다. 총 ${searchResults.length}개의 메모를 찾았으며, 관련성이 높은 상위 ${topResults.length}개를 제공합니다:\n\n`;

    // 각 검색 결과를 포맷팅
    topResults.forEach((result, index) => {
      context += `[메모 ${index + 1}]\n`;
      context += `내용: ${result.content}\n`;
      
      if (result.tags && result.tags.length > 0) {
        context += `태그: ${result.tags.join(', ')}\n`;
      }
      
      if (result.type) {
        context += `유형: ${result.type}\n`;
      }
      
      if (result.importanceReason) {
        context += `중요 이유: ${result.importanceReason}\n`;
      }
      
      if (result.momentContext) {
        context += `상황: ${result.momentContext}\n`;
      }
      
      if (result.relatedKnowledge) {
        context += `관련 지식: ${result.relatedKnowledge}\n`;
      }
      
      if (result.mentalImage) {
        context += `심상: ${result.mentalImage}\n`;
      }
      
      // 점수 정보 추가
      if (result.combinedScore !== undefined) {
        const scorePercent = Math.round(result.combinedScore * 100);
        context += `관련성 점수: ${scorePercent}%\n`;
      }
      
      context += `생성일: ${new Date(result.createdAt).toLocaleDateString('ko-KR')}\n`;
      context += '\n';
    });

    // 컨텍스트 푸터
    context += `이 정보를 바탕으로 사용자의 질문에 답변해주세요. 검색된 메모의 내용을 참고하여 정확하고 유용한 답변을 제공하되, 메모의 내용을 그대로 복사하지 말고 이해한 내용을 바탕으로 설명해주세요.`;

    return context;
  }

  /**
   * 검색 결과에서 핵심 키워드 추출
   * @param searchResults 검색 결과 배열
   * @returns 추출된 키워드 배열
   */
  static extractKeywords(searchResults: SearchResult[]): string[] {
    const keywords = new Set<string>();
    
    searchResults.forEach(result => {
      // 태그에서 키워드 추출
      if (result.tags) {
        result.tags.forEach(tag => keywords.add(tag));
      }
      
      // 내용에서 주요 키워드 추출 (간단한 구현)
      const contentWords = result.content
        .split(/\s+/)
        .filter(word => word.length > 2) // 2글자 이상만
        .slice(0, 5); // 상위 5개만
      
      contentWords.forEach(word => keywords.add(word));
    });
    
    return Array.from(keywords);
  }

  /**
   * 검색 결과를 JSON 형태로 변환 (구조화된 데이터용)
   * @param searchResults 검색 결과 배열
   * @param searchQuery 원본 검색 쿼리
   * @returns JSON 형태의 컨텍스트
   */
  static formatSearchResultsAsJSON(
    searchResults: SearchResult[],
    searchQuery: string
  ): object {
    const topResults = searchResults.slice(0, 10);
    
    return {
      searchQuery,
      totalResults: searchResults.length,
      topResults: topResults.map((result, index) => ({
        id: result._id,
        rank: index + 1,
        content: result.content,
        tags: result.tags || [],
        type: result.type,
        importanceReason: result.importanceReason,
        momentContext: result.momentContext,
        relatedKnowledge: result.relatedKnowledge,
        mentalImage: result.mentalImage,
        score: result.combinedScore,
        createdAt: result.createdAt
      })),
      keywords: this.extractKeywords(searchResults),
      summary: `"${searchQuery}"에 대한 ${searchResults.length}개의 메모를 찾았습니다.`
    };
  }

  /**
   * 검색 결과를 간단한 요약 형태로 변환
   * @param searchResults 검색 결과 배열
   * @param searchQuery 원본 검색 쿼리
   * @returns 요약된 컨텍스트
   */
  static formatSearchResultsAsSummary(
    searchResults: SearchResult[],
    searchQuery: string
  ): string {
    if (!searchResults || searchResults.length === 0) {
      return `"${searchQuery}"에 대한 검색 결과가 없습니다.`;
    }

    const topResults = searchResults.slice(0, 5);
    const keywords = this.extractKeywords(searchResults);
    
    let summary = `"${searchQuery}"에 대한 검색 결과 요약:\n`;
    summary += `- 총 ${searchResults.length}개의 메모 발견\n`;
    summary += `- 주요 키워드: ${keywords.slice(0, 10).join(', ')}\n`;
    summary += `- 상위 결과:\n`;
    
    topResults.forEach((result, index) => {
      const score = result.combinedScore ? Math.round(result.combinedScore * 100) : 'N/A';
      summary += `  ${index + 1}. ${result.content.substring(0, 100)}... (점수: ${score}%)\n`;
    });

    return summary;
  }

  /**
   * 검색 결과의 통계 정보 생성
   * @param searchResults 검색 결과 배열
   * @returns 통계 정보
   */
  static generateSearchStatistics(searchResults: SearchResult[]): object {
    const stats = {
      totalResults: searchResults.length,
      averageScore: 0,
      scoreDistribution: {
        high: 0,    // 80% 이상
        medium: 0,  // 60-79%
        low: 0      // 60% 미만
      },
      typeDistribution: {} as Record<string, number>,
      tagFrequency: {} as Record<string, number>
    };

    if (searchResults.length === 0) {
      return stats;
    }

    let totalScore = 0;
    let validScores = 0;

    searchResults.forEach(result => {
      // 점수 통계
      if (result.combinedScore !== undefined) {
        totalScore += result.combinedScore;
        validScores++;
        
        const scorePercent = result.combinedScore * 100;
        if (scorePercent >= 80) stats.scoreDistribution.high++;
        else if (scorePercent >= 60) stats.scoreDistribution.medium++;
        else stats.scoreDistribution.low++;
      }

      // 유형 분포
      if (result.type) {
        stats.typeDistribution[result.type] = (stats.typeDistribution[result.type] || 0) + 1;
      }

      // 태그 빈도
      if (result.tags) {
        result.tags.forEach(tag => {
          stats.tagFrequency[tag] = (stats.tagFrequency[tag] || 0) + 1;
        });
      }
    });

    if (validScores > 0) {
      stats.averageScore = totalScore / validScores;
    }

    return stats;
  }

  /**
   * 검색 컨텍스트를 LLM 프롬프트에 최적화
   * @param searchResults 검색 결과 배열
   * @param searchQuery 원본 검색 쿼리
   * @param userQuestion 사용자 질문
   * @returns 최적화된 프롬프트
   */
  static createOptimizedPrompt(
    searchResults: SearchResult[],
    searchQuery: string,
    userQuestion: string
  ): string {
    const context = this.formatSearchResultsForAI(searchResults, searchQuery, 8);
    const stats = this.generateSearchStatistics(searchResults) as SearchStatistics;
    
    return `당신은 수험생의 학습을 돕는 AI 학습 진단사입니다.

검색 컨텍스트:
${context}

검색 통계:
- 총 결과 수: ${stats.totalResults}
- 평균 관련성 점수: ${Math.round(stats.averageScore * 100)}%
- 높은 관련성 결과: ${stats.scoreDistribution.high}개
- 중간 관련성 결과: ${stats.scoreDistribution.medium}개
- 낮은 관련성 결과: ${stats.scoreDistribution.low}개

사용자 질문: ${userQuestion}

위의 검색 결과를 바탕으로 사용자의 질문에 답변해주세요. 다음 사항을 고려해주세요:
1. 검색된 메모의 내용을 참고하여 정확한 답변을 제공하세요
2. 메모의 내용을 그대로 복사하지 말고 이해한 내용을 바탕으로 설명하세요
3. 수험생의 관점에서 실용적이고 도움이 되는 답변을 제공하세요
4. 필요시 추가적인 학습 방향이나 팁을 제시하세요`;
  }
} 