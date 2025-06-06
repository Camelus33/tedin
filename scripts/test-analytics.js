#!/usr/bin/env node

/**
 * 브레인 역량 분석 API 통합 테스트 스크립트
 * 
 * 사용법:
 * node scripts/test-analytics.js [--env=development|production]
 */

const fetch = require('node-fetch');
const chalk = require('chalk');

// 기본 설정
const ENV = process.argv.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'development';
const API_BASE_URL = ENV === 'production' 
  ? 'https://habitus33-api.onrender.com' 
  : 'http://localhost:8000';

// 테스트 토큰 (개발 환경용)
const TEST_TOKEN = 'your_test_token_here'; // 실제 개발 시 테스트 토큰으로 변경

async function testCognitiveMetricsAPI() {
  console.log(chalk.blue.bold('브레인 역량 분석 API 테스트 시작'));
  console.log(chalk.gray(`환경: ${ENV}`));
  console.log(chalk.gray(`API URL: ${API_BASE_URL}`));
  
  try {
    // 1. API 엔드포인트 가용성 테스트
    console.log(chalk.yellow('\n1. API 서버 가용성 테스트'));
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
      if (healthResponse.ok) {
        console.log(chalk.green('✓ API 서버가 응답합니다.'));
      } else {
        console.log(chalk.red(`✗ API 서버 응답 오류: ${healthResponse.status}`));
      }
    } catch (error) {
      console.log(chalk.red(`✗ API 서버 연결 실패: ${error.message}`));
      process.exit(1);
    }
    
    // 2. 인지 지표 API 테스트
    console.log(chalk.yellow('\n2. 인지 지표 API 테스트'));
    try {
      // 다양한 시간 범위로 테스트
      const timeRanges = ['1m', '3m', '6m', 'all'];
      
      for (const timeRange of timeRanges) {
        console.log(chalk.cyan(`\n시간 범위: ${timeRange}`));
        
        const response = await fetch(
          `${API_BASE_URL}/api/cognitive/metrics?timeRange=${timeRange}`, 
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${TEST_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const data = await response.json();
        
        if (response.ok) {
          console.log(chalk.green(`✓ 응답 성공 (상태 코드: ${response.status})`));
          
          // 응답 구조 유효성 검사
          const requiredFields = ['metrics', 'overallScore', 'timeSeriesData'];
          const missingFields = requiredFields.filter(field => !(field in data.data));
          
          if (missingFields.length > 0) {
            console.log(chalk.red(`✗ 필수 필드 누락: ${missingFields.join(', ')}`));
          } else {
            console.log(chalk.green('✓ 필수 필드 모두 존재'));
          }
          
          // 데이터 샘플 출력
          console.log(chalk.gray('\n응답 데이터 샘플:'));
          console.log(chalk.gray(`- 종합 점수: ${data.data.overallScore}`));
          console.log(chalk.gray(`- 인지 지표 수: ${Object.keys(data.data.metrics).length}`));
          console.log(chalk.gray(`- 시계열 데이터 수: ${data.data.timeSeriesData.length}`));
          console.log(chalk.gray(`- 강점 항목: ${data.data.strengths.join(', ')}`));
          console.log(chalk.gray(`- 약점 항목: ${data.data.weaknesses.join(', ')}`));
        } else {
          console.log(chalk.red(`✗ API 응답 오류: ${response.status}`));
          console.log(chalk.red(`  오류 메시지: ${data.message || '알 수 없는 오류'}`));
        }
      }
    } catch (error) {
      console.log(chalk.red(`✗ 인지 지표 API 테스트 실패: ${error.message}`));
    }
    
    console.log(chalk.blue.bold('\n브레인 역량 분석 API 테스트 완료'));
    
  } catch (error) {
    console.error(chalk.red.bold('테스트 중 오류 발생:'), error);
    process.exit(1);
  }
}

// 테스트 실행
testCognitiveMetricsAPI().catch(error => {
  console.error(chalk.red.bold('테스트 스크립트 오류:'), error);
  process.exit(1);
}); 