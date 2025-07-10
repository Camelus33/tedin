import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

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

/**
 * MongoDB Atlas 스키마 분석 유틸리티
 */
class AtlasSchemaAnalyzer {
  private db: mongoose.Connection;

  constructor(db: mongoose.Connection) {
    this.db = db;
  }

  /**
   * 단일 도큐먼트에서 필드 타입 정보 추출
   */
  private analyzeDocument(doc: any, prefix = ''): Record<string, FieldInfo> {
    const fields: Record<string, FieldInfo> = {};
    
    if (!doc || typeof doc !== 'object') return fields;

    for (const [key, value] of Object.entries(doc)) {
      const fieldName = prefix ? `${prefix}.${key}` : key;
      
      if (value === null || value === undefined) {
        fields[fieldName] = {
          type: 'null',
          isArray: false,
          isRequired: false,
          hasDefault: false
        };
      } else if (Array.isArray(value)) {
        const itemType = value.length > 0 ? typeof value[0] : 'unknown';
        fields[fieldName] = {
          type: itemType,
          isArray: true,
          isRequired: false,
          hasDefault: false
        };
        
        // 배열 내 객체 타입 분석
        if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
          const nestedFields = this.analyzeDocument(value[0], fieldName);
          if (Object.keys(nestedFields).length > 0) {
            fields[fieldName].nestedFields = nestedFields;
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        if (value instanceof Date) {
          fields[fieldName] = {
            type: 'date',
            isArray: false,
            isRequired: false,
            hasDefault: false
          };
        } else if (value.constructor.name === 'ObjectId') {
          fields[fieldName] = {
            type: 'objectid',
            isArray: false,
            isRequired: false,
            hasDefault: false
          };
        } else {
          fields[fieldName] = {
            type: 'object',
            isArray: false,
            isRequired: false,
            hasDefault: false
          };
          
          // 중첩 객체 분석
          const nestedFields = this.analyzeDocument(value, fieldName);
          if (Object.keys(nestedFields).length > 0) {
            fields[fieldName].nestedFields = nestedFields;
          }
        }
      } else {
        fields[fieldName] = {
          type: typeof value,
          isArray: false,
          isRequired: false,
          hasDefault: false
        };
      }
    }
    
    return fields;
  }

  /**
   * 여러 도큐먼트를 분석하여 통합된 스키마 생성
   */
  private mergeFieldAnalysis(documents: any[]): Record<string, FieldInfo> {
    const fieldFrequency: Record<string, number> = {};
    const fieldTypes: Record<string, Set<string>> = {};
    const allFields: Record<string, FieldInfo> = {};
    
    // 모든 도큐먼트 분석
    for (const doc of documents) {
      const docFields = this.analyzeDocument(doc);
      
      for (const [fieldName, fieldInfo] of Object.entries(docFields)) {
        // 필드 출현 빈도 계산
        fieldFrequency[fieldName] = (fieldFrequency[fieldName] || 0) + 1;
        
        // 필드 타입 집합 구성
        if (!fieldTypes[fieldName]) {
          fieldTypes[fieldName] = new Set();
        }
        fieldTypes[fieldName].add(fieldInfo.type);
        
        // 첫 번째 발견된 필드 정보를 기본으로 설정
        if (!allFields[fieldName]) {
          allFields[fieldName] = { ...fieldInfo };
        }
      }
    }
    
    // 필드 통계 정보 추가
    for (const [fieldName, fieldInfo] of Object.entries(allFields)) {
      const frequency = fieldFrequency[fieldName] || 0;
      const totalDocs = documents.length;
      
      // 필수 필드 여부 판단 (80% 이상 출현)
      fieldInfo.isRequired = frequency / totalDocs >= 0.8;
      
      // 다중 타입 처리
      const types = Array.from(fieldTypes[fieldName] || new Set());
      if (types.length > 1) {
        fieldInfo.type = `mixed(${types.join('|')})`;
      }
    }
    
    return allFields;
  }

  /**
   * 컬렉션 스키마 분석
   */
  private async analyzeCollection(collectionName: string): Promise<CollectionSchema> {
    const collection = this.db.collection(collectionName);
    
    // 기본 통계 정보
    const stats = await collection.stats();
    const documentCount = stats.count || 0;
    const avgDocumentSize = stats.avgObjSize || 0;
    const totalSize = stats.size || 0;
    
    // 인덱스 정보
    const indexesData = await collection.listIndexes().toArray();
    const indexes: IndexInfo[] = indexesData.map(index => ({
      name: index.name,
      keys: index.key,
      unique: index.unique || false,
      sparse: index.sparse || false,
      background: index.background || false,
      ...index
    }));
    
    // 샘플 도큐먼트 추출 (최대 100개)
    const sampleSize = Math.min(documentCount, 100);
    const sampleDocuments = await collection.aggregate([
      { $sample: { size: sampleSize } }
    ]).toArray();
    
    // 필드 스키마 분석
    const fields = this.mergeFieldAnalysis(sampleDocuments);
    
    return {
      name: collectionName,
      documentCount,
      avgDocumentSize,
      totalSize,
      fields,
      indexes,
      sampleDocuments: sampleDocuments.slice(0, 5) // 상위 5개만 저장
    };
  }

  /**
   * 전체 데이터베이스 스키마 분석
   */
  async analyzeDatabaseSchema(): Promise<DatabaseSchema> {
    const collections = await this.db.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    console.log(`🔍 분석할 컬렉션: ${collectionNames.length}개`);
    console.log(`📋 컬렉션 목록: ${collectionNames.join(', ')}`);
    
    const collectionSchemas: Record<string, CollectionSchema> = {};
    let totalDocuments = 0;
    let totalSize = 0;
    
    // 각 컬렉션 순차 분석
    for (let i = 0; i < collectionNames.length; i++) {
      const collectionName = collectionNames[i];
      console.log(`\n⏳ (${i + 1}/${collectionNames.length}) ${collectionName} 분석 중...`);
      
      try {
        const schema = await this.analyzeCollection(collectionName);
        collectionSchemas[collectionName] = schema;
        
        totalDocuments += schema.documentCount;
        totalSize += schema.totalSize;
        
        console.log(`✅ ${collectionName}: ${schema.documentCount}개 문서, ${Object.keys(schema.fields).length}개 필드`);
      } catch (error) {
        console.error(`❌ ${collectionName} 분석 실패:`, error);
      }
    }
    
    return {
      databaseName: this.db.name,
      totalCollections: collectionNames.length,
      totalDocuments,
      totalSize,
      collections: collectionSchemas,
      extractedAt: new Date().toISOString()
    };
  }
}

/**
 * MongoDB Atlas 스키마 분석 메인 함수
 */
async function main() {
  try {
    console.log('🚀 MongoDB Atlas 스키마 분석 시작');
    
    // Atlas 연결
    const atlasUri = process.env.MONGODB_URI;
    if (!atlasUri) {
      throw new Error('MONGODB_URI 환경변수가 설정되지 않았습니다');
    }
    
    console.log('🔗 MongoDB Atlas에 연결 중...');
    await mongoose.connect(atlasUri);
    console.log('✅ Atlas 연결 성공');
    
    // 스키마 분석
    const analyzer = new AtlasSchemaAnalyzer(mongoose.connection);
    const databaseSchema = await analyzer.analyzeDatabaseSchema();
    
    // 결과 저장
    const outputDir = path.join(__dirname, '..', 'analysis');
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputFile = path.join(outputDir, 'atlas-schema.json');
    await fs.writeFile(outputFile, JSON.stringify(databaseSchema, null, 2), 'utf-8');
    
    console.log('\n📊 분석 결과 요약:');
    console.log(`- 데이터베이스: ${databaseSchema.databaseName}`);
    console.log(`- 총 컬렉션: ${databaseSchema.totalCollections}개`);
    console.log(`- 총 문서: ${databaseSchema.totalDocuments.toLocaleString()}개`);
    console.log(`- 총 크기: ${(databaseSchema.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- 분석 파일: ${outputFile}`);
    
    // 컬렉션별 상세 정보
    console.log('\n📋 컬렉션별 상세:');
    for (const [name, schema] of Object.entries(databaseSchema.collections)) {
      console.log(`  - ${name}: ${schema.documentCount.toLocaleString()}개 문서, ${Object.keys(schema.fields).length}개 필드, ${schema.indexes.length}개 인덱스`);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Atlas 스키마 분석 완료');
    
  } catch (error) {
    console.error('❌ Atlas 스키마 분석 실패:', error);
    process.exit(1);
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  main().catch(console.error);
}

export { AtlasSchemaAnalyzer, main }; 