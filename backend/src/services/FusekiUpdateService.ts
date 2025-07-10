import { getGraphClient } from '../lib/graphClient';
import { NewKnowledgeTriple } from './ResponseHandler';

export interface UpdateResult {
  success: boolean;
  triplesProcessed: number;
  errors: string[];
  executionTime: number;
  operation: 'INSERT' | 'DELETE' | 'UPDATE';
}

export interface BatchUpdateResult {
  totalTriples: number;
  successfulTriples: number;
  failedTriples: number;
  errors: string[];
  executionTime: number;
  operations: UpdateResult[];
}

export interface UpdateOptions {
  enableBatch?: boolean;
  batchSize?: number;
  enableTransaction?: boolean;
  validateBeforeInsert?: boolean;
  handleDuplicates?: 'skip' | 'update' | 'error';
  timeout?: number; // milliseconds
}

/**
 * Fuseki SPARQL UPDATE 작업을 수행하는 서비스
 * 
 * 주요 기능:
 * 1. RDF 트리플 INSERT/DELETE/UPDATE
 * 2. 배치 처리 및 트랜잭션 지원
 * 3. 중복 처리 및 검증
 * 4. 성능 최적화
 */
export class FusekiUpdateService {
  private client: any;
  private defaultOptions: UpdateOptions = {
    enableBatch: true,
    batchSize: 50,
    enableTransaction: false, // Fuseki 기본 설정에 따라
    validateBeforeInsert: true,
    handleDuplicates: 'skip',
    timeout: 30000 // 30초
  };

  constructor() {
    this.client = getGraphClient();
  }

  /**
   * 단일 트리플을 Fuseki에 삽입합니다.
   */
  async insertTriple(triple: NewKnowledgeTriple, options: Partial<UpdateOptions> = {}): Promise<UpdateResult> {
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();

    try {
      console.log(`[FusekiUpdateService] 트리플 삽입 시작: ${triple.subject} ${triple.predicate} ${triple.object}`);

      // 중복 검사
      if (opts.validateBeforeInsert) {
        const exists = await this.checkTripleExists(triple);
        if (exists) {
          if (opts.handleDuplicates === 'skip') {
            console.log(`[FusekiUpdateService] 중복 트리플 스킵: ${triple.subject}`);
            return {
              success: true,
              triplesProcessed: 0,
              errors: [],
              executionTime: Date.now() - startTime,
              operation: 'INSERT'
            };
          } else if (opts.handleDuplicates === 'error') {
            throw new Error(`Duplicate triple found: ${triple.subject} ${triple.predicate} ${triple.object}`);
          }
          // 'update' 모드는 아래에서 처리
        }
      }

      // SPARQL INSERT 쿼리 생성
      const sparqlUpdate = this.generateInsertQuery([triple]);
      
      console.log(`[FusekiUpdateService] SPARQL UPDATE 실행:`, sparqlUpdate);

      // UPDATE 쿼리 실행
      await this.executeUpdate(sparqlUpdate, opts.timeout);

      const executionTime = Date.now() - startTime;
      console.log(`[FusekiUpdateService] 트리플 삽입 완료 (${executionTime}ms)`);

      return {
        success: true,
        triplesProcessed: 1,
        errors: [],
        executionTime,
        operation: 'INSERT'
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      console.error(`[FusekiUpdateService] 트리플 삽입 실패:`, error);

      return {
        success: false,
        triplesProcessed: 0,
        errors: [error.message || 'Unknown error'],
        executionTime,
        operation: 'INSERT'
      };
    }
  }

  /**
   * 여러 트리플을 배치로 삽입합니다.
   */
  async insertTriples(triples: NewKnowledgeTriple[], options: Partial<UpdateOptions> = {}): Promise<BatchUpdateResult> {
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();

    if (triples.length === 0) {
      return {
        totalTriples: 0,
        successfulTriples: 0,
        failedTriples: 0,
        errors: [],
        executionTime: 0,
        operations: []
      };
    }

    console.log(`[FusekiUpdateService] 배치 삽입 시작: ${triples.length}개 트리플`);

    try {
      const results: UpdateResult[] = [];
      let successfulTriples = 0;
      let failedTriples = 0;
      const allErrors: string[] = [];

      if (opts.enableBatch && triples.length > 1) {
        // 배치 처리
        const batches = this.createBatches(triples, opts.batchSize || 50);
        
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          console.log(`[FusekiUpdateService] 배치 ${i + 1}/${batches.length} 처리 중 (${batch.length}개 트리플)`);

          try {
            const batchResult = await this.insertBatch(batch, opts);
            results.push(batchResult);
            
            if (batchResult.success) {
              successfulTriples += batchResult.triplesProcessed;
            } else {
              failedTriples += batch.length;
              allErrors.push(...batchResult.errors);
            }
          } catch (error: any) {
            failedTriples += batch.length;
            allErrors.push(`Batch ${i + 1} failed: ${error.message}`);
            
            results.push({
              success: false,
              triplesProcessed: 0,
              errors: [error.message],
              executionTime: 0,
              operation: 'INSERT'
            });
          }
        }
      } else {
        // 개별 처리
        for (const triple of triples) {
          const result = await this.insertTriple(triple, opts);
          results.push(result);
          
          if (result.success) {
            successfulTriples += result.triplesProcessed;
          } else {
            failedTriples++;
            allErrors.push(...result.errors);
          }
        }
      }

      const executionTime = Date.now() - startTime;
      console.log(`[FusekiUpdateService] 배치 삽입 완료: ${successfulTriples}개 성공, ${failedTriples}개 실패 (${executionTime}ms)`);

      return {
        totalTriples: triples.length,
        successfulTriples,
        failedTriples,
        errors: allErrors,
        executionTime,
        operations: results
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      console.error(`[FusekiUpdateService] 배치 삽입 중 치명적 오류:`, error);

      return {
        totalTriples: triples.length,
        successfulTriples: 0,
        failedTriples: triples.length,
        errors: [error.message || 'Critical batch insertion failure'],
        executionTime,
        operations: []
      };
    }
  }

  /**
   * 트리플을 삭제합니다.
   */
  async deleteTriple(triple: NewKnowledgeTriple, options: Partial<UpdateOptions> = {}): Promise<UpdateResult> {
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();

    try {
      console.log(`[FusekiUpdateService] 트리플 삭제 시작: ${triple.subject} ${triple.predicate} ${triple.object}`);

      // SPARQL DELETE 쿼리 생성
      const sparqlUpdate = this.generateDeleteQuery([triple]);
      
      console.log(`[FusekiUpdateService] SPARQL DELETE 실행:`, sparqlUpdate);

      // DELETE 쿼리 실행
      await this.executeUpdate(sparqlUpdate, opts.timeout);

      const executionTime = Date.now() - startTime;
      console.log(`[FusekiUpdateService] 트리플 삭제 완료 (${executionTime}ms)`);

      return {
        success: true,
        triplesProcessed: 1,
        errors: [],
        executionTime,
        operation: 'DELETE'
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      console.error(`[FusekiUpdateService] 트리플 삭제 실패:`, error);

      return {
        success: false,
        triplesProcessed: 0,
        errors: [error.message || 'Unknown error'],
        executionTime,
        operation: 'DELETE'
      };
    }
  }

  /**
   * 조건부 업데이트를 수행합니다.
   */
  async updateTriple(
    oldTriple: NewKnowledgeTriple, 
    newTriple: NewKnowledgeTriple, 
    options: Partial<UpdateOptions> = {}
  ): Promise<UpdateResult> {
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();

    try {
      console.log(`[FusekiUpdateService] 트리플 업데이트 시작`);
      console.log(`  기존: ${oldTriple.subject} ${oldTriple.predicate} ${oldTriple.object}`);
      console.log(`  신규: ${newTriple.subject} ${newTriple.predicate} ${newTriple.object}`);

      // SPARQL UPDATE WHERE 쿼리 생성
      const sparqlUpdate = this.generateUpdateQuery(oldTriple, newTriple);
      
      console.log(`[FusekiUpdateService] SPARQL UPDATE WHERE 실행:`, sparqlUpdate);

      // UPDATE 쿼리 실행
      await this.executeUpdate(sparqlUpdate, opts.timeout);

      const executionTime = Date.now() - startTime;
      console.log(`[FusekiUpdateService] 트리플 업데이트 완료 (${executionTime}ms)`);

      return {
        success: true,
        triplesProcessed: 1,
        errors: [],
        executionTime,
        operation: 'UPDATE'
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      console.error(`[FusekiUpdateService] 트리플 업데이트 실패:`, error);

      return {
        success: false,
        triplesProcessed: 0,
        errors: [error.message || 'Unknown error'],
        executionTime,
        operation: 'UPDATE'
      };
    }
  }

  /**
   * 배치를 삽입합니다.
   */
  private async insertBatch(batch: NewKnowledgeTriple[], options: UpdateOptions): Promise<UpdateResult> {
    const startTime = Date.now();

    try {
      // 중복 검사 (옵션에 따라)
      let filteredBatch = batch;
      if (options.validateBeforeInsert) {
        filteredBatch = await this.filterDuplicates(batch, options.handleDuplicates || 'skip');
      }

      if (filteredBatch.length === 0) {
        return {
          success: true,
          triplesProcessed: 0,
          errors: [],
          executionTime: Date.now() - startTime,
          operation: 'INSERT'
        };
      }

      // SPARQL INSERT 쿼리 생성
      const sparqlUpdate = this.generateInsertQuery(filteredBatch);
      
      // 배치 실행
      await this.executeUpdate(sparqlUpdate, options.timeout);

      return {
        success: true,
        triplesProcessed: filteredBatch.length,
        errors: [],
        executionTime: Date.now() - startTime,
        operation: 'INSERT'
      };

    } catch (error: any) {
      return {
        success: false,
        triplesProcessed: 0,
        errors: [error.message || 'Batch insertion failed'],
        executionTime: Date.now() - startTime,
        operation: 'INSERT'
      };
    }
  }

  /**
   * SPARQL INSERT 쿼리를 생성합니다.
   */
  private generateInsertQuery(triples: NewKnowledgeTriple[]): string {
    const prefixes = `
      PREFIX habitus33: <https://w3id.org/habitus33/resource/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX dcterms: <http://purl.org/dc/terms/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    `;

    const tripleStrings = triples.map(triple => {
      const subject = this.formatURI(triple.subject);
      const predicate = this.formatURI(triple.predicate);
      const object = this.formatObject(triple.object);
      
      return `    ${subject} ${predicate} ${object} .`;
    }).join('\n');

    return `${prefixes}
INSERT DATA {
${tripleStrings}
}`;
  }

  /**
   * SPARQL DELETE 쿼리를 생성합니다.
   */
  private generateDeleteQuery(triples: NewKnowledgeTriple[]): string {
    const prefixes = `
      PREFIX habitus33: <https://w3id.org/habitus33/resource/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX dcterms: <http://purl.org/dc/terms/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    `;

    const tripleStrings = triples.map(triple => {
      const subject = this.formatURI(triple.subject);
      const predicate = this.formatURI(triple.predicate);
      const object = this.formatObject(triple.object);
      
      return `    ${subject} ${predicate} ${object} .`;
    }).join('\n');

    return `${prefixes}
DELETE DATA {
${tripleStrings}
}`;
  }

  /**
   * SPARQL UPDATE WHERE 쿼리를 생성합니다.
   */
  private generateUpdateQuery(oldTriple: NewKnowledgeTriple, newTriple: NewKnowledgeTriple): string {
    const prefixes = `
      PREFIX habitus33: <https://w3id.org/habitus33/resource/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX dcterms: <http://purl.org/dc/terms/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    `;

    const oldSubject = this.formatURI(oldTriple.subject);
    const oldPredicate = this.formatURI(oldTriple.predicate);
    const oldObject = this.formatObject(oldTriple.object);

    const newSubject = this.formatURI(newTriple.subject);
    const newPredicate = this.formatURI(newTriple.predicate);
    const newObject = this.formatObject(newTriple.object);

    return `${prefixes}
DELETE {
  ${oldSubject} ${oldPredicate} ${oldObject} .
}
INSERT {
  ${newSubject} ${newPredicate} ${newObject} .
}
WHERE {
  ${oldSubject} ${oldPredicate} ${oldObject} .
}`;
  }

  /**
   * URI를 적절한 형식으로 포맷합니다.
   */
  private formatURI(uri: string): string {
    // 이미 URI 형식인 경우 (<>로 감싸져 있거나 prefix 포함)
    if (uri.startsWith('<') && uri.endsWith('>')) {
      return uri;
    }
    
    if (uri.includes(':')) {
      return uri; // prefix:localname 형식
    }
    
    // 일반 문자열인 경우 habitus33 네임스페이스 추가
    return `habitus33:${uri.replace(/[^a-zA-Z0-9_가-힣]/g, '_')}`;
  }

  /**
   * 객체를 적절한 형식으로 포맷합니다.
   */
  private formatObject(object: string): string {
    // 언어 태그가 있는 리터럴 (@ko 등)
    if (object.includes('@')) {
      return object;
    }
    
    // 따옴표로 감싸진 리터럴
    if (object.startsWith('"') && object.endsWith('"')) {
      return object;
    }
    
    // URI 형식
    if (object.startsWith('<') && object.endsWith('>')) {
      return object;
    }
    
    if (object.includes(':')) {
      return object; // prefix:localname 형식
    }
    
    // 일반 문자열인 경우 리터럴로 처리
    return `"${object.replace(/"/g, '\\"')}"`;
  }

  /**
   * SPARQL UPDATE를 실행합니다.
   */
  private async executeUpdate(sparqlUpdate: string, timeout: number = 30000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`SPARQL UPDATE timeout after ${timeout}ms`));
      }, timeout);

      this.client.query.update(sparqlUpdate)
        .then(() => {
          clearTimeout(timeoutId);
          resolve();
        })
        .catch((error: any) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * 트리플이 이미 존재하는지 확인합니다.
   */
  private async checkTripleExists(triple: NewKnowledgeTriple): Promise<boolean> {
    try {
      const subject = this.formatURI(triple.subject);
      const predicate = this.formatURI(triple.predicate);
      const object = this.formatObject(triple.object);

      const sparqlQuery = `
        PREFIX habitus33: <https://w3id.org/habitus33/resource/>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        
        ASK {
          ${subject} ${predicate} ${object} .
        }
      `;

      const stream = await this.client.query.ask(sparqlQuery);
      return stream; // ASK 쿼리는 boolean 결과 반환

    } catch (error) {
      console.warn(`[FusekiUpdateService] 중복 검사 실패:`, error);
      return false; // 오류 시 중복이 아닌 것으로 간주
    }
  }

  /**
   * 중복 트리플을 필터링합니다.
   */
  private async filterDuplicates(
    triples: NewKnowledgeTriple[], 
    handleMode: 'skip' | 'update' | 'error'
  ): Promise<NewKnowledgeTriple[]> {
    if (handleMode === 'error') {
      // 중복 검사 후 오류 발생
      for (const triple of triples) {
        const exists = await this.checkTripleExists(triple);
        if (exists) {
          throw new Error(`Duplicate triple detected: ${triple.subject} ${triple.predicate} ${triple.object}`);
        }
      }
      return triples;
    }

    if (handleMode === 'skip') {
      // 중복 트리플 제외
      const filtered: NewKnowledgeTriple[] = [];
      for (const triple of triples) {
        const exists = await this.checkTripleExists(triple);
        if (!exists) {
          filtered.push(triple);
        }
      }
      return filtered;
    }

    // 'update' 모드는 현재 구현에서는 skip과 동일하게 처리
    return this.filterDuplicates(triples, 'skip');
  }

  /**
   * 트리플 배열을 배치로 나눕니다.
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * 서비스 상태를 확인합니다.
   */
  async healthCheck(): Promise<{ 
    connected: boolean; 
    updateCapable: boolean; 
    responseTime: number; 
    error?: string; 
  }> {
    const startTime = Date.now();
    
    try {
      // 간단한 INSERT/DELETE 테스트
      const testTriple: NewKnowledgeTriple = {
        subject: 'habitus33:HealthCheckTest',
        predicate: 'rdf:type',
        object: 'habitus33:TestEntity',
        confidence: 1.0,
        source: 'health-check'
      };

      // INSERT 테스트
      const insertResult = await this.insertTriple(testTriple, { validateBeforeInsert: false });
      
      if (!insertResult.success) {
        return { 
          connected: false, 
          updateCapable: false, 
          responseTime: Date.now() - startTime,
          error: insertResult.errors.join(', ') || 'Insert test failed'
        };
      }

      // DELETE 테스트 (정리)
      const deleteResult = await this.deleteTriple(testTriple);

      const responseTime = Date.now() - startTime;
      const updateCapable = insertResult.success && deleteResult.success;

      return { 
        connected: true, 
        updateCapable,
        responseTime,
        error: updateCapable ? undefined : 'Delete test failed'
      };

    } catch (error: any) {
      console.error('[FusekiUpdateService] Health check failed:', error);
      return { 
        connected: false, 
        updateCapable: false, 
        responseTime: Date.now() - startTime,
        error: error.message || 'Health check failed'
      };
    }
  }
} 