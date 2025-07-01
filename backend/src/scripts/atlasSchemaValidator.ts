/**
 * MongoDB Atlas 스키마 변경 검증 및 모니터링 스크립트
 * 실제 프로덕션 환경에서 안전한 배포를 위한 검증 도구
 * 
 * @author Habitus33 Engineering Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import Note from '../models/Note';

/**
 * Atlas 연결 상태 확인
 */
async function checkAtlasConnection(): Promise<boolean> {
  try {
    const state = mongoose.connection.readyState;
    console.log(`[Atlas 연결] 상태: ${getConnectionStateText(state)}`);
    
    if (state === 1) { // Connected
      const db = mongoose.connection.db;
      const admin = db.admin();
      const serverStatus = await admin.serverStatus();
      
      console.log(`[Atlas 정보] 호스트: ${serverStatus.host}`);
      console.log(`[Atlas 정보] 버전: ${serverStatus.version}`);
      console.log(`[Atlas 정보] 업타임: ${Math.floor(serverStatus.uptime / 3600)}시간`);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[Atlas 연결] 확인 실패:', error);
    return false;
  }
}

/**
 * 연결 상태 텍스트 변환
 */
function getConnectionStateText(state: number): string {
  const states = {
    0: 'Disconnected',
    1: 'Connected', 
    2: 'Connecting',
    3: 'Disconnecting'
  };
  return states[state as keyof typeof states] || 'Unknown';
}

/**
 * Note 컬렉션 스키마 검증
 */
async function validateNoteSchema(): Promise<{
  isValid: boolean;
  details: string[];
  warnings: string[];
}> {
  const details: string[] = [];
  const warnings: string[] = [];
  let isValid = true;
  
  try {
    // 1. 컬렉션 존재 확인
    const collections = await mongoose.connection.db.listCollections({ name: 'notes' }).toArray();
    if (collections.length === 0) {
      warnings.push('Notes 컬렉션이 존재하지 않습니다 (첫 Note 생성 시 자동 생성됨)');
    } else {
      details.push('✅ Notes 컬렉션 존재 확인');
    }
    
    // 2. 인덱스 상태 확인
    const noteIndexes = await Note.collection.getIndexes();
    details.push(`✅ 현재 인덱스 개수: ${Object.keys(noteIndexes).length}개`);
    
    // 필수 인덱스 확인
    const requiredIndexes = [
      'userId_1_clientCreatedAt_-1',
      'userId_1_bookId_1_clientCreatedAt_-1'
    ];
    
    const existingIndexNames = Object.keys(noteIndexes);
    
    for (const requiredIndex of requiredIndexes) {
      if (existingIndexNames.includes(requiredIndex)) {
        details.push(`✅ 새 인덱스 존재: ${requiredIndex}`);
      } else {
        warnings.push(`⚠️ 새 인덱스 없음: ${requiredIndex} (배포 후 자동 생성됨)`);
      }
    }
    
    // 3. 샘플 데이터로 스키마 호환성 테스트
    const sampleCount = await Note.countDocuments().limit(1);
    if (sampleCount > 0) {
      const sampleNote = await Note.findOne().select('createdAt clientCreatedAt').lean();
      
      if (sampleNote) {
        details.push(`✅ 기존 데이터 호환성: createdAt=${!!sampleNote.createdAt}`);
        details.push(`✅ 새 필드 상태: clientCreatedAt=${sampleNote.clientCreatedAt ? '존재' : 'null (정상)'}`);
      }
    } else {
      details.push('ℹ️ Note 컬렉션이 비어있음 (첫 메모 생성 시 스키마 적용)');
    }
    
  } catch (error) {
    isValid = false;
    details.push(`❌ 스키마 검증 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
  
  return { isValid, details, warnings };
}

/**
 * Atlas 성능 지표 확인
 */
async function checkAtlasPerformance(): Promise<{
  connectionCount: number;
  memoryUsage: any;
  operationStats: any;
}> {
  try {
    const db = mongoose.connection.db;
    const admin = db.admin();
    const serverStatus = await admin.serverStatus();
    
    return {
      connectionCount: serverStatus.connections?.current || 0,
      memoryUsage: {
        resident: serverStatus.mem?.resident || 0,
        virtual: serverStatus.mem?.virtual || 0,
        mapped: serverStatus.mem?.mapped || 0
      },
      operationStats: {
        insert: serverStatus.opcounters?.insert || 0,
        query: serverStatus.opcounters?.query || 0,
        update: serverStatus.opcounters?.update || 0,
        delete: serverStatus.opcounters?.delete || 0
      }
    };
  } catch (error) {
    console.warn('[성능 지표] 조회 실패:', error);
    return {
      connectionCount: 0,
      memoryUsage: {},
      operationStats: {}
    };
  }
}

/**
 * 실제 시간 기록 테스트
 */
async function testTimeRecording(): Promise<{
  success: boolean;
  serverTime: string;
  testResult: string;
}> {
  const serverTime = new Date().toISOString();
  
  try {
    // 실제 환경에서는 테스트 데이터를 생성하지 않으므로,
    // 스키마 정의만 검증
    const schema = Note.schema;
    const clientCreatedAtField = schema.path('clientCreatedAt');
    
    if (clientCreatedAtField) {
      return {
        success: true,
        serverTime,
        testResult: '✅ clientCreatedAt 필드 스키마 정의 확인됨'
      };
    } else {
      return {
        success: false,
        serverTime,
        testResult: '❌ clientCreatedAt 필드 스키마 정의 없음'
      };
    }
  } catch (error) {
    return {
      success: false,
      serverTime,
      testResult: `❌ 테스트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    };
  }
}

/**
 * 전체 Atlas 환경 검증 실행
 */
export async function validateAtlasEnvironment(): Promise<void> {
  console.log('\n🚀 MongoDB Atlas 스키마 변경 검증 시작');
  console.log('='.repeat(50));
  
  // 1. Atlas 연결 확인
  console.log('\n📡 Atlas 연결 상태 확인');
  const isConnected = await checkAtlasConnection();
  
  if (!isConnected) {
    console.error('❌ Atlas 연결 실패 - 검증 중단');
    return;
  }
  
  // 2. 스키마 검증
  console.log('\n📋 Note 스키마 검증');
  const schemaValidation = await validateNoteSchema();
  
  schemaValidation.details.forEach(detail => console.log(detail));
  
  if (schemaValidation.warnings.length > 0) {
    console.log('\n⚠️ 경고사항:');
    schemaValidation.warnings.forEach(warning => console.log(warning));
  }
  
  // 3. 성능 지표 확인
  console.log('\n📊 Atlas 성능 지표');
  const performance = await checkAtlasPerformance();
  console.log(`연결 수: ${performance.connectionCount}`);
  console.log(`메모리 사용량: ${performance.memoryUsage.resident || 'N/A'}MB`);
  console.log(`총 쿼리 수: ${performance.operationStats.query || 'N/A'}`);
  
  // 4. 시간 기록 테스트
  console.log('\n🕐 시간 기록 시스템 테스트');
  const timeTest = await testTimeRecording();
  console.log(`서버 시간: ${timeTest.serverTime}`);
  console.log(timeTest.testResult);
  
  // 5. 최종 결과
  console.log('\n✅ Atlas 환경 검증 완료');
  console.log('='.repeat(50));
  
  if (schemaValidation.isValid && timeTest.success) {
    console.log('🎉 모든 검증 통과 - 배포 준비 완료');
  } else {
    console.log('⚠️ 일부 검증 실패 - 확인 필요');
  }
}

/**
 * Atlas 인덱스 생성 모니터링
 */
export async function monitorIndexCreation(): Promise<void> {
  console.log('\n🔍 Atlas 인덱스 생성 모니터링 시작');
  
  try {
    const indexes = await Note.collection.getIndexes();
    
    console.log('\n현재 인덱스 목록:');
    Object.entries(indexes).forEach(([name, spec]) => {
      console.log(`- ${name}: ${JSON.stringify(spec.key)}`);
    });
    
    // 인덱스 통계
    const stats = await Note.collection.stats();
    console.log(`\n인덱스 총 크기: ${Math.round(stats.totalIndexSize / 1024)}KB`);
    console.log(`인덱스 개수: ${stats.nindexes}`);
    
  } catch (error) {
    console.error('인덱스 모니터링 실패:', error);
  }
}

// 개발 환경에서 직접 실행 가능
if (require.main === module) {
  import('../database').then(({ connectToDatabase }) => {
    connectToDatabase()
      .then(() => validateAtlasEnvironment())
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('검증 실행 실패:', error);
        process.exit(1);
      });
  });
} 