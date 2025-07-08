import { PromptGenerator, SupportedModels } from './PromptGenerator';
import { ContextBundle } from './ContextOrchestrator';

describe('PromptGenerator', () => {
  let mockBundle: ContextBundle;
  const userQuery = '머신러닝에 대해 요약해줘.';

  beforeEach(() => {
    mockBundle = {
      targetConcept: '머신러닝',
      relevantNotes: [
        { content: '머신러닝은 데이터에서 학습하는 알고리즘이다.', tags: ['머신러닝', '정의'] },
        { content: '지도학습과 비지도학습이 있다.', tags: ['머신러닝', '종류'] },
      ],
    };
  });

  describe('OpenAI Strategy', () => {
    it('OpenAI 모델을 위한 메시지 배열 형식의 프롬프트를 생성해야 한다', () => {
      const generator = new PromptGenerator('openai');
      const prompt = generator.generate(mockBundle, userQuery);

      // 1. 반환값이 배열인가?
      expect(Array.isArray(prompt)).toBe(true);
      // 2. 첫 번째 메시지의 역할이 'system'인가?
      expect(prompt[0].role).toBe('system');
      // 3. 두 번째 메시지의 역할이 'user'인가?
      expect(prompt[1].role).toBe('user');
      // 4. 시스템 메시지에 컨텍스트가 포함되어 있는가?
      expect(prompt[0].content).toContain('머신러닝은 데이터에서 학습하는 알고리즘이다.');
      // 5. 사용자 메시지가 원본 질문과 일치하는가?
      expect(prompt[1].content).toBe(userQuery);

      console.log('OpenAI Prompt generation test passed!');
      console.log('Generated OpenAI Prompt:', JSON.stringify(prompt, null, 2));
    });
  });

  describe('Claude Strategy', () => {
    it('Claude 모델을 위한 단일 문자열 형식의 프롬프트를 생성해야 한다', () => {
      const generator = new PromptGenerator('claude');
      const prompt = generator.generate(mockBundle, userQuery);

      // 1. 반환값이 문자열인가?
      expect(typeof prompt).toBe('string');
      // 2. 컨텍스트가 <context> XML 태그로 감싸여 있는가?
      expect(prompt).toMatch(/<context>[\s\S]*<\/context>/);
      // 3. 각 노트가 <note> XML 태그로 감싸여 있는가?
      expect(prompt).toContain('<note tags="머신러닝,정의">');
      // 4. Human:과 Assistant: 형식을 따르는가?
      expect(prompt).toContain(`Human: ${userQuery}`);
      expect(prompt).toContain('Assistant:');

      console.log('Claude Prompt generation test passed!');
      console.log('Generated Claude Prompt:', prompt);
    });
  });

  it('지원하지 않는 모델에 대해서는 에러를 발생시켜야 한다', () => {
    // @ts-ignore
    const गलतModelConstructor = () => new PromptGenerator('unsupported_model');
    expect(गलतModelConstructor).toThrow('Unsupported model type: unsupported_model');
  });
}); 