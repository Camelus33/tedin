/**
 * Render 서버 시간대 설정 확인 및 모니터링 스크립트
 * TZ=Asia/Seoul 환경변수 적용 확인 및 시간 정확성 검증
 * 
 * @author Habitus33 Engineering Team
 * @version 1.0.0
 */

/**
 * 서버 시간대 정보 인터페이스
 */
interface TimezoneInfo {
  envTimezone: string | undefined;
  systemTimezone: string;
  currentTime: string;
  utcTime: string;
  timezoneOffset: number;
  isKoreanTime: boolean;
  processEnv: {
    TZ?: string;
    NODE_ENV?: string;
  };
}

/**
 * 현재 서버의 시간대 설정 상태를 종합적으로 분석
 * 
 * @returns 서버 시간대 정보 객체
 */
export function checkServerTimezone(): TimezoneInfo {
  const now = new Date();
  
  // 환경변수에서 설정된 시간대
  const envTimezone = process.env.TZ;
  
  // 시스템에서 인식하는 현재 시간대
  let systemTimezone: string;
  try {
    systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    systemTimezone = 'Unknown';
  }
  
  // 현재 시간 (로컬 시간대 기준)
  const currentTime = now.toISOString();
  
  // UTC 시간
  const utcTime = now.toUTCString();
  
  // 시간대 오프셋 (분 단위)
  const timezoneOffset = now.getTimezoneOffset();
  
  // 한국 시간대인지 확인 (UTC+9 = -540분)
  const isKoreanTime = timezoneOffset === -540 && 
                      (systemTimezone === 'Asia/Seoul' || envTimezone === 'Asia/Seoul');
  
  return {
    envTimezone,
    systemTimezone,
    currentTime,
    utcTime,
    timezoneOffset,
    isKoreanTime,
    processEnv: {
      TZ: process.env.TZ,
      NODE_ENV: process.env.NODE_ENV
    }
  };
}

/**
 * 서버 시간대 정보를 콘솔에 출력
 * 
 * @param info 시간대 정보 객체
 */
export function logTimezoneInfo(info: TimezoneInfo): void {
  console.log('\n🌏 Server Timezone Information');
  console.log('='.repeat(40));
  console.log(`🔧 Environment TZ: ${info.envTimezone || 'Not Set'}`);
  console.log(`🖥️ System Timezone: ${info.systemTimezone}`);
  console.log(`📅 Current Time: ${info.currentTime}`);
  console.log(`🌍 UTC Time: ${info.utcTime}`);
  console.log(`⏰ Timezone Offset: ${info.timezoneOffset} minutes (UTC${info.timezoneOffset > 0 ? '-' : '+'}${Math.abs(info.timezoneOffset / 60)})`);
  console.log(`🇰🇷 Korean Time: ${info.isKoreanTime ? '✅ YES' : '❌ NO'}`);
  console.log(`🏗️ NODE_ENV: ${info.processEnv.NODE_ENV || 'Not Set'}`);
  console.log('='.repeat(40));
  
  // 경고 메시지
  if (!info.isKoreanTime) {
    console.warn('⚠️ WARNING: Server is not using Korean timezone!');
    console.warn('   Expected: TZ=Asia/Seoul (UTC+9)');
    console.warn(`   Current: ${info.systemTimezone} (UTC${info.timezoneOffset > 0 ? '-' : '+'}${Math.abs(info.timezoneOffset / 60)})`);
  }
  
  if (!info.envTimezone) {
    console.warn('⚠️ WARNING: TZ environment variable is not set!');
    console.warn('   Add TZ=Asia/Seoul to render.yaml envVars');
  }
}

/**
 * 시간대 설정이 올바른지 검증
 * 
 * @returns 검증 결과 객체
 */
export function validateTimezoneSettings(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const info = checkServerTimezone();
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 필수 검증: 환경변수 TZ 설정
  if (!info.envTimezone) {
    errors.push('TZ environment variable is not set');
  } else if (info.envTimezone !== 'Asia/Seoul') {
    warnings.push(`TZ is set to '${info.envTimezone}' instead of 'Asia/Seoul'`);
  }
  
  // 필수 검증: 한국 시간대 적용
  if (!info.isKoreanTime) {
    errors.push('Server is not using Korean timezone (UTC+9)');
  }
  
  // 권장 검증: 시스템 시간대
  if (info.systemTimezone !== 'Asia/Seoul') {
    warnings.push(`System timezone is '${info.systemTimezone}' instead of 'Asia/Seoul'`);
  }
  
  // Render 환경 검증
  if (info.processEnv.NODE_ENV === 'production' && !info.isKoreanTime) {
    errors.push('Production environment must use Korean timezone');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 시간대 설정 문제 진단 및 해결 방안 제시
 */
export function diagnoseTimezoneIssues(): void {
  const validation = validateTimezoneSettings();
  const info = checkServerTimezone();
  
  console.log('\n🔍 Timezone Configuration Diagnosis');
  console.log('='.repeat(50));
  
  if (validation.isValid) {
    console.log('✅ All timezone settings are correct!');
  } else {
    console.log('❌ Timezone configuration issues detected:');
    validation.errors.forEach(error => {
      console.log(`   • ERROR: ${error}`);
    });
  }
  
  if (validation.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    validation.warnings.forEach(warning => {
      console.log(`   • ${warning}`);
    });
  }
  
  // 해결 방안 제시
  if (!validation.isValid) {
    console.log('\n🛠️ Recommended Solutions:');
    
    if (!info.envTimezone) {
      console.log('   1. Add to render.yaml:');
      console.log('      envVars:');
      console.log('        - key: TZ');
      console.log('          value: "Asia/Seoul"');
    }
    
    if (!info.isKoreanTime) {
      console.log('   2. Redeploy the service after updating render.yaml');
      console.log('   3. Verify the change with: npm run check-timezone');
    }
    
    console.log('   4. Monitor server logs during deployment');
    console.log('   5. Test with sample API calls to verify time accuracy');
  }
  
  console.log('='.repeat(50));
}

/**
 * 샘플 시간 생성 및 테스트
 * 다양한 시간 생성 방식으로 일관성 확인
 */
export function testTimeConsistency(): void {
  console.log('\n🧪 Time Consistency Test');
  console.log('='.repeat(30));
  
  const now = new Date();
  
  // 다양한 방식으로 시간 생성
  const timestamps = {
    'Date.now()': new Date(Date.now()).toISOString(),
    'new Date()': now.toISOString(),
    'new Date().toLocaleString()': now.toLocaleString(),
    'new Date().toLocaleString("ko-KR")': now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    'Explicit Asia/Seoul': now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
  };
  
  Object.entries(timestamps).forEach(([method, time]) => {
    console.log(`${method.padEnd(25)}: ${time}`);
  });
  
  console.log('='.repeat(30));
}

// 개발 환경에서 직접 실행 가능
if (require.main === module) {
  const info = checkServerTimezone();
  logTimezoneInfo(info);
  diagnoseTimezoneIssues();
  testTimeConsistency();
} 