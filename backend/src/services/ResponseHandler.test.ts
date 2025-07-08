import { ResponseHandler, FormattedResponse, NewKnowledgeTriple } from './ResponseHandler';
import { ContextBundle } from './ContextOrchestrator';

describe('ResponseHandler', () => {
  let mockContextBundle: ContextBundle;

  beforeEach(() => {
    mockContextBundle = {
      targetConcept: '머신러닝',
      relevantNotes: [
        { content: '머신러닝의 정의는 데이터로부터 학습하는 것이다.', tags: ['머신러닝', '정의'] },
      ],
    };
  });

  describe('OpenAI Response Parsing', () => {
    it('OpenAI 형태의 응답에서 텍스트와 인용을 정확히 추출해야 한다', () => {
      const mockResponse = {
        choices: [{ message: { content: '머신러닝의 정의는 데이터 기반 학습입니다.' } }],
      };
      const handler = new ResponseHandler(mockResponse, mockContextBundle);
      const formatted = handler.formatForDisplay();

      expect(formatted.content).toBe('머신러닝의 정의는 데이터 기반 학습입니다.');
      // '정의'라는 단어가 포함되어 있으므로, Mock 로직에 따라 인용이 1개여야 함
      expect(formatted.citations.length).toBe(1);
      expect(formatted.citations[0].sourceContent).toBe(mockContextBundle.relevantNotes[0].content);
    });
  });

  describe('Claude Response Parsing', () => {
    it('Claude 형태의 응답에서 텍스트와 인용을 정확히 추출해야 한다', () => {
      const mockResponse = "Human: ... Assistant: 머신러닝의 정의는 데이터로부터 학습하는 것입니다.";
      const handler = new ResponseHandler(mockResponse, mockContextBundle);
      const formatted = handler.formatForDisplay();

      expect(formatted.content).toBe('머신러닝의 정의는 데이터로부터 학습하는 것입니다.');
      expect(formatted.citations.length).toBe(1);
    });
  });

  describe('New Knowledge Extraction', () => {
    it('AI 응답에서 새로운 관계를 발견하면 온톨로지 트리플로 추출해야 한다', () => {
        const mockResponse = {
            choices: [{ message: { content: '지도학습은 대표적인 머신러닝의 종류입니다.' } }],
        };
        const handler = new ResponseHandler(mockResponse, mockContextBundle);
        const newKnowledge = handler.extractNewKnowledge();

        expect(newKnowledge.length).toBe(1);
        expect(newKnowledge[0]).toEqual({
            subject: 'app:SupervisedLearning',
            predicate: 'rdfs:subClassOf',
            object: 'app:MachineLearning'
        });
    });
  });

  it('알 수 없는 형식의 응답에 대해서는 빈 콘텐츠를 반환해야 한다', () => {
    const brokenResponse = { data: 'unexpected format' };
    const handler = new ResponseHandler(brokenResponse, mockContextBundle);
    const formatted = handler.formatForDisplay();
    expect(formatted.content).toBe('');
  });
}); 