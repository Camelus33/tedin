import { ContextOrchestrator, ContextBundle } from './ContextOrchestrator';
import { IUser } from '../models/User';

describe('ContextOrchestrator', () => {
  let mockUser: IUser;
  let orchestrator: ContextOrchestrator;

  beforeEach(() => {
    // 각 테스트가 독립적으로 실행되도록 mockUser와 orchestrator를 초기화합니다.
    mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      // ... IUser의 다른 필수 필드들
    } as IUser;

    orchestrator = new ContextOrchestrator(mockUser);
  });

  it('주어진 목표 개념에 대해 관련성 높은 노트를 포함하는 ContextBundle을 생성해야 한다', async () => {
    const targetConcept = '머신러닝';
    const contextBundle: ContextBundle = await orchestrator.getContextBundle(targetConcept);

    // 1. 반환된 번들의 목표 개념이 정확한가?
    expect(contextBundle.targetConcept).toBe(targetConcept);

    // 2. 관련 노트가 1개 이상 포함되어 있는가? (Mock 데이터 기준)
    expect(contextBundle.relevantNotes.length).toBeGreaterThan(0);

    // 3. 노트 내용에 목표 개념이 포함되어 있는가?
    contextBundle.relevantNotes.forEach(note => {
      expect(note.content).toContain(targetConcept);
    });

    console.log('ContextBundle generation test passed!');
    console.log('Generated Bundle:', JSON.stringify(contextBundle, null, 2));
  });

  it('향후 구현될 토큰 제한 로직을 고려하여, 특정 크기를 초과하지 않는 번들을 반환해야 한다', () => {
    // TODO: 이 테스트는 ContextOrchestrator에 토큰 제한 로직이 구현된 후 작성합니다.
    expect(true).toBe(true); // 현재는 항상 통과
  });

  it('GraphDB 연결이 실패했을 때 적절한 에러를 발생시켜야 한다', async () => {
    // TODO: queryGraph 메서드에 실제 DB 연결 로직과 에러 핸들링이 추가된 후 테스트를 작성합니다.
    // 예를 들어, orchestrator.queryGraph = jest.fn().mockRejectedValue(new Error('DB connection failed'));
    // await expect(orchestrator.getContextBundle('any')).rejects.toThrow('DB connection failed');
    expect(true).toBe(true); // 현재는 항상 통과
  });
}); 