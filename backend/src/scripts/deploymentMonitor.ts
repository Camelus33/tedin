/**
 * 시간 기록 시스템 배포 후 실시간 모니터링 스크립트
 * 핵심 KPI 추적 및 이상 상황 감지
 * 
 * @author Habitus33 Engineering Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import Note from '../models/Note';

/**
 * 모니터링 메트릭 인터페이스
 */
interface MonitoringMetrics {
  timestamp: Date;
  timeAccuracy: {
    totalNotes: number;
    clientTimeUsage: number;  // 클라이언트 시간 사용률 (%)
    serverFallbackRate: number; // 서버 시간 fallback 비율 (%)
    averageTimeDiff: number; // 평균 시간 차이 (분)
  };
  performance: {
    avgResponseTime: number; // 평균 응답시간 (ms)
    queryPerformance: number; // 쿼리 성능 (ms)
    memoryUsage: number; // 메모리 사용률 (%)
    cpuUsage: number; // CPU 사용률 (%)
  };
  errors: {
    timeProcessingErrors: number; // 시간 처리 오류 수
    apiErrors: number; // API 오류 수
    dbConnectionErrors: number; // DB 연결 오류 수
  };
  health: {
    serverStatus: 'healthy' | 'warning' | 'critical';
    dbStatus: 'connected' | 'disconnected' | 'slow';
    timezoneStatus: 'correct' | 'incorrect';
  };
}

/**
 * 알람 레벨 정의
 */
enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

/**
 * 알람 인터페이스
 */
interface Alert {
  level: AlertLevel;
  metric: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

/**
 * 시간 정확성 메트릭 수집
 */
async function collectTimeAccuracyMetrics(): Promise<MonitoringMetrics['timeAccuracy']> {
  try {
    // 최근 1시간 내 생성된 노트 분석
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    // 전체 노트 수
    const totalNotes = await Note.countDocuments({
      createdAt: { $gte: oneHourAgo }
    });
    
    // 클라이언트 시간이 있는 노트 수
    const clientTimeNotes = await Note.countDocuments({
      createdAt: { $gte: oneHourAgo },
      clientCreatedAt: { $exists: true, $ne: null }
    });
    
    // 클라이언트 시간 사용률 계산
    const clientTimeUsage = totalNotes > 0 ? (clientTimeNotes / totalNotes) * 100 : 0;
    const serverFallbackRate = 100 - clientTimeUsage;
    
    // 시간 차이 분석 (클라이언트 시간이 있는 노트만)
    let averageTimeDiff = 0;
    if (clientTimeNotes > 0) {
      const notesWithTimeDiff = await Note.aggregate([
        {
          $match: {
            createdAt: { $gte: oneHourAgo },
            clientCreatedAt: { $exists: true, $ne: null }
          }
        },
        {
          $project: {
            timeDiff: {
              $divide: [
                { $subtract: ['$clientCreatedAt', '$createdAt'] },
                60000 // 밀리초를 분으로 변환
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgTimeDiff: { $avg: '$timeDiff' }
          }
        }
      ]);
      
      averageTimeDiff = notesWithTimeDiff.length > 0 ? Math.abs(notesWithTimeDiff[0].avgTimeDiff) : 0;
    }
    
    return {
      totalNotes,
      clientTimeUsage: Math.round(clientTimeUsage * 100) / 100,
      serverFallbackRate: Math.round(serverFallbackRate * 100) / 100,
      averageTimeDiff: Math.round(averageTimeDiff * 100) / 100
    };
    
  } catch (error) {
    console.error('시간 정확성 메트릭 수집 오류:', error);
    return {
      totalNotes: 0,
      clientTimeUsage: 0,
      serverFallbackRate: 100,
      averageTimeDiff: 0
    };
  }
}

/**
 * 성능 메트릭 수집
 */
async function collectPerformanceMetrics(): Promise<MonitoringMetrics['performance']> {
  try {
    // 메모리 사용량
    const memoryUsage = process.memoryUsage();
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    // 데이터베이스 쿼리 성능 측정
    const queryStart = Date.now();
    await Note.findOne({}).lean();
    const queryPerformance = Date.now() - queryStart;
    
    // CPU 사용률 (간접 측정 - 프로세스 시간 기반)
    const cpuUsage = process.cpuUsage();
    const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // 마이크로초를 초로 변환
    
    return {
      avgResponseTime: queryPerformance, // 단일 쿼리 기준
      queryPerformance,
      memoryUsage: Math.round(memoryPercent * 100) / 100,
      cpuUsage: Math.round(cpuPercent * 100) / 100
    };
    
  } catch (error) {
    console.error('성능 메트릭 수집 오류:', error);
    return {
      avgResponseTime: -1,
      queryPerformance: -1,
      memoryUsage: -1,
      cpuUsage: -1
    };
  }
}

/**
 * 오류 메트릭 수집 (로그 기반)
 */
async function collectErrorMetrics(): Promise<MonitoringMetrics['errors']> {
  // 실제 구현에서는 로그 파일이나 외부 로깅 시스템을 분석
  // 여기서는 간단한 예시로 대체
  return {
    timeProcessingErrors: 0,
    apiErrors: 0,
    dbConnectionErrors: 0
  };
}

/**
 * 시스템 건강 상태 확인
 */
async function checkSystemHealth(): Promise<MonitoringMetrics['health']> {
  try {
    // 데이터베이스 연결 상태
    const dbState = mongoose.connection.readyState;
    let dbStatus: MonitoringMetrics['health']['dbStatus'] = 'disconnected';
    
    if (dbState === 1) {
      // 연결 성능 테스트
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      const pingTime = Date.now() - start;
      
      dbStatus = pingTime < 100 ? 'connected' : 'slow';
    }
    
    // 시간대 설정 확인
    const isKoreanTime = process.env.TZ === 'Asia/Seoul' && 
                        new Date().getTimezoneOffset() === -540;
    const timezoneStatus: MonitoringMetrics['health']['timezoneStatus'] = 
      isKoreanTime ? 'correct' : 'incorrect';
    
    // 전체 서버 상태 판단
    let serverStatus: MonitoringMetrics['health']['serverStatus'] = 'healthy';
    if (dbStatus === 'disconnected' || timezoneStatus === 'incorrect') {
      serverStatus = 'critical';
    } else if (dbStatus === 'slow') {
      serverStatus = 'warning';
    }
    
    return {
      serverStatus,
      dbStatus,
      timezoneStatus
    };
    
  } catch (error) {
    console.error('시스템 건강 상태 확인 오류:', error);
    return {
      serverStatus: 'critical',
      dbStatus: 'disconnected',
      timezoneStatus: 'incorrect'
    };
  }
}

/**
 * 종합 메트릭 수집
 */
export async function collectAllMetrics(): Promise<MonitoringMetrics> {
  console.log('📊 메트릭 수집 시작...');
  
  const [timeAccuracy, performance, errors, health] = await Promise.all([
    collectTimeAccuracyMetrics(),
    collectPerformanceMetrics(),
    collectErrorMetrics(),
    checkSystemHealth()
  ]);
  
  return {
    timestamp: new Date(),
    timeAccuracy,
    performance,
    errors,
    health
  };
}

/**
 * 알람 조건 확인
 */
export function checkAlerts(metrics: MonitoringMetrics): Alert[] {
  const alerts: Alert[] = [];
  
  // Critical 알람
  if (metrics.health.serverStatus === 'critical') {
    alerts.push({
      level: AlertLevel.CRITICAL,
      metric: 'server_status',
      message: '서버 상태가 위험합니다',
      value: 0,
      threshold: 1,
      timestamp: new Date()
    });
  }
  
  if (metrics.timeAccuracy.serverFallbackRate > 20) {
    alerts.push({
      level: AlertLevel.CRITICAL,
      metric: 'client_time_usage',
      message: '클라이언트 시간 사용률이 너무 낮습니다',
      value: metrics.timeAccuracy.clientTimeUsage,
      threshold: 80,
      timestamp: new Date()
    });
  }
  
  if (metrics.performance.queryPerformance > 1000) {
    alerts.push({
      level: AlertLevel.CRITICAL,
      metric: 'query_performance',
      message: '데이터베이스 쿼리 성능이 저하되었습니다',
      value: metrics.performance.queryPerformance,
      threshold: 1000,
      timestamp: new Date()
    });
  }
  
  // Warning 알람
  if (metrics.timeAccuracy.clientTimeUsage < 80) {
    alerts.push({
      level: AlertLevel.WARNING,
      metric: 'client_time_usage',
      message: '클라이언트 시간 사용률이 낮습니다',
      value: metrics.timeAccuracy.clientTimeUsage,
      threshold: 80,
      timestamp: new Date()
    });
  }
  
  if (metrics.timeAccuracy.averageTimeDiff > 60) {
    alerts.push({
      level: AlertLevel.WARNING,
      metric: 'time_difference',
      message: '평균 시간 차이가 1시간을 초과합니다',
      value: metrics.timeAccuracy.averageTimeDiff,
      threshold: 60,
      timestamp: new Date()
    });
  }
  
  if (metrics.performance.memoryUsage > 80) {
    alerts.push({
      level: AlertLevel.WARNING,
      metric: 'memory_usage',
      message: '메모리 사용률이 높습니다',
      value: metrics.performance.memoryUsage,
      threshold: 80,
      timestamp: new Date()
    });
  }
  
  return alerts;
}

/**
 * 메트릭 출력 (콘솔 대시보드)
 */
export function displayMetrics(metrics: MonitoringMetrics, alerts: Alert[]): void {
  console.clear();
  console.log('🚀 Habitus33 시간 기록 시스템 모니터링 대시보드');
  console.log('='.repeat(60));
  console.log(`📅 업데이트: ${metrics.timestamp.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);
  console.log('');
  
  // 시스템 건강 상태
  const healthIcon = {
    'healthy': '✅',
    'warning': '⚠️',
    'critical': '🚨'
  }[metrics.health.serverStatus];
  
  console.log(`${healthIcon} 시스템 상태: ${metrics.health.serverStatus.toUpperCase()}`);
  console.log(`🗄️ 데이터베이스: ${metrics.health.dbStatus}`);
  console.log(`🌏 시간대 설정: ${metrics.health.timezoneStatus}`);
  console.log('');
  
  // 시간 정확성 지표
  console.log('📊 시간 정확성 지표');
  console.log('-'.repeat(30));
  console.log(`총 메모 수 (1시간): ${metrics.timeAccuracy.totalNotes.toLocaleString()}`);
  console.log(`클라이언트 시간 사용률: ${metrics.timeAccuracy.clientTimeUsage}%`);
  console.log(`서버 시간 fallback: ${metrics.timeAccuracy.serverFallbackRate}%`);
  console.log(`평균 시간 차이: ${metrics.timeAccuracy.averageTimeDiff}분`);
  console.log('');
  
  // 성능 지표
  console.log('⚡ 성능 지표');
  console.log('-'.repeat(30));
  console.log(`쿼리 성능: ${metrics.performance.queryPerformance}ms`);
  console.log(`메모리 사용률: ${metrics.performance.memoryUsage}%`);
  console.log(`CPU 사용률: ${metrics.performance.cpuUsage}%`);
  console.log('');
  
  // 알람
  if (alerts.length > 0) {
    console.log('🚨 활성 알람');
    console.log('-'.repeat(30));
    alerts.forEach(alert => {
      const icon = {
        [AlertLevel.CRITICAL]: '🔴',
        [AlertLevel.WARNING]: '🟡',
        [AlertLevel.INFO]: '🔵'
      }[alert.level];
      
      console.log(`${icon} [${alert.level.toUpperCase()}] ${alert.message}`);
      console.log(`   값: ${alert.value}, 임계값: ${alert.threshold}`);
    });
  } else {
    console.log('✅ 활성 알람 없음');
  }
  
  console.log('');
  console.log('🔄 5초마다 자동 업데이트됩니다...');
  console.log('Ctrl+C로 종료');
}

/**
 * 지속적 모니터링 실행
 */
export async function startContinuousMonitoring(intervalSeconds: number = 5): Promise<void> {
  console.log('🚀 시간 기록 시스템 모니터링 시작');
  console.log(`📊 ${intervalSeconds}초 간격으로 메트릭을 수집합니다`);
  
  const monitoringLoop = async () => {
    try {
      const metrics = await collectAllMetrics();
      const alerts = checkAlerts(metrics);
      displayMetrics(metrics, alerts);
      
      // Critical 알람이 있으면 추가 로깅
      const criticalAlerts = alerts.filter(a => a.level === AlertLevel.CRITICAL);
      if (criticalAlerts.length > 0) {
        console.error('🚨 CRITICAL 알람 감지:', criticalAlerts);
      }
      
    } catch (error) {
      console.error('모니터링 오류:', error);
    }
  };
  
  // 초기 실행
  await monitoringLoop();
  
  // 주기적 실행
  const interval = setInterval(monitoringLoop, intervalSeconds * 1000);
  
  // 종료 처리
  process.on('SIGINT', () => {
    console.log('\n모니터링을 종료합니다...');
    clearInterval(interval);
    process.exit(0);
  });
}

/**
 * 단일 메트릭 수집 및 출력
 */
export async function runSingleCheck(): Promise<void> {
  try {
    const metrics = await collectAllMetrics();
    const alerts = checkAlerts(metrics);
    displayMetrics(metrics, alerts);
    
    // 결과 요약
    console.log('\n📋 요약');
    console.log('-'.repeat(20));
    
    if (metrics.health.serverStatus === 'healthy' && alerts.length === 0) {
      console.log('✅ 모든 시스템이 정상 작동 중입니다');
    } else {
      console.log(`⚠️ ${alerts.length}개의 알람이 감지되었습니다`);
      console.log(`🏥 시스템 상태: ${metrics.health.serverStatus}`);
    }
    
  } catch (error) {
    console.error('메트릭 수집 실패:', error);
    process.exit(1);
  }
}

// 개발 환경에서 직접 실행
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'single';
  
  if (command === 'continuous') {
    const interval = parseInt(args[1]) || 5;
    startContinuousMonitoring(interval);
  } else {
    runSingleCheck().then(() => {
      process.exit(0);
    });
  }
} 