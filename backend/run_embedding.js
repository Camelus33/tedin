const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// .env 파일의 절대 경로를 지정하여 dotenv를 설정합니다.
dotenv.config({ path: path.resolve(__dirname, './.env') });

async function generateEmbeddingsForAtlas() {
  console.log('=== MongoDB Atlas 임베딩 생성 시작 ===');

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI 환경변수를 찾을 수 없습니다.');
    console.log('현재 디렉토리:', __dirname);
    console.log('.env 파일 경로:', path.resolve(__dirname, './.env'));
    process.exit(1);
  }

  try {
    console.log('연결 URI 길이:', process.env.MONGODB_URI.length);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas 연결 성공');
    
    // dist 폴더의 서비스 파일을 사용합니다.
    const { EmbeddingService } = require('./dist/services/EmbeddingService.js');
    const embeddingService = new EmbeddingService();
    
    console.log('🚀 763개 메모에 대한 임베딩 생성 시작...');
    console.log('⏱️  예상 소요 시간: 약 1-2분');
    console.log();
    
    const startTime = Date.now();
    const result = await embeddingService.generateEmbeddingsForAllMemos();
    const endTime = Date.now();
    
    console.log();
    console.log('=== 🎉 임베딩 생성 완료 ===');
    console.log('✅ 성공적으로 처리된 메모:', result.processed);
    console.log('❌ 에러 발생한 메모:', result.errors);
    console.log('⏱️  총 소요 시간:', Math.round((endTime - startTime) / 1000) + '초');
    
    const stats = await embeddingService.getEmbeddingStats();
    console.log();
    console.log('=== 📈 최종 임베딩 통계 ===');
    console.log('전체 메모:', stats.total);
    console.log('임베딩 완료:', stats.withEmbeddings);
    console.log('임베딩 미완료:', stats.withoutEmbeddings);
    console.log('완료율:', stats.percentage.toFixed(2) + '%');
    
    await mongoose.disconnect();
    console.log();
    console.log('✅ 모든 작업 완료!');
    
  } catch (error) {
    console.error('❌ 에러:', error.message);
    console.error('스택:', error.stack);
    process.exit(1);
  }
}

generateEmbeddingsForAtlas();
