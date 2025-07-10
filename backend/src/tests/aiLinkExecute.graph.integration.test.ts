import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/User';
import { loadTestDataset, clearDataset } from './utils/fusekiTestUtils';
import path from 'path';

// AI 클라이언트 모킹
jest.mock('../lib/aiClients', () => {
  return {
    getAIClient: () => ({
      completion: async () => ({
        choices: [
          {
            message: {
              content: '{"content":"다음과 같은 지식 격차를 발견했습니다.","triples":[{"subject":"http://example.org/memo1","predicate":"http://schema.org/about","object":"http://example.org/book1","confidence":0.9}]}'
            },
          },
        ],
      }),
    }),
  };
});

// 인증 우회 설정
process.env.BYPASS_AUTH = 'true';

describe('AI-Link Execute Endpoint – Graph Integration', () => {
  let testUser: any;
  beforeAll(async () => {
    // 미리 Fuseki에 테스트 데이터 로드
    await loadTestDataset(path.join(__dirname, '../../tests/data/testDataset.ttl'));

    // 테스트 사용자 생성
    testUser = await User.create({
      email: `it-${Date.now()}@example.com`,
      password: 'pass1234',
    });
  });

  afterAll(async () => {
    // Fuseki 데이터 정리 & DB 정리
    await clearDataset();
    await User.deleteOne({ _id: testUser._id });
    await mongoose.connection.close();
  });

  it('should return formatted response with extracted triples', async () => {
    const res = await request(app)
      .post('/api/ai-link/execute')
      .set('x-user-api-key', 'dummy')
      .send({
        userId: testUser._id.toString(),
        aiLinkGoal: '지식 격차 분석',
        targetProvider: 'openai',
        targetModel: 'gpt-4o',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('content');
    expect(res.body).toHaveProperty('extractedTriples');
    expect(Array.isArray(res.body.extractedTriples)).toBe(true);
    expect(res.body.extractedTriples.length).toBeGreaterThan(0);

    // 삼중 중 첫 번째가 우리가 넣은 memo1 -> book1 여부 확인
    const firstTriple = res.body.extractedTriples[0];
    expect(firstTriple.subject).toContain('memo1');
    expect(firstTriple.object).toContain('book1');
  });
}); 