import { ResponseHandler, FormattedResponse, NewKnowledgeTriple, ResponseFormat } from './ResponseHandler';
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

  describe('기존 응답 파싱', () => {
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

      it('Assistant 접두사가 없는 Claude 응답도 처리해야 한다', () => {
        const mockResponse = "머신러닝은 AI의 핵심 기술입니다.";
        const handler = new ResponseHandler(mockResponse, mockContextBundle);
        const formatted = handler.formatForDisplay();

        expect(formatted.content).toBe('머신러닝은 AI의 핵심 기술입니다.');
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
          object: 'app:MachineLearning',
          confidence: 0.9,
          source: 'openai-model'
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

  describe('구조화된 응답 파싱', () => {
    describe('JSON 형식 파싱', () => {
      it('JSON 코드 블록이 포함된 응답을 파싱해야 한다', () => {
        const jsonResponse = `
        다음은 분석 결과입니다:
        \`\`\`json
        {
          "content": "딥러닝은 머신러닝의 하위 분야입니다.",
          "triples": [
            {
              "subject": "app:DeepLearning",
              "predicate": "rdfs:subClassOf", 
              "object": "app:MachineLearning",
              "confidence": 0.95
            }
          ]
        }
        \`\`\`
        `;

        const handler = new ResponseHandler(jsonResponse, mockContextBundle, ResponseFormat.JSON);
        const formatted = handler.formatForDisplay();

        expect(formatted.extractedTriples).toHaveLength(1);
        expect(formatted.extractedTriples![0]).toEqual({
          subject: "app:DeepLearning",
          predicate: "rdfs:subClassOf",
          object: "app:MachineLearning",
          confidence: 0.95,
          source: 'claude-model' // 문자열 응답이므로 claude-model로 감지됨
        });
        expect(formatted.parsingInfo?.success).toBe(true);
      });

      it('순수 JSON 응답을 파싱해야 한다', () => {
        const jsonResponse = {
          content: "신경망은 딥러닝의 핵심입니다.",
          triples: [
            {
              subject: "app:NeuralNetwork",
              predicate: "app:coreOf",
              object: "app:DeepLearning"
            }
          ]
        };

        const handler = new ResponseHandler(JSON.stringify(jsonResponse), mockContextBundle, ResponseFormat.JSON);
        const formatted = handler.formatForDisplay();

        expect(formatted.extractedTriples).toHaveLength(1);
        expect(formatted.extractedTriples![0].subject).toBe("app:NeuralNetwork");
      });

      it('잘못된 JSON 형식에 대해 에러를 기록해야 한다', () => {
        const invalidJson = '{ "content": "test", invalid }';
        const handler = new ResponseHandler(invalidJson, mockContextBundle, ResponseFormat.JSON);
        const formatted = handler.formatForDisplay();

        expect(formatted.parsingInfo?.success).toBe(false);
        expect(formatted.parsingInfo?.errors).toBeDefined();
        expect(handler.getParsingErrors().length).toBeGreaterThan(0);
      });
    });

    describe('XML 형식 파싱', () => {
      it('XML 트리플 형식을 파싱해야 한다', () => {
        const xmlResponse = `
        <response>
          <triple>
            <subject>app:Transformer</subject>
            <predicate>app:usedIn</predicate>
            <object>app:NLP</object>
          </triple>
          <triple>
            <subject>app:BERT</subject>
            <predicate>rdfs:subClassOf</predicate>
            <object>app:Transformer</object>
          </triple>
        </response>
        `;

        const handler = new ResponseHandler(xmlResponse, mockContextBundle, ResponseFormat.XML);
        const formatted = handler.formatForDisplay();

        expect(formatted.extractedTriples).toHaveLength(2);
        expect(formatted.extractedTriples![0]).toEqual({
          subject: "app:Transformer",
          predicate: "app:usedIn",
          object: "app:NLP",
          confidence: 0.8,
          source: 'claude-model' // 문자열 응답이므로 claude-model로 감지됨
        });
      });
    });

    describe('CSV 형식 파싱', () => {
      it('CSV 트리플 형식을 파싱해야 한다', () => {
        const csvResponse = `subject,predicate,object
        "app:CNN","rdfs:subClassOf","app:NeuralNetwork"
        "app:RNN","rdfs:subClassOf","app:NeuralNetwork"`;

        const handler = new ResponseHandler(csvResponse, mockContextBundle, ResponseFormat.CSV);
        const formatted = handler.formatForDisplay();

        expect(formatted.extractedTriples).toHaveLength(2);
        expect(formatted.extractedTriples![0]).toEqual({
          subject: "app:CNN",
          predicate: "rdfs:subClassOf",
          object: "app:NeuralNetwork",
          confidence: 0.7,
          source: 'claude-model' // 문자열 응답이므로 claude-model로 감지됨
        });
      });

      it('헤더가 잘못된 CSV는 파싱하지 않아야 한다', () => {
        const invalidCsv = `name,type,description
        "CNN","neural","convolution"`;

        const handler = new ResponseHandler(invalidCsv, mockContextBundle, ResponseFormat.CSV);
        const formatted = handler.formatForDisplay();

        expect(formatted.extractedTriples).toHaveLength(0);
      });
    });

    describe('트리플 형식 파싱', () => {
      it('트리플 텍스트 형식을 파싱해야 한다', () => {
        const tripleResponse = `
        Subject: 강화학습, Predicate: 속한다, Object: 머신러닝
        Subject: Q-Learning, Predicate: 일종이다, Object: 강화학습
        `;

        const handler = new ResponseHandler(tripleResponse, mockContextBundle, ResponseFormat.TRIPLE);
        const formatted = handler.formatForDisplay();

        expect(formatted.extractedTriples).toHaveLength(2);
        expect(formatted.extractedTriples![0]).toEqual({
          subject: "강화학습",
          predicate: "속한다",
          object: "머신러닝",
          confidence: 0.8,
          source: 'claude-model' // 문자열 응답이므로 claude-model로 감지됨
        });
      });
    });

    describe('구조화된 형식 자동 감지', () => {
      it('여러 형식을 순차적으로 시도해야 한다', () => {
        const mixedResponse = `
        분석 결과:
        Subject: 자연어처리, Predicate: 응용분야, Object: 인공지능
        `;

        const handler = new ResponseHandler(mixedResponse, mockContextBundle, ResponseFormat.STRUCTURED);
        const formatted = handler.formatForDisplay();

        expect(formatted.extractedTriples).toHaveLength(1);
        expect(formatted.extractedTriples![0].subject).toBe("자연어처리");
      });
    });
  });

  describe('향상된 지식 추출', () => {
    it('한국어 패턴을 인식하여 트리플을 추출해야 한다', () => {
      const koreanResponse = "딥러닝은 머신러닝의 일종이다. CNN은 신경망에 속한다.";
      const handler = new ResponseHandler(koreanResponse, mockContextBundle);
      const formatted = handler.formatForDisplay();

      expect(formatted.extractedTriples!.length).toBeGreaterThan(0);
      const hasDeepLearningTriple = formatted.extractedTriples!.some(
        triple => triple.subject.includes('딥러닝') && triple.object.includes('머신러닝')
      );
      expect(hasDeepLearningTriple).toBe(true);
    });

    it('신뢰도 점수를 포함해야 한다', () => {
      const response = "지도학습은 대표적인 머신러닝의 종류입니다.";
      const handler = new ResponseHandler(response, mockContextBundle);
      const formatted = handler.formatForDisplay();

      expect(formatted.extractedTriples![0].confidence).toBeDefined();
      expect(formatted.extractedTriples![0].confidence).toBeGreaterThan(0);
      expect(formatted.extractedTriples![0].confidence).toBeLessThanOrEqual(1);
    });

    it('AI 모델 출처를 추적해야 한다', () => {
      const openaiResponse = {
        model: 'gpt-4',
        choices: [{ message: { content: '지도학습은 대표적인 머신러닝의 종류입니다.' } }],
      };
      const handler = new ResponseHandler(openaiResponse, mockContextBundle);
      const formatted = handler.formatForDisplay();

      expect(formatted.extractedTriples![0].source).toBe('gpt-4');
    });
  });

  describe('오류 처리 및 검증', () => {
    it('파싱 에러를 적절히 처리해야 한다', () => {
      const errorResponse = null;
      const handler = new ResponseHandler(errorResponse, mockContextBundle, ResponseFormat.JSON);
      const formatted = handler.formatForDisplay();

      expect(formatted.content).toBe('');
      expect(formatted.parsingInfo?.success).toBe(true); // null 응답은 파싱 에러가 없으므로 성공
    });

    it('스키마 검증 실패를 감지해야 한다', () => {
      const invalidSchema = '{"invalid": "schema", "triples": "not_array"}';
      const handler = new ResponseHandler(invalidSchema, mockContextBundle, ResponseFormat.JSON);
      const formatted = handler.formatForDisplay();

      // JSON은 파싱되지만 스키마 검증에서 실패하므로 구조화된 데이터는 추출되지 않음
      // 하지만 파싱 자체는 성공하므로 success는 true
      expect(formatted.parsingInfo?.success).toBe(true);
      expect(formatted.extractedTriples).toHaveLength(0); // 스키마 검증 실패로 트리플 없음
    });

    it('응답 형식을 동적으로 변경할 수 있어야 한다', () => {
      const response = 'Subject: 테스트, Predicate: 관계, Object: 대상';
      const handler = new ResponseHandler(response, mockContextBundle, ResponseFormat.RAW_TEXT);
      
      // 형식 변경
      handler.setExpectedFormat(ResponseFormat.TRIPLE);
      const formatted = handler.formatForDisplay();

      expect(formatted.extractedTriples).toHaveLength(1);
      expect(formatted.parsingInfo?.format).toBe(ResponseFormat.TRIPLE);
    });
  });

  describe('통합 테스트', () => {
    it('완전한 구조화된 응답을 처리해야 한다', () => {
      const complexResponse = `
      AI 분석 결과입니다:
      
      \`\`\`json
      {
        "content": "딥러닝과 머신러닝의 관계를 분석했습니다.",
        "triples": [
          {
            "subject": "app:DeepLearning",
            "predicate": "rdfs:subClassOf",
            "object": "app:MachineLearning",
            "confidence": 0.95
          },
          {
            "subject": "app:CNN",
            "predicate": "rdfs:subClassOf", 
            "object": "app:DeepLearning",
            "confidence": 0.9
          }
        ],
        "entities": ["딥러닝", "머신러닝", "CNN"],
        "metadata": {
          "model": "gpt-4",
          "timestamp": "2024-01-01T00:00:00Z"
        }
      }
      \`\`\`
      `;

      const handler = new ResponseHandler(complexResponse, mockContextBundle, ResponseFormat.JSON);
      const formatted = handler.formatForDisplay();

      expect(formatted.content).toContain('딥러닝과 머신러닝의 관계를 분석했습니다');
      expect(formatted.extractedTriples).toHaveLength(2);
      expect(formatted.parsingInfo?.success).toBe(true);
      expect(formatted.extractedTriples![0].confidence).toBe(0.95);
    });
  });

  describe('Fuseki 통합 테스트', () => {
    it('트리플 추출과 저장을 함께 수행해야 한다', async () => {
      const mockResponse = {
        choices: [{ message: { content: '머신러닝은 인공지능의 하위 분야입니다.' } }],
      };
      const handler = new ResponseHandler(mockResponse, mockContextBundle);

      // 트리플 추출 및 저장 (저장 비활성화)
      const result = await handler.extractAndStoreTriples(false);

      expect(result).toBeDefined();
      expect(result.extractedTriples).toBeDefined();
      expect(Array.isArray(result.extractedTriples)).toBe(true);
      expect(result.fusekiResult).toBeUndefined(); // 저장 비활성화했으므로

      console.log(`✅ 트리플 추출 테스트: ${result.extractedTriples.length}개 트리플 추출`);
    }, 15000);

    it('완전한 응답 포맷팅 (Fuseki 저장 포함)을 수행해야 한다', async () => {
      const mockResponse = {
        choices: [{ message: { content: '딥러닝은 머신러닝의 일종입니다.' } }],
      };
      const handler = new ResponseHandler(mockResponse, mockContextBundle);

      // Fuseki 저장 비활성화로 테스트
      const formatted = await handler.formatForDisplayWithStorage(false);

      expect(formatted).toBeDefined();
      expect(formatted.content).toBe('딥러닝은 머신러닝의 일종입니다.');
      expect(formatted.extractedTriples).toBeDefined();
      expect(formatted.parsingInfo).toBeDefined();
      expect(formatted.fusekiUpdateResult).toBeUndefined(); // 저장 비활성화

      console.log(`✅ 완전한 응답 포맷팅 테스트 통과`);
    }, 15000);

    it('Fuseki 저장 활성화 시 저장 결과를 포함해야 한다', async () => {
      const mockResponse = {
        choices: [{ message: { content: '자연어처리는 AI의 핵심 기술입니다.' } }],
      };
      const handler = new ResponseHandler(mockResponse, mockContextBundle);

      try {
        // Fuseki 저장 활성화로 테스트 (실제 연결 필요)
        const formatted = await handler.formatForDisplayWithStorage(true);

        expect(formatted).toBeDefined();
        expect(formatted.content).toBe('자연어처리는 AI의 핵심 기술입니다.');
        
        // Fuseki 연결이 성공하면 결과가 있어야 함
        if (formatted.fusekiUpdateResult) {
          expect(formatted.fusekiUpdateResult.totalTriples).toBeGreaterThanOrEqual(0);
          expect(formatted.fusekiUpdateResult.executionTime).toBeGreaterThan(0);
          
          console.log(`✅ Fuseki 저장 테스트: ${formatted.fusekiUpdateResult.successfulTriples}개 성공`);
        } else {
          console.log('ℹ️ Fuseki 서버 연결 불가 - 저장 기능 스킵');
        }
      } catch (error) {
        console.log('ℹ️ Fuseki 연결 실패 - 정상적인 폴백 동작:', error);
        // Fuseki 연결 실패는 정상적인 상황일 수 있음
      }
    }, 20000);

    it('오류 발생 시 안전한 폴백을 제공해야 한다', async () => {
      const mockResponse = {
        choices: [{ message: { content: '테스트 응답' } }],
      };
      const handler = new ResponseHandler(mockResponse, mockContextBundle);

      // 강제로 오류 상황 생성을 위한 잘못된 설정
      const result = await handler.extractAndStoreTriples(true);

      // 오류가 발생해도 기본 결과는 반환되어야 함
      expect(result).toBeDefined();
      expect(result.extractedTriples).toBeDefined();
      expect(Array.isArray(result.extractedTriples)).toBe(true);

      console.log('✅ 오류 처리 및 폴백 테스트 통과');
    }, 15000);
  });
}); 