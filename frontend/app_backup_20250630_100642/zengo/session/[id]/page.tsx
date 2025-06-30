'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ZengoBoard from '@/components/zengo/ZengoBoard';
import '@/app/zengo/zengo.css';
import './session.css';
import { zengo as zengoApi } from '@/lib/api';
import { BoardSize } from '@/src/types/zengo';

// Zengo 세션 페이지 - 바둑판을 이용한 인지 훈련 세션
export default function ZengoSession() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(60); // 60초 기본 타이머
  const [score, setScore] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [stones, setStones] = useState<any[]>([]);
  const [showCorrectFeedback, setShowCorrectFeedback] = useState<boolean>(false);
  const [showWrongFeedback, setShowWrongFeedback] = useState<boolean>(false);

  // 세션 데이터 가져오기
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        // API 서비스를 사용하여 세션 데이터 조회
        let data;
        
        try {
          data = await zengoApi.getById(sessionId);
        } catch (apiError) {
          console.log('API 접근 실패, 목업 데이터 사용:', apiError);
          // 목업 데이터로 대체
          data = {
            id: sessionId,
            userId: 'user123',
            boardSize: 5,
            moduleType: 'language',
            status: 'active',
            createdAt: new Date().toISOString(),
          };
        }

        setSession(data);
        initializeBoardAndProblem(data.boardSize, data.moduleType);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('세션을 불러올 수 없습니다. 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId]);

  // 타이머 설정
  useEffect(() => {
    if (!loading && !error) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            endSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, error]);

  // 바둑판과 문제 초기화
  const initializeBoardAndProblem = (boardSize: number, moduleType: string) => {
    // 모듈 타입에 따라 돌 패턴 생성
    const stonePattern = generateStonePattern(boardSize, moduleType);
    setStones(stonePattern);
    
    // 첫 문제 생성
    generateProblem(boardSize, moduleType);
  };

  // 바둑돌 패턴 생성
  const generateStonePattern = (boardSize: number, moduleType: string) => {
    const pattern = [];
    
    // 훈련 유형에 따라 다른 패턴 생성
    switch (moduleType) {
      case 'language':
        // 언어 모듈은 단어를 바둑판에 배치
        const words = ['산', '바다', '강', '하늘', '땅'];
        const colors = ['black', 'white'];
        
        for (let i = 0; i < Math.min(boardSize, words.length); i++) {
          pattern.push({
            position: [i, i],
            value: words[i],
            color: colors[i % 2] as 'black' | 'white',
            visible: true
          });
        }
        break;
        
      case 'memory':
        // 기억 모듈은 숫자 시퀀스
        for (let i = 0; i < boardSize; i++) {
          pattern.push({
            position: [i, Math.floor(boardSize/2)],
            value: i + 1,
            color: i % 2 === 0 ? 'black' : 'white',
            visible: true
          });
        }
        break;
        
      case 'math':
        // 수학 모듈은 숫자를 가진 돌
        for (let i = 0; i < Math.min(5, boardSize * boardSize); i++) {
          const x = i % boardSize;
          const y = Math.floor(i / boardSize);
          pattern.push({
            position: [x, y],
            value: i + 1,
            color: (x + y) % 2 === 0 ? 'black' : 'white',
            visible: true
          });
        }
        break;
        
      default:
        // 기본 패턴
        for (let i = 0; i < 3; i++) {
          pattern.push({
            position: [i, i],
            value: i + 1,
            color: i % 2 === 0 ? 'black' : 'white',
            visible: true
          });
        }
    }
    
    return pattern;
  };

  // 문제 생성 함수
  const generateProblem = (boardSize: number, moduleType: string) => {
    let problem;
    
    switch (moduleType) {
      case 'math':
        problem = generateMathProblem(boardSize);
        break;
      case 'language':
        problem = generateLanguageProblem(boardSize);
        break;
      case 'memory':
        problem = generateMemoryProblem(boardSize);
        break;
      default:
        problem = generateMathProblem(boardSize);
    }
    
    setCurrentProblem(problem);
  };

  // 수리력 문제 생성
  const generateMathProblem = (boardSize: number) => {
    const difficulty = Math.min(boardSize, 9); // 난이도 조정
    const num1 = Math.floor(Math.random() * difficulty * 10);
    const num2 = Math.floor(Math.random() * difficulty * 5);
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let correctAnswer;
    let question;
    
    switch (operation) {
      case '+':
        correctAnswer = num1 + num2;
        question = `${num1} + ${num2} = ?`;
        break;
      case '-':
        correctAnswer = num1 - num2;
        question = `${num1} - ${num2} = ?`;
        break;
      case '*':
        correctAnswer = num1 * num2;
        question = `${num1} × ${num2} = ?`;
        break;
      default:
        correctAnswer = num1 + num2;
        question = `${num1} + ${num2} = ?`;
    }
    
    return {
      question,
      correctAnswer: correctAnswer.toString(),
      type: 'math'
    };
  };

  // 언어 문제 생성
  const generateLanguageProblem = (boardSize: number) => {
    const words = ['산', '바다', '강', '하늘', '땅', '숲', '불', '물', '바람', '꽃'];
    const randomIndex = Math.floor(Math.random() * Math.min(words.length, boardSize));
    const word = words[randomIndex];
    
    return {
      question: `다음 단어를 입력하세요: ${word}`,
      correctAnswer: word,
      type: 'language'
    };
  };
  
  // 기억력 문제 생성
  const generateMemoryProblem = (boardSize: number) => {
    const sequences = [
      '1, 3, 5, 7, 9',
      '2, 4, 6, 8, 10',
      '10, 20, 30, 40, 50',
      '1, 2, 4, 8, 16',
      '5, 10, 15, 20, 25'
    ];
    const randomIndex = Math.floor(Math.random() * Math.min(sequences.length, boardSize));
    const sequence = sequences[randomIndex];
    
    return {
      question: `다음 수열을 기억했다가 입력하세요: ${sequence}`,
      correctAnswer: sequence,
      type: 'memory'
    };
  };

  // 답변 제출 함수
  const submitAnswer = () => {
    if (!currentProblem || !userAnswer.trim()) return;
    
    const isCorrect = userAnswer.trim() === currentProblem.correctAnswer.trim();
    
    // 피드백 표시
    if (isCorrect) {
      setShowCorrectFeedback(true);
      setTimeout(() => setShowCorrectFeedback(false), 1000);
      setScore(prev => prev + 10);
    } else {
      setShowWrongFeedback(true);
      setTimeout(() => setShowWrongFeedback(false), 1000);
    }
    
    // 입력 초기화 및 다음 문제 생성
    setUserAnswer('');
    
    if (session) {
      setTimeout(() => {
        generateProblem(session.boardSize, session.moduleType);
      }, 1000); // 1초 후 다음 문제
    }
  };

  // 세션 종료 함수
  const endSession = async () => {
    try {
      // API 서비스를 사용하여 세션 완료 처리
      try {
        await zengoApi.complete(sessionId, {
          score,
          moduleResults: {
            accuracy: score > 0 ? 100 : 0,
            reactionTimeAvg: 60 - timeLeft,
            score
          }
        });
      } catch (apiError) {
        console.log('API 접근 실패:', apiError);
        // 에러가 발생해도 결과 페이지로 이동
      }
      
      // 결과 페이지로 이동
      router.push(`/zengo/results/${sessionId}`);
    } catch (err) {
      console.error('Error ending session:', err);
      setError('세션을 종료하는데 문제가 발생했습니다.');
    }
  };

  if (loading) {
    return <div className="zengo-container loading">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="zengo-container error">
        <p>{error}</p>
        <button onClick={() => router.push('/zengo')}>돌아가기</button>
      </div>
    );
  }

  return (
    <div className="zengo-container">
      <div className="zengo-header">
        <h1>젠고 훈련 세션</h1>
        <div className="session-info">
          <div className="timer">남은 시간: {timeLeft}초</div>
          <div className="score">점수: {score}</div>
        </div>
      </div>

      <div className="zengo-training-content">
        <div className="zengo-board-container">
          <ZengoBoard 
            boardSize={session?.boardSize as BoardSize || 9} 
            stoneMap={stones}
            interactionMode="view"
            onIntersectionClick={() => {}}
            isShowing={false}
          />
          
          <div className="problem-container">
            <h2>문제</h2>
            <p className="problem-text">{currentProblem?.question}</p>
            
            <div className="answer-input">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="답변을 입력하세요"
                onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
              />
              <button onClick={submitAnswer}>제출</button>
            </div>
            
            {showCorrectFeedback && (
              <div className="feedback correct">
                정답입니다! +10점
              </div>
            )}
            
            {showWrongFeedback && (
              <div className="feedback wrong">
                오답입니다! 다시 시도하세요.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="zengo-footer">
        <button onClick={endSession} className="end-session-button">
          훈련 종료하기
        </button>
      </div>
    </div>
  );
} 