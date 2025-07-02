import { 
  addNode, 
  addEdge, 
  getNode, 
  getBeliefNetwork, 
  updateFromNote,
  initializeBeliefNetwork
} from './BeliefNetworkService';
import { BeliefNode, BeliefEdge, ArgumentUnit, RhetoricalRelation } from '../types/common';

/**
 * PBAM Integration Tests
 * BeliefNetworkService의 전체 파이프라인을 테스트합니다.
 * ArgumentMiner, RSTAnalyzer, BeliefNetworkService의 통합을 검증합니다.
 */

describe('BeliefNetworkService Integration Tests', () => {
  const testUserId = 'test-user-123';
  const testNoteId = 'test-note-456';

  beforeEach(async () => {
    // 각 테스트 전에 사용자의 신념 네트워크 초기화
    await initializeBeliefNetwork(testUserId);
  });

  describe('Basic Node and Edge Operations', () => {
    test('should add and retrieve a belief node', async () => {
      const testNode: BeliefNode = {
        '@type': 'BeliefNode',
        id: 'node-1',
        label: 'AI는 미래 사회를 변화시킬 것이다',
        probability: 0.8
      };

      const nodeId = await addNode(testUserId, testNode);
      expect(nodeId).toBe('node-1');

      const retrievedNode = await getNode(testUserId, 'node-1');
      expect(retrievedNode).toEqual(testNode);
    });

    test('should add and retrieve a belief edge', async () => {
      // 먼저 두 개의 노드 추가
      const sourceNode: BeliefNode = {
        '@type': 'BeliefNode',
        id: 'node-source',
        label: '머신러닝 기술이 발전하고 있다',
        probability: 0.9
      };

      const targetNode: BeliefNode = {
        '@type': 'BeliefNode',
        id: 'node-target',
        label: 'AI가 일자리를 대체할 것이다',
        probability: 0.7
      };

      await addNode(testUserId, sourceNode);
      await addNode(testUserId, targetNode);

      // 엣지 추가
      const testEdge: BeliefEdge = {
        '@type': 'BeliefEdge',
        sourceNodeId: 'node-source',
        targetNodeId: 'node-target',
        conditionalProbability: 0.8
      };

      const success = await addEdge(testUserId, testEdge);
      expect(success).toBe(true);

      // 네트워크 조회로 엣지 확인
      const network = await getBeliefNetwork(testUserId);
      expect(network).not.toBeNull();
      expect(network!.edges).toHaveLength(1);
      expect(network!.edges[0]).toEqual(testEdge);
    });

    test('should handle duplicate nodes by updating', async () => {
      const originalNode: BeliefNode = {
        '@type': 'BeliefNode',
        id: 'duplicate-test',
        label: '원본 텍스트',
        probability: 0.5
      };

      const updatedNode: BeliefNode = {
        '@type': 'BeliefNode',
        id: 'duplicate-test',
        label: '업데이트된 텍스트',
        probability: 0.8
      };

      await addNode(testUserId, originalNode);
      await addNode(testUserId, updatedNode);

      const retrievedNode = await getNode(testUserId, 'duplicate-test');
      expect(retrievedNode).toEqual(updatedNode);

      const network = await getBeliefNetwork(testUserId);
      expect(network!.nodes).toHaveLength(1); // 중복이 아닌 업데이트
    });
  });

  describe('Full PBAM Pipeline Integration', () => {
    test('should process a simple Korean note with claims and premises', async () => {
      const noteText = `
        인공지능은 미래 사회의 핵심 기술이다.
        왜냐하면 머신러닝과 딥러닝 기술이 급속도로 발전하고 있기 때문이다.
        실제로 많은 기업들이 AI를 도입하여 효율성을 높이고 있다.
        따라서 AI 교육이 필수적이다.
      `;

      const result = await updateFromNote(testUserId, testNoteId, noteText);

      expect(result.success).toBe(true);
      expect(result.nodesCreated).toBeGreaterThan(0);
      expect(result.argumentUnits.length).toBeGreaterThan(0);

      // 네트워크 상태 확인
      const network = await getBeliefNetwork(testUserId);
      expect(network).not.toBeNull();
      expect(network!.nodes.length).toBe(result.nodesCreated);

      // 논증 단위 타입 확인
      const claims = result.argumentUnits.filter(unit => unit.type === 'Claim');
      const premises = result.argumentUnits.filter(unit => unit.type === 'Premise');
      
      expect(claims.length).toBeGreaterThan(0);
      expect(premises.length).toBeGreaterThan(0);
    });

    test('should process an English note with argumentative structure', async () => {
      const noteText = `
        Artificial intelligence will transform education.
        This is because AI can personalize learning experiences for individual students.
        For example, adaptive learning systems already show improved learning outcomes.
        Therefore, schools should invest in AI technology.
      `;

      const result = await updateFromNote(testUserId, testNoteId, noteText);

      expect(result.success).toBe(true);
      expect(result.nodesCreated).toBeGreaterThan(0);
      expect(result.argumentUnits.length).toBeGreaterThan(0);

      // 수사적 관계 확인
      expect(result.rhetoricalRelations.length).toBeGreaterThan(0);

      const supportRelations = result.rhetoricalRelations.filter(
        rel => rel.relationType === 'supports'
      );
      expect(supportRelations.length).toBeGreaterThan(0);
    });

    test('should handle contrasting arguments', async () => {
      const noteText = `
        AI will create new job opportunities.
        However, it will also eliminate many traditional jobs.
        On the other hand, history shows that technological progress ultimately creates more jobs than it destroys.
        Nevertheless, we need retraining programs for displaced workers.
      `;

      const result = await updateFromNote(testUserId, testNoteId, noteText);

      expect(result.success).toBe(true);
      expect(result.rhetoricalRelations.length).toBeGreaterThan(0);

      // 대조 관계 확인
      const attackRelations = result.rhetoricalRelations.filter(
        rel => rel.relationType === 'attacks'
      );
      expect(attackRelations.length).toBeGreaterThan(0);
    });

    test('should handle elaborative relationships', async () => {
      const noteText = `
        Machine learning requires large datasets.
        Specifically, deep learning models need millions of training examples.
        In other words, data quality and quantity are crucial for AI success.
        Moreover, data preprocessing is equally important.
      `;

      const result = await updateFromNote(testUserId, testNoteId, noteText);

      expect(result.success).toBe(true);
      expect(result.rhetoricalRelations.length).toBeGreaterThan(0);

      // 정교화 관계 확인
      const elaborateRelations = result.rhetoricalRelations.filter(
        rel => rel.relationType === 'elaborates'
      );
      expect(elaborateRelations.length).toBeGreaterThan(0);
    });

    test('should handle empty or invalid text gracefully', async () => {
      const emptyResult = await updateFromNote(testUserId, testNoteId, '');
      expect(emptyResult.success).toBe(true);
      expect(emptyResult.nodesCreated).toBe(0);
      expect(emptyResult.edgesCreated).toBe(0);

      const whitespaceResult = await updateFromNote(testUserId, testNoteId, '   \n\t  ');
      expect(whitespaceResult.success).toBe(true);
      expect(whitespaceResult.nodesCreated).toBe(0);

      const shortResult = await updateFromNote(testUserId, testNoteId, 'Hi.');
      expect(shortResult.success).toBe(true);
      // 짧은 텍스트도 처리될 수 있음
    });
  });

  describe('Network Evolution and Consistency', () => {
    test('should maintain network consistency across multiple note updates', async () => {
      // 첫 번째 노트 처리
      const note1 = '인공지능은 혁신적인 기술이다. 왜냐하면 복잡한 문제를 해결할 수 있기 때문이다.';
      const result1 = await updateFromNote(testUserId, 'note-1', note1);

      // 두 번째 노트 처리 (관련 내용)
      const note2 = 'AI는 의료 분야에서 특히 유용하다. 예를 들어 의료 영상 분석에서 높은 정확도를 보인다.';
      const result2 = await updateFromNote(testUserId, 'note-2', note2);

      expect(result1.success && result2.success).toBe(true);

      const network = await getBeliefNetwork(testUserId);
      expect(network).not.toBeNull();
      
      // 총 노드 수는 두 결과의 합
      const totalExpectedNodes = result1.nodesCreated + result2.nodesCreated;
      expect(network!.nodes.length).toBe(totalExpectedNodes);

      // 네트워크 무결성 확인
      for (const edge of network!.edges) {
        const sourceExists = network!.nodes.some(node => node.id === edge.sourceNodeId);
        const targetExists = network!.nodes.some(node => node.id === edge.targetNodeId);
        expect(sourceExists).toBe(true);
        expect(targetExists).toBe(true);
      }
    });

    test('should handle complex mixed-language content', async () => {
      const mixedText = `
        AI technology is advancing rapidly. 
        특히 한국에서도 인공지능 연구가 활발하다.
        This creates both opportunities and challenges.
        예를 들어 자율주행차 기술이 발전하고 있다.
        However, ethical concerns must be addressed.
        따라서 규제 프레임워크가 필요하다.
      `;

      const result = await updateFromNote(testUserId, testNoteId, mixedText);

      expect(result.success).toBe(true);
      expect(result.nodesCreated).toBeGreaterThan(0);
      expect(result.argumentUnits.length).toBeGreaterThan(0);

      // 다양한 관계 타입이 감지되는지 확인
      const relationTypes = new Set(
        result.rhetoricalRelations.map(rel => rel.relationType)
      );
      expect(relationTypes.size).toBeGreaterThan(1); // 여러 관계 타입 존재
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle large text input efficiently', async () => {
      // 긴 텍스트 생성 (실제 사용 시나리오 시뮬레이션)
      const longText = Array(20).fill(0).map((_, i) => 
        `문장 ${i + 1}: 인공지능은 ${i % 3 === 0 ? '혁신적' : i % 3 === 1 ? '유용한' : '중요한'} 기술이다. ` +
        `왜냐하면 ${i % 2 === 0 ? '효율성을 높이기' : '문제 해결에 도움이 되기'} 때문이다.`
      ).join(' ');

      const startTime = Date.now();
      const result = await updateFromNote(testUserId, testNoteId, longText);
      const processingTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(5000); // 5초 이내 처리
      expect(result.nodesCreated).toBeGreaterThan(10); // 충분한 노드 생성
    });

    test('should maintain data integrity with concurrent updates', async () => {
      // 동시에 여러 노트 처리 시뮬레이션
      const notes = [
        'AI는 교육을 혁신할 것이다.',
        'Machine learning improves over time.',
        '딥러닝은 복잡한 패턴을 학습한다.',
        'Neural networks mimic brain functions.'
      ];

      const promises = notes.map((note, index) => 
        updateFromNote(testUserId, `concurrent-note-${index}`, note)
      );

      const results = await Promise.all(promises);

      // 모든 처리가 성공적으로 완료되었는지 확인
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      const network = await getBeliefNetwork(testUserId);
      expect(network).not.toBeNull();
      
      // 네트워크 무결성 확인
      const totalExpectedNodes = results.reduce((sum, result) => sum + result.nodesCreated, 0);
      expect(network!.nodes.length).toBe(totalExpectedNodes);
    });
  });
}); 