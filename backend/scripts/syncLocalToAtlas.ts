import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

interface SchemaSyncAction {
  action: 'create_collection' | 'add_field' | 'create_index' | 'fix_type' | 'update_requirement';
  collectionName: string;
  details: any;
  priority: 'high' | 'medium' | 'low';
  command?: string;
}

interface SyncReport {
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  skippedActions: number;
  errors: Array<{ action: SchemaSyncAction; error: string }>;
  executionTime: number;
}

class MongoDBSchemaSynchronizer {
  private db: mongoose.Connection;
  private backupPath: string;
  private dryRun: boolean;

  constructor(db: mongoose.Connection, dryRun = false) {
    this.db = db;
    this.dryRun = dryRun;
    this.backupPath = path.join(__dirname, '..', 'backups', `local-backup-${Date.now()}.json`);
  }

  /**
   * 백업 생성
   */
  async createBackup(): Promise<void> {
    console.log('🔄 로컬 MongoDB 백업 생성 중...');
    
    const backupData: any = {
      timestamp: new Date().toISOString(),
      collections: {}
    };

    const collections = await this.db.db.listCollections().toArray();
    
    for (const collection of collections) {
      const collectionName = collection.name;
      const documents = await this.db.collection(collectionName).find({}).toArray();
      const indexes = await this.db.collection(collectionName).listIndexes().toArray();
      
      backupData.collections[collectionName] = {
        documents,
        indexes,
        count: documents.length
      };
      
      console.log(`  ✅ ${collectionName}: ${documents.length}개 문서 백업`);
    }

    // 백업 디렉토리 생성
    const backupDir = path.dirname(this.backupPath);
    await fs.mkdir(backupDir, { recursive: true });
    
    // 백업 파일 저장
    await fs.writeFile(this.backupPath, JSON.stringify(backupData, null, 2));
    console.log(`📦 백업 완료: ${this.backupPath}`);
  }

  /**
   * 스키마 비교 결과 로드
   */
  async loadComparisonResult(): Promise<any> {
    const comparisonPath = path.join(__dirname, '..', 'analysis', 'schema-comparison.json');
    const comparisonData = await fs.readFile(comparisonPath, 'utf-8');
    return JSON.parse(comparisonData);
  }

  /**
   * 동기화 액션 생성 - 이미 생성된 syncPlan 활용
   */
  generateSyncActions(comparisonResult: any): SchemaSyncAction[] {
    const actions: SchemaSyncAction[] = [];
    
    // syncPlan에서 액션들을 변환
    if (comparisonResult.syncPlan && Array.isArray(comparisonResult.syncPlan)) {
      for (const planItem of comparisonResult.syncPlan) {
        let action: SchemaSyncAction;
        
        switch (planItem.operation) {
          case 'create_collection':
            action = {
              action: 'create_collection',
              collectionName: planItem.collection,
              details: planItem.details,
              priority: planItem.priority as 'high' | 'medium' | 'low',
              command: planItem.mongoCommand
            };
            break;
            
          case 'add_field':
            action = {
              action: 'add_field',
              collectionName: planItem.collection,
              details: {
                fieldName: planItem.field,
                fieldType: planItem.details?.type || 'mixed',
                isRequired: planItem.details?.isRequired || false,
                hasDefault: planItem.details?.hasDefault || false,
                defaultValue: planItem.details?.defaultValue
              },
              priority: planItem.priority as 'high' | 'medium' | 'low',
              command: planItem.mongoCommand
            };
            break;
            
          case 'create_index':
            action = {
              action: 'create_index',
              collectionName: planItem.collection,
              details: {
                indexName: planItem.index,
                keys: planItem.details?.keys || {},
                unique: planItem.details?.unique || false,
                sparse: planItem.details?.sparse || false,
                weights: planItem.details?.weights // 텍스트 인덱스 weights (있을 때만)
              },
              priority: planItem.priority as 'high' | 'medium' | 'low',
              command: planItem.mongoCommand
            };
            break;
            
          default:
            // drop_index 같은 기타 작업들은 건너뛰기 (필요시 수동 처리)
            continue;
        }
        
        actions.push(action);
      }
    }

    return actions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * 누락된 컬렉션 생성
   */
  async createCollection(action: SchemaSyncAction): Promise<boolean> {
    try {
      const collectionName = action.collectionName;
      
      if (this.dryRun) {
        console.log(`[DRY RUN] 컬렉션 생성: ${collectionName}`);
        return true;
      }

      // 컬렉션이 이미 존재하는지 확인
      const collections = await this.db.db.listCollections({ name: collectionName }).toArray();
      if (collections.length > 0) {
        console.log(`⚠️  컬렉션 ${collectionName}이 이미 존재합니다.`);
        return true;
      }

      // 컬렉션 생성
      await this.db.db.createCollection(collectionName);
      console.log(`✅ 컬렉션 생성: ${collectionName}`);
      return true;
    } catch (error) {
      console.error(`❌ 컬렉션 생성 실패 (${action.collectionName}):`, error);
      return false;
    }
  }

  /**
   * 누락된 필드 추가 (기본값으로)
   */
  async addField(action: SchemaSyncAction): Promise<boolean> {
    try {
      const { collectionName, details } = action;
      const { fieldName, defaultValue, isRequired } = details;
      
      if (this.dryRun) {
        console.log(`[DRY RUN] 필드 추가: ${collectionName}.${fieldName}`);
        return true;
      }

      const collection = this.db.collection(collectionName);
      
      // 컬렉션에 문서가 있는지 확인
      const documentCount = await collection.countDocuments();
      if (documentCount === 0) {
        console.log(`⚠️  ${collectionName}에 문서가 없어 필드 추가를 건너뜁니다: ${fieldName}`);
        return true;
      }

      // 기본값 설정
      let updateValue = defaultValue;
      if (updateValue === undefined || updateValue === null) {
        // 타입에 따른 기본값
        switch (details.fieldType) {
          case 'string':
            updateValue = '';
            break;
          case 'number':
            updateValue = 0;
            break;
          case 'boolean':
            updateValue = false;
            break;
          case 'object':
            updateValue = {};
            break;
          case 'array':
            updateValue = [];
            break;
          case 'date':
            updateValue = new Date();
            break;
          default:
            updateValue = null;
        }
      }

      // 필드가 없는 문서에만 기본값 추가
      const updateQuery = { [fieldName]: { $exists: false } };
      const updateOperation = { $set: { [fieldName]: updateValue } };
      
      const result = await collection.updateMany(updateQuery, updateOperation);
      
      console.log(`✅ 필드 추가: ${collectionName}.${fieldName} (${result.modifiedCount}개 문서 업데이트)`);
      return true;
    } catch (error) {
      console.error(`❌ 필드 추가 실패 (${action.collectionName}.${action.details.fieldName}):`, error);
      return false;
    }
  }

  /**
   * 누락된 인덱스 생성
   */
  async createIndex(action: SchemaSyncAction): Promise<boolean> {
    try {
      const { collectionName, details } = action;
      const { indexName, keys, unique, sparse, weights } = details;
      
      if (this.dryRun) {
        console.log(`[DRY RUN] 인덱스 생성: ${collectionName}.${indexName}`);
        return true;
      }

      const collection = this.db.collection(collectionName);
      
      // 인덱스 옵션 구성
      const indexOptions: any = { name: indexName };
      if (unique) indexOptions.unique = true;
      if (sparse) indexOptions.sparse = true;
      if (weights && Object.keys(weights).length > 0) indexOptions.weights = weights;
      
      // 인덱스 생성
      await collection.createIndex(keys, indexOptions);
      console.log(`✅ 인덱스 생성: ${collectionName}.${indexName}`);
      return true;
    } catch (error) {
      console.error(`❌ 인덱스 생성 실패 (${action.collectionName}.${action.details.indexName}):`, error);
      return false;
    }
  }

  /**
   * 단일 액션 실행
   */
  async executeAction(action: SchemaSyncAction): Promise<boolean> {
    switch (action.action) {
      case 'create_collection':
        return await this.createCollection(action);
      case 'add_field':
        return await this.addField(action);
      case 'create_index':
        return await this.createIndex(action);
      case 'fix_type':
      case 'update_requirement':
        console.log(`⚠️  ${action.action} 액션은 수동 처리가 필요합니다: ${action.collectionName}`);
        return true; // 수동 처리 필요한 항목은 성공으로 간주
      default:
        console.error(`❌ 알 수 없는 액션: ${action.action}`);
        return false;
    }
  }

  /**
   * 전체 동기화 실행
   */
  async executeSynchronization(): Promise<SyncReport> {
    const startTime = Date.now();
    const report: SyncReport = {
      totalActions: 0,
      successfulActions: 0,
      failedActions: 0,
      skippedActions: 0,
      errors: [],
      executionTime: 0
    };

    try {
      console.log('🚀 MongoDB 스키마 동기화 시작');
      
      // 1. 백업 생성
      await this.createBackup();
      
      // 2. 비교 결과 로드
      const comparisonResult = await this.loadComparisonResult();
      
      // 3. 동기화 액션 생성
      const actions = this.generateSyncActions(comparisonResult);
      report.totalActions = actions.length;
      
      console.log(`\n📋 실행할 동기화 액션: ${actions.length}개`);
      console.log(`   - 높은 우선순위: ${actions.filter(a => a.priority === 'high').length}개`);
      console.log(`   - 중간 우선순위: ${actions.filter(a => a.priority === 'medium').length}개`);
      console.log(`   - 낮은 우선순위: ${actions.filter(a => a.priority === 'low').length}개`);
      
      if (this.dryRun) {
        console.log('\n🔍 DRY RUN 모드: 실제 변경사항은 적용되지 않습니다.\n');
      } else {
        console.log('\n⚠️  실제 변경사항이 적용됩니다!\n');
      }

      // 4. 액션 순차 실행
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        console.log(`\n⏳ (${i + 1}/${actions.length}) [${action.priority.toUpperCase()}] ${action.action}: ${action.collectionName}`);
        
        try {
          const success = await this.executeAction(action);
          if (success) {
            report.successfulActions++;
          } else {
            report.failedActions++;
            report.errors.push({ action, error: 'Action returned false' });
          }
        } catch (error) {
          report.failedActions++;
          report.errors.push({ action, error: error instanceof Error ? error.message : String(error) });
          console.error(`❌ 액션 실행 중 오류:`, error);
        }
      }

      report.executionTime = Date.now() - startTime;
      
      // 5. 결과 보고서 출력
      console.log('\n📊 동기화 완료 보고서:');
      console.log(`- 총 액션: ${report.totalActions}개`);
      console.log(`- 성공: ${report.successfulActions}개`);
      console.log(`- 실패: ${report.failedActions}개`);
      console.log(`- 건너뜀: ${report.skippedActions}개`);
      console.log(`- 실행 시간: ${(report.executionTime / 1000).toFixed(2)}초`);
      
      if (report.errors.length > 0) {
        console.log('\n❌ 오류 목록:');
        report.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error.action.collectionName} (${error.action.action}): ${error.error}`);
        });
      }

      // 6. 보고서 저장
      const reportPath = path.join(__dirname, '..', 'analysis', 'sync-report.json');
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 보고서 저장: ${reportPath}`);

      return report;
      
    } catch (error) {
      console.error('❌ 동기화 중 치명적 오류:', error);
      report.executionTime = Date.now() - startTime;
      throw error;
    }
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/habitus33';
  
  try {
    console.log(`🚀 MongoDB 스키마 동기화 시작 ${isDryRun ? '(DRY RUN)' : '(실제 적용)'}`);
    console.log(`🔗 연결 대상: ${mongoUri}`);
    
    // MongoDB 연결
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공');
    
    // 동기화 실행
    const synchronizer = new MongoDBSchemaSynchronizer(mongoose.connection, isDryRun);
    const report = await synchronizer.executeSynchronization();
    
    // 성공 여부 확인
    const successRate = (report.successfulActions / report.totalActions) * 100;
    if (successRate >= 90) {
      console.log(`\n🎉 동기화 성공! (${successRate.toFixed(1)}% 성공률)`);
    } else {
      console.log(`\n⚠️  부분적 성공 (${successRate.toFixed(1)}% 성공률)`);
    }
    
    await mongoose.disconnect();
    console.log('✅ MongoDB 연결 해제');
    
  } catch (error) {
    console.error('❌ 동기화 실패:', error);
    process.exit(1);
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  main().catch(console.error);
}

export { MongoDBSchemaSynchronizer, main }; 