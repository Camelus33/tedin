import fs from 'fs/promises';
import path from 'path';

// 이전에 정의한 인터페이스들 재사용
interface FieldInfo {
  type: string;
  isArray: boolean;
  isRequired: boolean;
  hasDefault: boolean;
  defaultValue?: any;
  nestedFields?: Record<string, FieldInfo>;
}

interface IndexInfo {
  name: string;
  keys: Record<string, 1 | -1>;
  unique?: boolean;
  sparse?: boolean;
  background?: boolean;
  [key: string]: any;
}

interface CollectionSchema {
  name: string;
  documentCount: number;
  avgDocumentSize: number;
  totalSize: number;
  fields: Record<string, FieldInfo>;
  indexes: IndexInfo[];
  sampleDocuments: any[];
}

interface DatabaseSchema {
  databaseName: string;
  totalCollections: number;
  totalDocuments: number;
  totalSize: number;
  collections: Record<string, CollectionSchema>;
  extractedAt: string;
}

interface FieldDifference {
  field: string;
  atlas?: FieldInfo;
  local?: FieldInfo;
  type: 'missing' | 'added' | 'type_mismatch' | 'requirement_mismatch';
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface IndexDifference {
  indexName: string;
  atlas?: IndexInfo;
  local?: IndexInfo;
  type: 'missing' | 'added' | 'key_mismatch' | 'option_mismatch';
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface CollectionDifference {
  collection: string;
  atlas?: CollectionSchema;
  local?: CollectionSchema;
  type: 'missing' | 'added';
  fieldDifferences: FieldDifference[];
  indexDifferences: IndexDifference[];
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface SchemaDifference {
  atlas: DatabaseSchema;
  local: DatabaseSchema;
  collectionDifferences: CollectionDifference[];
  totalDifferences: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  syncPlan: SyncOperation[];
  comparedAt: string;
}

interface SyncOperation {
  operation: 'create_collection' | 'add_field' | 'modify_field' | 'create_index' | 'drop_index';
  collection: string;
  field?: string;
  index?: string;
  details: any;
  priority: 'high' | 'medium' | 'low';
  mongoCommand: string;
  description: string;
}

/**
 * MongoDB 스키마 비교 및 동기화 계획 생성기
 */
class SchemaComparator {
  
  /**
   * 필드 비교
   */
  private compareFields(atlasFields: Record<string, FieldInfo>, localFields: Record<string, FieldInfo>): FieldDifference[] {
    const differences: FieldDifference[] = [];
    const allFields = new Set([...Object.keys(atlasFields), ...Object.keys(localFields)]);
    
    for (const fieldName of Array.from(allFields)) {
      const atlasField = atlasFields[fieldName];
      const localField = localFields[fieldName];
      
      if (atlasField && !localField) {
        differences.push({
          field: fieldName,
          atlas: atlasField,
          type: 'missing',
          description: `로컬에 누락된 필드 (Atlas 타입: ${atlasField.type}${atlasField.isArray ? '[]' : ''})`,
          priority: atlasField.isRequired ? 'high' : 'medium'
        });
      } else if (!atlasField && localField) {
        differences.push({
          field: fieldName,
          local: localField,
          type: 'added',
          description: `Atlas에 없는 추가 필드 (로컬 타입: ${localField.type}${localField.isArray ? '[]' : ''})`,
          priority: 'low'
        });
      } else if (atlasField && localField) {
        // 타입 비교
        if (atlasField.type !== localField.type || atlasField.isArray !== localField.isArray) {
          differences.push({
            field: fieldName,
            atlas: atlasField,
            local: localField,
            type: 'type_mismatch',
            description: `타입 불일치 - Atlas: ${atlasField.type}${atlasField.isArray ? '[]' : ''}, 로컬: ${localField.type}${localField.isArray ? '[]' : ''}`,
            priority: 'high'
          });
        }
        
        // 필수 필드 여부 비교
        if (atlasField.isRequired !== localField.isRequired) {
          differences.push({
            field: fieldName,
            atlas: atlasField,
            local: localField,
            type: 'requirement_mismatch',
            description: `필수 여부 불일치 - Atlas: ${atlasField.isRequired ? '필수' : '선택'}, 로컬: ${localField.isRequired ? '필수' : '선택'}`,
            priority: 'medium'
          });
        }
      }
    }
    
    return differences;
  }
  
  /**
   * 인덱스 비교
   */
  private compareIndexes(atlasIndexes: IndexInfo[], localIndexes: IndexInfo[]): IndexDifference[] {
    const differences: IndexDifference[] = [];
    
    const atlasIndexMap = new Map(atlasIndexes.map(idx => [idx.name, idx]));
    const localIndexMap = new Map(localIndexes.map(idx => [idx.name, idx]));
    
    const allIndexNames = new Set([...Array.from(atlasIndexMap.keys()), ...Array.from(localIndexMap.keys())]);
    
    for (const indexName of Array.from(allIndexNames)) {
      const atlasIndex = atlasIndexMap.get(indexName);
      const localIndex = localIndexMap.get(indexName);
      
      if (atlasIndex && !localIndex) {
        differences.push({
          indexName,
          atlas: atlasIndex,
          type: 'missing',
          description: `로컬에 누락된 인덱스`,
          priority: 'medium'
        });
      } else if (!atlasIndex && localIndex) {
        differences.push({
          indexName,
          local: localIndex,
          type: 'added',
          description: `Atlas에 없는 추가 인덱스`,
          priority: 'low'
        });
      } else if (atlasIndex && localIndex) {
        // 인덱스 키 비교
        const atlasKeys = JSON.stringify(atlasIndex.keys);
        const localKeys = JSON.stringify(localIndex.keys);
        
        if (atlasKeys !== localKeys) {
          differences.push({
            indexName,
            atlas: atlasIndex,
            local: localIndex,
            type: 'key_mismatch',
            description: `인덱스 키 불일치`,
            priority: 'medium'
          });
        }
        
        // 인덱스 옵션 비교
        if (atlasIndex.unique !== localIndex.unique || atlasIndex.sparse !== localIndex.sparse) {
          differences.push({
            indexName,
            atlas: atlasIndex,
            local: localIndex,
            type: 'option_mismatch',
            description: `인덱스 옵션 불일치`,
            priority: 'low'
          });
        }
      }
    }
    
    return differences;
  }
  
  /**
   * 컬렉션 비교
   */
  private compareCollections(atlasSchema: DatabaseSchema, localSchema: DatabaseSchema): CollectionDifference[] {
    const differences: CollectionDifference[] = [];
    
    const atlasCollections = atlasSchema.collections;
    const localCollections = localSchema.collections;
    
    const allCollections = new Set([...Object.keys(atlasCollections), ...Object.keys(localCollections)]);
    
    for (const collectionName of Array.from(allCollections)) {
      const atlasCollection = atlasCollections[collectionName];
      const localCollection = localCollections[collectionName];
      
      if (atlasCollection && !localCollection) {
        differences.push({
          collection: collectionName,
          atlas: atlasCollection,
          type: 'missing',
          fieldDifferences: [],
          indexDifferences: [],
          description: `로컬에 누락된 컬렉션 (Atlas: ${atlasCollection.documentCount}개 문서)`,
          priority: 'high'
        });
      } else if (!atlasCollection && localCollection) {
        differences.push({
          collection: collectionName,
          local: localCollection,
          type: 'added',
          fieldDifferences: [],
          indexDifferences: [],
          description: `Atlas에 없는 추가 컬렉션 (로컬: ${localCollection.documentCount}개 문서)`,
          priority: 'low'
        });
      } else if (atlasCollection && localCollection) {
        // 필드 및 인덱스 차이점 분석
        const fieldDifferences = this.compareFields(atlasCollection.fields, localCollection.fields);
        const indexDifferences = this.compareIndexes(atlasCollection.indexes, localCollection.indexes);
        
        if (fieldDifferences.length > 0 || indexDifferences.length > 0) {
          const highPriority = [...fieldDifferences, ...indexDifferences].some(diff => diff.priority === 'high');
          
          differences.push({
            collection: collectionName,
            atlas: atlasCollection,
            local: localCollection,
            type: 'missing', // 임시
            fieldDifferences,
            indexDifferences,
            description: `필드/인덱스 차이점 있음 (필드: ${fieldDifferences.length}개, 인덱스: ${indexDifferences.length}개)`,
            priority: highPriority ? 'high' : 'medium'
          });
        }
      }
    }
    
    return differences;
  }
  
  /**
   * 동기화 계획 생성
   */
  private generateSyncPlan(differences: CollectionDifference[]): SyncOperation[] {
    const operations: SyncOperation[] = [];
    
    for (const collDiff of differences) {
      // 누락된 컬렉션 생성
      if (collDiff.type === 'missing' && collDiff.atlas) {
        operations.push({
          operation: 'create_collection',
          collection: collDiff.collection,
          details: {
            options: {}
          },
          priority: 'high',
          mongoCommand: `db.createCollection("${collDiff.collection}")`,
          description: `컬렉션 '${collDiff.collection}' 생성`
        });
      }
      
      // 필드 동기화
      for (const fieldDiff of collDiff.fieldDifferences) {
        if (fieldDiff.type === 'missing' && fieldDiff.atlas) {
          // MongoDB는 스키마리스이므로 필드 추가는 실제 데이터 입력 시 자동으로 발생
          // 여기서는 기본값 설정이나 필드 존재 여부만 체크
          operations.push({
            operation: 'add_field',
            collection: collDiff.collection,
            field: fieldDiff.field,
            details: {
              type: fieldDiff.atlas.type,
              isArray: fieldDiff.atlas.isArray,
              isRequired: fieldDiff.atlas.isRequired
            },
            priority: fieldDiff.priority,
            mongoCommand: `// 필드 '${fieldDiff.field}'는 데이터 입력 시 자동 생성됨`,
            description: `필드 '${fieldDiff.field}' 구조 확인 필요`
          });
        }
        
        if (fieldDiff.type === 'type_mismatch') {
          operations.push({
            operation: 'modify_field',
            collection: collDiff.collection,
            field: fieldDiff.field,
            details: {
              from: fieldDiff.local?.type,
              to: fieldDiff.atlas?.type
            },
            priority: fieldDiff.priority,
            mongoCommand: `// 필드 '${fieldDiff.field}' 타입 변환 검토 필요`,
            description: `필드 '${fieldDiff.field}' 타입 불일치 해결`
          });
        }
      }
      
      // 인덱스 동기화
      for (const indexDiff of collDiff.indexDifferences) {
        if (indexDiff.type === 'missing' && indexDiff.atlas) {
          const keys = Object.entries(indexDiff.atlas.keys)
            .map(([field, direction]) => `"${field}": ${direction}`)
            .join(', ');
          
          operations.push({
            operation: 'create_index',
            collection: collDiff.collection,
            index: indexDiff.indexName,
            details: indexDiff.atlas,
            priority: indexDiff.priority,
            mongoCommand: `db.${collDiff.collection}.createIndex({ ${keys} }, { name: "${indexDiff.indexName}"${indexDiff.atlas.unique ? ', unique: true' : ''}${indexDiff.atlas.sparse ? ', sparse: true' : ''} })`,
            description: `인덱스 '${indexDiff.indexName}' 생성`
          });
        }
        
        if (indexDiff.type === 'added' && indexDiff.local) {
          operations.push({
            operation: 'drop_index',
            collection: collDiff.collection,
            index: indexDiff.indexName,
            details: indexDiff.local,
            priority: 'low',
            mongoCommand: `db.${collDiff.collection}.dropIndex("${indexDiff.indexName}")`,
            description: `불필요한 인덱스 '${indexDiff.indexName}' 제거 고려`
          });
        }
      }
    }
    
    // 우선순위 순으로 정렬
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return operations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
  
  /**
   * 스키마 비교 메인 함수
   */
  async compareSchemas(atlasSchemaFile: string, localSchemaFile: string): Promise<SchemaDifference> {
    // 스키마 파일 로드
    const atlasData = await fs.readFile(atlasSchemaFile, 'utf-8');
    const localData = await fs.readFile(localSchemaFile, 'utf-8');
    
    const atlasSchema: DatabaseSchema = JSON.parse(atlasData);
    const localSchema: DatabaseSchema = JSON.parse(localData);
    
    console.log('🔍 스키마 비교 시작...');
    console.log(`- Atlas: ${atlasSchema.totalCollections}개 컬렉션, ${atlasSchema.totalDocuments}개 문서`);
    console.log(`- 로컬: ${localSchema.totalCollections}개 컬렉션, ${localSchema.totalDocuments}개 문서`);
    
    // 컬렉션 차이점 분석
    const collectionDifferences = this.compareCollections(atlasSchema, localSchema);
    
    // 통계 계산
    let totalDifferences = 0;
    let highPriorityCount = 0;
    let mediumPriorityCount = 0;
    let lowPriorityCount = 0;
    
    for (const collDiff of collectionDifferences) {
      totalDifferences += 1 + collDiff.fieldDifferences.length + collDiff.indexDifferences.length;
      
      [collDiff, ...collDiff.fieldDifferences, ...collDiff.indexDifferences].forEach(diff => {
        if (diff.priority === 'high') highPriorityCount++;
        else if (diff.priority === 'medium') mediumPriorityCount++;
        else lowPriorityCount++;
      });
    }
    
    // 동기화 계획 생성
    const syncPlan = this.generateSyncPlan(collectionDifferences);
    
    return {
      atlas: atlasSchema,
      local: localSchema,
      collectionDifferences,
      totalDifferences,
      highPriorityCount,
      mediumPriorityCount,
      lowPriorityCount,
      syncPlan,
      comparedAt: new Date().toISOString()
    };
  }
}

/**
 * 스키마 비교 메인 함수
 */
async function main() {
  try {
    console.log('🚀 MongoDB 스키마 비교 시작');
    
    const analysisDir = path.join(__dirname, '..', 'analysis');
    const atlasSchemaFile = path.join(analysisDir, 'atlas-schema.json');
    const localSchemaFile = path.join(analysisDir, 'local-schema.json');
    
    // 파일 존재 확인
    try {
      await fs.access(atlasSchemaFile);
      await fs.access(localSchemaFile);
    } catch (error) {
      console.error('❌ 스키마 파일을 찾을 수 없습니다. 먼저 Atlas와 로컬 스키마 분석을 실행하세요.');
      console.log('실행 명령:');
      console.log('- Atlas: npm run analyze:atlas-schema');
      console.log('- 로컬: npm run analyze:local-schema');
      process.exit(1);
    }
    
    // 스키마 비교
    const comparator = new SchemaComparator();
    const differences = await comparator.compareSchemas(atlasSchemaFile, localSchemaFile);
    
    // 결과 저장
    const outputFile = path.join(analysisDir, 'schema-comparison.json');
    await fs.writeFile(outputFile, JSON.stringify(differences, null, 2), 'utf-8');
    
    // 결과 출력
    console.log('\n📊 비교 결과 요약:');
    console.log(`- 총 차이점: ${differences.totalDifferences}개`);
    console.log(`- 높은 우선순위: ${differences.highPriorityCount}개`);
    console.log(`- 중간 우선순위: ${differences.mediumPriorityCount}개`);
    console.log(`- 낮은 우선순위: ${differences.lowPriorityCount}개`);
    console.log(`- 동기화 작업: ${differences.syncPlan.length}개`);
    
    console.log('\n📋 컬렉션별 차이점:');
    for (const collDiff of differences.collectionDifferences) {
      console.log(`\n🗂️  ${collDiff.collection} (우선순위: ${collDiff.priority})`);
      console.log(`   ${collDiff.description}`);
      
      if (collDiff.fieldDifferences.length > 0) {
        console.log(`   📝 필드 차이점: ${collDiff.fieldDifferences.length}개`);
        for (const fieldDiff of collDiff.fieldDifferences.slice(0, 3)) { // 상위 3개만 표시
          console.log(`      - ${fieldDiff.field}: ${fieldDiff.description}`);
        }
        if (collDiff.fieldDifferences.length > 3) {
          console.log(`      ... 및 ${collDiff.fieldDifferences.length - 3}개 더`);
        }
      }
      
      if (collDiff.indexDifferences.length > 0) {
        console.log(`   🔍 인덱스 차이점: ${collDiff.indexDifferences.length}개`);
        for (const indexDiff of collDiff.indexDifferences.slice(0, 3)) { // 상위 3개만 표시
          console.log(`      - ${indexDiff.indexName}: ${indexDiff.description}`);
        }
        if (collDiff.indexDifferences.length > 3) {
          console.log(`      ... 및 ${collDiff.indexDifferences.length - 3}개 더`);
        }
      }
    }
    
    console.log('\n🔧 주요 동기화 작업 (높은 우선순위):');
    const highPriorityOps = differences.syncPlan.filter(op => op.priority === 'high');
    if (highPriorityOps.length === 0) {
      console.log('   없음 ✅');
    } else {
      for (const op of highPriorityOps.slice(0, 5)) { // 상위 5개만 표시
        console.log(`   - ${op.description}`);
        console.log(`     명령: ${op.mongoCommand}`);
      }
      if (highPriorityOps.length > 5) {
        console.log(`   ... 및 ${highPriorityOps.length - 5}개 더`);
      }
    }
    
    console.log(`\n📄 상세 분석 파일: ${outputFile}`);
    console.log('\n✅ 스키마 비교 완료');
    
  } catch (error) {
    console.error('❌ 스키마 비교 실패:', error);
    process.exit(1);
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  main().catch(console.error);
}

export { SchemaComparator, main }; 