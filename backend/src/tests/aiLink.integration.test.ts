import request from 'supertest';
import app from '../app'; // Express 앱 임포트
import mongoose from 'mongoose';
import User from '../models/User';

// TODO: 실제 GraphDB와 연동하여 테스트하거나, DB 쿼리 부분을 Mocking해야 함

describe('POST /api/ai-link/execute - AI-Link Integration Test', () => {
  let testUser: any;

  beforeAll(async () => {
    // 테스트용 사용자 생성
    testUser = await User.create({
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      // ... 기타 필드
    });

    // TODO: 테스트용 지식 그래프 데이터(메모, 책) 생성
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await User.findByIdAndDelete(testUser._id);
    await mongoose.connection.close();
  });

  it('"지식 공백 탐지" 시나리오를 성공적으로 실행해야 한다', async () => {
    const response = await request(app)
      .post('/api/ai-link/execute')
      .set('x-user-api-key', process.env.TEST_OPENAI_API_KEY || 'dummy-key')
      .send({
        userId: testUser._id.toString(),
        aiLinkGoal: '내 학습 목표에서 부족한 부분을 찾아줘',
        targetModel: 'openai',
      });

    // 1. 요청이 성공적으로 처리되었는가?
    expect(response.status).toBe(200);

    // 2. 응답 본문에 content 필드가 있는가?
    expect(response.body).toHaveProperty('content');
    
    // 3. (가상 시나리오) AI 응답에 '부족한 부분'과 관련된 키워드가 포함되어 있는가?
    // 실제 AI 응답은 매번 달라지므로, 키워드 포함 여부 정도로만 테스트
    console.log('E2E Test Response:', response.body.content);
    expect(response.body.content).toContain('부족'); // "부족한 부분", "학습이 더 필요" 등
  });

  it('필수 파라미터가 누락된 경우 400 에러를 반환해야 한다', async () => {
    const response = await request(app)
      .post('/api/ai-link/execute')
      .send({
        userId: testUser._id.toString(),
        // aiLinkGoal is missing
      });

    expect(response.status).toBe(400);
  });
}); 