import { extractArgumentUnits, analyzeArgumentRelation } from './ArgumentMiner';
import { ArgumentUnit } from '../types/common';

describe('ArgumentMiner', () => {
  
  describe('extractArgumentUnits', () => {
    
    // 1. 기본 케이스: 한국어 주장과 전제가 혼합된 텍스트
    test('should extract claim and premise from Korean text', () => {
      const text = '인공지능은 미래의 핵심 기술이다. 왜냐하면 모든 산업 분야에서 활용되고 있기 때문이다.';
      const sourceNoteId = 'note_001';
      
      const result = extractArgumentUnits(text, sourceNoteId);
      
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('Claim');
      expect(result[0].text).toBe('인공지능은 미래의 핵심 기술이다');
      expect(result[0].sourceNoteId).toBe(sourceNoteId);
      expect(result[0].confidence).toBeGreaterThan(0.5);
      
      expect(result[1].type).toBe('Premise');
      expect(result[1].text).toBe('왜냐하면 모든 산업 분야에서 활용되고 있기 때문이다');
      expect(result[1].sourceNoteId).toBe(sourceNoteId);
    });
    
    // 2. 영어 텍스트 테스트
    test('should extract argument units from English text', () => {
      const text = 'AI will revolutionize healthcare. For example, it can diagnose diseases faster than doctors.';
      const sourceNoteId = 'note_002';
      
      const result = extractArgumentUnits(text, sourceNoteId);
      
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('Claim');
      expect(result[0].text).toBe('AI will revolutionize healthcare');
      
      expect(result[1].type).toBe('Premise');
      expect(result[1].text).toBe('For example, it can diagnose diseases faster than doctors');
    });
    
    // 3. 빈 텍스트 처리
    test('should return empty array for empty text', () => {
      expect(extractArgumentUnits('', 'note_003')).toEqual([]);
      expect(extractArgumentUnits('   ', 'note_004')).toEqual([]);
    });
    
    // 4. 단일 문장 처리
    test('should handle single sentence correctly', () => {
      const text = '기후 변화는 심각한 문제다.';
      const result = extractArgumentUnits(text, 'note_005');
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('Claim');
      expect(result[0].text).toBe('기후 변화는 심각한 문제다');
    });
    
    // 5. 복잡한 논증 구조 테스트
    test('should handle complex argumentative text', () => {
      const text = '온라인 교육이 효과적이라고 생각한다. 실제로 많은 학생들이 좋은 성과를 거두고 있다. 예를 들어 코딩 부트캠프의 취업률이 높다. 따라서 온라인 교육에 더 투자해야 한다.';
      const result = extractArgumentUnits(text, 'note_006');
      
      expect(result.length).toBeGreaterThan(2);
      
      // 첫 번째와 마지막 문장은 주장일 가능성이 높음
      expect(result[0].type).toBe('Claim');
      expect(result[result.length - 1].type).toBe('Claim');
      
      // 중간에 전제들이 있어야 함
      const premiseCount = result.filter(unit => unit.type === 'Premise').length;
      expect(premiseCount).toBeGreaterThan(0);
    });
    
    // 6. 표지어 기반 분류 테스트
    test('should classify based on discourse markers', () => {
      const text = '따라서 이 방법이 최선이다. 왜냐하면 비용이 적게 들기 때문이다.';
      const result = extractArgumentUnits(text, 'note_007');
      
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('Claim'); // '따라서' 표지어
      expect(result[1].type).toBe('Premise'); // '왜냐하면' 표지어
    });
    
    // 7. 신뢰도 계산 테스트
    test('should calculate confidence scores correctly', () => {
      const text = '따라서 이것이 올바른 결론이다. 이는 명확한 증거가 있기 때문이다.';
      const result = extractArgumentUnits(text, 'note_008');
      
      // 명확한 표지어가 있는 경우 신뢰도가 높아야 함
      expect(result[0].confidence).toBeGreaterThan(0.6);
      expect(result[1].confidence).toBeGreaterThan(0.6);
    });
    
    // 8. 분류할 수 없는 텍스트 처리
    test('should handle unclassifiable text', () => {
      const text = '안녕. 좋아. 감사.'; // 너무 짧고 명확하지 않은 문장들
      const result = extractArgumentUnits(text, 'note_009');
      
      // 일부 문장은 분류되지 않을 수 있음
      expect(result.length).toBeLessThanOrEqual(3);
    });
  });
  
  describe('analyzeArgumentRelation', () => {
    
    // 테스트용 논증 단위 생성 헬퍼
    const createArgumentUnit = (type: 'Claim' | 'Premise', text: string, confidence = 0.7): ArgumentUnit => ({
      '@type': 'ArgumentUnit',
      type,
      text,
      sourceNoteId: 'test_note',
      confidence
    });
    
    // 1. 전제가 주장을 지지하는 관계
    test('should identify premise supporting claim', () => {
      const premise = createArgumentUnit('Premise', '실제로 많은 연구에서 이를 증명했다');
      const claim = createArgumentUnit('Claim', '이 방법이 효과적이다');
      
      const relation = analyzeArgumentRelation(premise, claim);
      
      expect(relation).toBe('supports');
    });
    
    // 2. 주장이 전제를 정교화하는 관계
    test('should identify claim elaborating premise', () => {
      const claim = createArgumentUnit('Claim', '교육이 중요하다');
      const premise = createArgumentUnit('Premise', '교육을 통해 사회가 발전한다');
      
      const relation = analyzeArgumentRelation(claim, premise);
      
      expect(relation).toBe('elaborates');
    });
    
    // 3. 같은 타입 간의 관계 (유사성 기반)
    test('should identify elaboration between similar claims', () => {
      const claim1 = createArgumentUnit('Claim', '인공지능이 의료 분야를 혁신할 것이다');
      const claim2 = createArgumentUnit('Claim', '의료 인공지능 기술이 환자 치료를 개선한다');
      
      const relation = analyzeArgumentRelation(claim1, claim2);
      
      expect(relation).toBe('elaborates');
    });
    
    // 4. 관계가 없는 경우
    test('should return null for unrelated arguments', () => {
      const claim1 = createArgumentUnit('Claim', '날씨가 좋다');
      const claim2 = createArgumentUnit('Claim', '수학은 어렵다');
      
      const relation = analyzeArgumentRelation(claim1, claim2);
      
      expect(relation).toBeNull();
    });
    
    // 5. 빈 텍스트 처리
    test('should handle empty text gracefully', () => {
      const unit1 = createArgumentUnit('Claim', '');
      const unit2 = createArgumentUnit('Premise', '테스트 텍스트');
      
      const relation = analyzeArgumentRelation(unit1, unit2);
      
      expect(relation).toBeNull();
    });
    
    // 6. 동일한 텍스트 처리
    test('should handle identical text', () => {
      const text = '이것은 테스트 텍스트이다';
      const unit1 = createArgumentUnit('Claim', text);
      const unit2 = createArgumentUnit('Claim', text);
      
      const relation = analyzeArgumentRelation(unit1, unit2);
      
      expect(relation).toBe('elaborates'); // 완전히 동일하면 정교화 관계
    });
  });
  
  describe('edge cases and error handling', () => {
    
    // 1. 매우 긴 텍스트 처리
    test('should handle very long text', () => {
      const longText = '이것은 매우 긴 텍스트입니다. '.repeat(100) + '따라서 결론입니다.';
      const result = extractArgumentUnits(longText, 'note_long');
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
    
    // 2. 특수 문자가 포함된 텍스트
    test('should handle text with special characters', () => {
      const text = '이것은 "특수" 문자가 포함된 텍스트입니다! @#$%^&*()';
      const result = extractArgumentUnits(text, 'note_special');
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
    
    // 3. 숫자만 포함된 텍스트
    test('should handle numeric text', () => {
      const text = '123 456 789';
      const result = extractArgumentUnits(text, 'note_numeric');
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
    
    // 4. 혼합 언어 텍스트
    test('should handle mixed language text', () => {
      const text = '이것은 Korean and English mixed text입니다. Therefore, it should work.';
      const result = extractArgumentUnits(text, 'note_mixed');
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });
}); 