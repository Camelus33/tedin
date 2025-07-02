import { analyzeRhetoricalRelation, analyzeRhetoricalStructure } from './RSTAnalyzer';
import { ArgumentUnit, RhetoricalRelation } from '../types/common';

describe('RSTAnalyzer', () => {
  
  // 테스트용 논증 단위 생성 헬퍼
  const createArgumentUnit = (
    type: 'Claim' | 'Premise', 
    text: string, 
    sourceNoteId = 'test_note',
    confidence = 0.7
  ): ArgumentUnit => ({
    '@type': 'ArgumentUnit',
    type,
    text,
    sourceNoteId,
    confidence
  });
  
  describe('analyzeRhetoricalRelation', () => {
    
    // 1. 지지 관계 (supports) 테스트
    describe('supports relation', () => {
      
      test('should identify premise supporting claim', () => {
        const premise = createArgumentUnit('Premise', '실제로 많은 연구에서 이를 증명했다');
        const claim = createArgumentUnit('Claim', '이 방법이 효과적이다');
        
        const relation = analyzeRhetoricalRelation(premise, claim);
        
        expect(relation).not.toBeNull();
        expect(relation?.relationType).toBe('supports');
        expect(relation?.strength).toBeGreaterThan(0.5);
      });
      
      test('should identify support through discourse markers', () => {
        const unit1 = createArgumentUnit('Claim', '교육이 중요하다');
        const unit2 = createArgumentUnit('Claim', '왜냐하면 교육을 통해 사회가 발전하기 때문이다');
        
        const relation = analyzeRhetoricalRelation(unit1, unit2);
        
        expect(relation?.relationType).toBe('supports');
        expect(relation?.strength).toBeGreaterThan(0.6); // 담화 표지어로 인한 높은 강도
      });
      
      test('should identify English support markers', () => {
        const unit1 = createArgumentUnit('Claim', 'Climate change is real');
        const unit2 = createArgumentUnit('Premise', 'because scientific evidence shows rising temperatures');
        
        const relation = analyzeRhetoricalRelation(unit1, unit2);
        
        expect(relation?.relationType).toBe('supports');
      });
    });
    
    // 2. 공격 관계 (attacks) 테스트
    describe('attacks relation', () => {
      
      test('should identify contrast through discourse markers', () => {
        const unit1 = createArgumentUnit('Claim', '온라인 교육이 효과적이다');
        const unit2 = createArgumentUnit('Claim', '그러나 대면 교육이 더 나은 결과를 보인다');
        
        const relation = analyzeRhetoricalRelation(unit1, unit2);
        
        expect(relation?.relationType).toBe('attacks');
        expect(relation?.strength).toBeGreaterThan(0.5);
      });
      
      test('should identify English contrast markers', () => {
        const unit1 = createArgumentUnit('Claim', 'AI is beneficial');
        const unit2 = createArgumentUnit('Claim', 'However, it poses significant risks');
        
        const relation = analyzeRhetoricalRelation(unit1, unit2);
        
        expect(relation?.relationType).toBe('attacks');
      });
      
      test('should identify implicit contrast between claims', () => {
        const unit1 = createArgumentUnit('Claim', '원격 근무가 생산성을 높인다');
        const unit2 = createArgumentUnit('Claim', '반면에 사무실 근무가 협업에 더 유리하다');
        
        const relation = analyzeRhetoricalRelation(unit1, unit2);
        
        expect(relation?.relationType).toBe('attacks');
      });
    });
    
    // 3. 정교화 관계 (elaborates) 테스트
    describe('elaborates relation', () => {
      
      test('should identify elaboration through similarity', () => {
        const unit1 = createArgumentUnit('Claim', '인공지능이 의료 분야를 혁신한다');
        const unit2 = createArgumentUnit('Claim', '의료 AI 기술이 진단 정확도를 높인다');
        
        const relation = analyzeRhetoricalRelation(unit1, unit2);
        
        expect(relation?.relationType).toBe('elaborates');
      });
      
      test('should identify elaboration markers', () => {
        const unit1 = createArgumentUnit('Claim', '환경 보호가 필요하다');
        const unit2 = createArgumentUnit('Claim', '즉, 지속 가능한 발전을 위해서다');
        
        const relation = analyzeRhetoricalRelation(unit1, unit2);
        
        expect(relation?.relationType).toBe('elaborates');
      });
      
      test('should identify premise-to-premise elaboration', () => {
        const premise1 = createArgumentUnit('Premise', '연구에 따르면 운동이 건강에 좋다');
        const premise2 = createArgumentUnit('Premise', '특히 심혈관 건강을 개선한다');
        
        const relation = analyzeRhetoricalRelation(premise1, premise2);
        
        expect(relation?.relationType).toBe('elaborates');
      });
    });
    
    // 4. 관계가 없는 경우
    describe('no relation cases', () => {
      
      test('should return null for unrelated content', () => {
        const unit1 = createArgumentUnit('Claim', '날씨가 좋다');
        const unit2 = createArgumentUnit('Claim', '수학은 어려운 과목이다');
        
        const relation = analyzeRhetoricalRelation(unit1, unit2);
        
        expect(relation).toBeNull();
      });
      
      test('should return null for very short text', () => {
        const unit1 = createArgumentUnit('Claim', '좋다');
        const unit2 = createArgumentUnit('Claim', '나쁘다');
        
        const relation = analyzeRhetoricalRelation(unit1, unit2);
        
        expect(relation).toBeNull();
      });
      
      test('should return null for empty text', () => {
        const unit1 = createArgumentUnit('Claim', '');
        const unit2 = createArgumentUnit('Claim', '테스트');
        
        const relation = analyzeRhetoricalRelation(unit1, unit2);
        
        expect(relation).toBeNull();
      });
    });
    
    // 5. 관계 강도 테스트
    describe('relation strength calculation', () => {
      
      test('should give higher strength for clear discourse markers', () => {
        const unit1 = createArgumentUnit('Claim', '이 방법이 좋다');
        const unit2 = createArgumentUnit('Premise', '왜냐하면 효과가 입증되었기 때문이다');
        
        const relation = analyzeRhetoricalRelation(unit1, unit2);
        
        expect(relation?.strength).toBeGreaterThan(0.7);
      });
      
      test('should consider argument unit confidence in strength', () => {
        const highConfidenceUnit1 = createArgumentUnit('Claim', '이것이 정답이다', 'note1', 0.9);
        const highConfidenceUnit2 = createArgumentUnit('Premise', '왜냐하면 증거가 명확하다', 'note1', 0.9);
        
        const lowConfidenceUnit1 = createArgumentUnit('Claim', '이것이 정답이다', 'note2', 0.3);
        const lowConfidenceUnit2 = createArgumentUnit('Premise', '왜냐하면 증거가 명확하다', 'note2', 0.3);
        
        const highConfidenceRelation = analyzeRhetoricalRelation(highConfidenceUnit1, highConfidenceUnit2);
        const lowConfidenceRelation = analyzeRhetoricalRelation(lowConfidenceUnit1, lowConfidenceUnit2);
        
        expect(highConfidenceRelation?.strength).toBeGreaterThan(lowConfidenceRelation?.strength || 0);
      });
      
      test('should consider text length in strength calculation', () => {
        const shortUnit1 = createArgumentUnit('Claim', '좋다');
        const shortUnit2 = createArgumentUnit('Premise', '왜냐하면 맞다');
        
        const longUnit1 = createArgumentUnit('Claim', '이 방법론은 매우 효과적이고 실용적인 접근법이라고 생각한다');
        const longUnit2 = createArgumentUnit('Premise', '왜냐하면 여러 연구에서 일관되게 긍정적인 결과를 보여주었기 때문이다');
        
        const shortRelation = analyzeRhetoricalRelation(shortUnit1, shortUnit2);
        const longRelation = analyzeRhetoricalRelation(longUnit1, longUnit2);
        
        expect(longRelation?.strength).toBeGreaterThan(shortRelation?.strength || 0);
      });
    });
  });
  
  describe('analyzeRhetoricalStructure', () => {
    
    // 1. 기본 구조 분석 테스트
    test('should analyze structure of argument sequence', () => {
      const argumentUnits: ArgumentUnit[] = [
        createArgumentUnit('Claim', '온라인 교육이 미래의 교육 방식이다'),
        createArgumentUnit('Premise', '왜냐하면 접근성이 뛰어나기 때문이다'),
        createArgumentUnit('Premise', '또한 비용 효율적이다'),
        createArgumentUnit('Claim', '따라서 더 많은 투자가 필요하다')
      ];
      
      const relations = analyzeRhetoricalStructure(argumentUnits);
      
      expect(relations.length).toBeGreaterThan(0);
      expect(relations.some(r => r.relationType === 'supports')).toBe(true);
    });
    
    // 2. 빈 배열 처리
    test('should handle empty argument units array', () => {
      const relations = analyzeRhetoricalStructure([]);
      
      expect(relations).toEqual([]);
    });
    
    // 3. 단일 논증 단위 처리
    test('should handle single argument unit', () => {
      const argumentUnits = [createArgumentUnit('Claim', '이것은 테스트다')];
      
      const relations = analyzeRhetoricalStructure(argumentUnits);
      
      expect(relations).toEqual([]);
    });
    
    // 4. 복잡한 논증 구조 테스트
    test('should analyze complex argumentative structure', () => {
      const argumentUnits: ArgumentUnit[] = [
        createArgumentUnit('Claim', '기후 변화 대응이 시급하다'),
        createArgumentUnit('Premise', '실제로 지구 온도가 계속 상승하고 있다'),
        createArgumentUnit('Premise', '극지방의 빙하가 녹고 있다'),
        createArgumentUnit('Claim', '그러나 경제적 부담도 고려해야 한다'),
        createArgumentUnit('Premise', '환경 정책 시행에는 막대한 비용이 든다'),
        createArgumentUnit('Claim', '따라서 단계적 접근이 필요하다')
      ];
      
      const relations = analyzeRhetoricalStructure(argumentUnits);
      
      // 다양한 관계 타입이 식별되어야 함
      const relationTypes = relations.map(r => r.relationType);
      expect(relationTypes).toContain('supports');
      expect(relationTypes.length).toBeGreaterThan(3);
    });
    
    // 5. 비인접 관계 테스트
    test('should identify non-adjacent high-strength relations', () => {
      const argumentUnits: ArgumentUnit[] = [
        createArgumentUnit('Claim', '인공지능이 일자리를 위협한다'),
        createArgumentUnit('Premise', '중간 단계 텍스트'),
        createArgumentUnit('Premise', '짧은 텍스트'),
        createArgumentUnit('Claim', '따라서 인공지능 기술 발전을 신중하게 관리해야 한다') // 첫 번째와 관련성 높음
      ];
      
      const relations = analyzeRhetoricalStructure(argumentUnits);
      
      // 비인접 관계도 식별되어야 함 (강도가 높은 경우)
      const hasNonAdjacentRelation = relations.some(r => {
        const sourceIndex = argumentUnits.indexOf(r.sourceUnit);
        const targetIndex = argumentUnits.indexOf(r.targetUnit);
        return Math.abs(sourceIndex - targetIndex) > 1;
      });
      
      expect(hasNonAdjacentRelation).toBe(true);
    });
  });
  
  describe('edge cases and robustness', () => {
    
    // 1. 특수 문자 처리
    test('should handle special characters in text', () => {
      const unit1 = createArgumentUnit('Claim', '이것은 "특수" 문자 @#$% 테스트다!');
      const unit2 = createArgumentUnit('Premise', '왜냐하면 (괄호) [대괄호] {중괄호}가 있어도 작동해야 하기 때문이다');
      
      const relation = analyzeRhetoricalRelation(unit1, unit2);
      
      expect(relation).not.toBeNull();
      expect(relation?.relationType).toBe('supports');
    });
    
    // 2. 매우 긴 텍스트 처리
    test('should handle very long text', () => {
      const longText1 = '이것은 매우 긴 텍스트입니다. '.repeat(50);
      const longText2 = '왜냐하면 이것도 매우 긴 텍스트이기 때문입니다. '.repeat(50);
      
      const unit1 = createArgumentUnit('Claim', longText1);
      const unit2 = createArgumentUnit('Premise', longText2);
      
      const relation = analyzeRhetoricalRelation(unit1, unit2);
      
      expect(relation).toBeDefined();
    });
    
    // 3. 혼합 언어 처리
    test('should handle mixed Korean-English text', () => {
      const unit1 = createArgumentUnit('Claim', 'AI technology는 혁신적이다');
      const unit2 = createArgumentUnit('Premise', 'because it can process big data efficiently');
      
      const relation = analyzeRhetoricalRelation(unit1, unit2);
      
      expect(relation?.relationType).toBe('supports');
    });
    
    // 4. 숫자와 기호가 포함된 텍스트
    test('should handle text with numbers and symbols', () => {
      const unit1 = createArgumentUnit('Claim', '2024년 GDP 성장률이 3.5% 증가할 것이다');
      const unit2 = createArgumentUnit('Premise', '왜냐하면 IT 산업이 15% 성장했기 때문이다');
      
      const relation = analyzeRhetoricalRelation(unit1, unit2);
      
      expect(relation?.relationType).toBe('supports');
    });
    
    // 5. 동일한 텍스트 처리
    test('should handle identical texts', () => {
      const sameText = '이것은 동일한 텍스트입니다';
      const unit1 = createArgumentUnit('Claim', sameText);
      const unit2 = createArgumentUnit('Claim', sameText);
      
      const relation = analyzeRhetoricalRelation(unit1, unit2);
      
      expect(relation?.relationType).toBe('elaborates');
      expect(relation?.strength).toBeGreaterThan(0.8); // 높은 유사성으로 인한 높은 강도
    });
  });
  
  describe('relation object structure', () => {
    
    test('should return properly structured RhetoricalRelation object', () => {
      const unit1 = createArgumentUnit('Claim', '이것이 결론이다');
      const unit2 = createArgumentUnit('Premise', '왜냐하면 증거가 있기 때문이다');
      
      const relation = analyzeRhetoricalRelation(unit1, unit2);
      
      expect(relation).toMatchObject({
        '@type': 'RhetoricalRelation',
        sourceUnit: unit1,
        targetUnit: unit2,
        relationType: expect.any(String),
        strength: expect.any(Number)
      });
      
      expect(relation?.strength).toBeGreaterThanOrEqual(0.1);
      expect(relation?.strength).toBeLessThanOrEqual(1.0);
    });
  });
}); 