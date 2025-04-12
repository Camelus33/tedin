'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ZengoBoard from '@/components/zengo/ZengoBoard';
import '@/app/zengo/zengo.css';
import './results.css';
import { zengo as zengoApi } from '@/lib/api';
import { BoardSize } from '@/src/types/zengo';

// 젠고 결과 페이지
export default function ZengoResults() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [stones, setStones] = useState<any[]>([]);

  // 결과 데이터 가져오기
  useEffect(() => {
    const fetchResultsData = async () => {
      try {
        // API 서비스를 사용하여 결과 데이터 조회
        let data;
        
        try {
          data = await zengoApi.getResults(sessionId);
        } catch (apiError) {
          console.log('API 접근 실패, 목업 데이터 사용:', apiError);
          // 목업 데이터로 대체
          data = {
            id: sessionId,
            userId: 'user123',
            boardSize: 5,
            moduleType: 'language',
            moduleResults: {
              accuracy: 85,
              reactionTimeAvg: 2.3,
              memoryScore: 75,
              languageScore: 90,
              logicScore: 82
            },
            overallScore: 85,
            badges: ['fast_thinker', 'language_expert'],
            completedAt: new Date().toISOString(),
            trainingDuration: 58, // 초 단위
          };
        }

        setResults(data);
        generateStones(data.boardSize, data.moduleType);
        generateBadges(data.badges);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('결과를 불러올 수 없습니다. 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchResultsData();
    }
  }, [sessionId]);

  // 결과 시각화를 위한 바둑돌 패턴 생성
  const generateStones = (boardSize: number, moduleType: string) => {
    const pattern = [];
    
    // 결과 데이터를 바탕으로 바둑돌 패턴 생성
    switch (moduleType) {
      case 'language':
        // 언어 모듈 결과 시각화
        const words = ['언어', '능력', '향상', '독서', '집중'];
        
        for (let i = 0; i < Math.min(boardSize, words.length); i++) {
          pattern.push({
            position: [i, i],
            value: words[i],
            color: i % 2 === 0 ? 'black' : 'white',
            visible: true
          });
        }
        break;
        
      case 'memory':
        // 기억력 모듈 결과 시각화
        for (let i = 0; i < boardSize; i++) {
          const isCorrect = Math.random() > 0.3; // 70% 확률로 맞춘 것으로 표시
          
          pattern.push({
            position: [i, Math.floor(boardSize/2)],
            value: i + 1,
            color: isCorrect ? 'black' : 'white',
            visible: true
          });
        }
        break;
        
      case 'math':
        // 수리력 모듈 결과 시각화
        for (let i = 0; i < Math.min(5, boardSize * boardSize); i++) {
          const x = i % boardSize;
          const y = Math.floor(i / boardSize);
          const isCorrect = Math.random() > 0.2; // 80% 확률로 맞춘 것으로 표시
          
          pattern.push({
            position: [x, y],
            value: i + 1,
            color: isCorrect ? 'black' : 'white',
            visible: true
          });
        }
        break;
        
      default:
        // 기본 결과 시각화
        for (let i = 0; i < 3; i++) {
          pattern.push({
            position: [i, i],
            value: '✓',
            color: 'black',
            visible: true
          });
        }
    }
    
    setStones(pattern);
  };

  // 획득한 뱃지 정보 설정
  const generateBadges = (badgeCodes: string[]) => {
    const badgeInfo = {
      fast_thinker: {
        name: '빠른 사고가',
        description: '평균 응답 시간 3초 이내',
        icon: '⚡'
      },
      perfect_score: {
        name: '완벽주의자',
        description: '모든 문제 정답',
        icon: '🎯'
      },
      language_expert: {
        name: '언어의 달인',
        description: '언어 모듈 90점 이상',
        icon: '📝'
      },
      memory_master: {
        name: '기억력의 대가',
        description: '기억력 모듈 90점 이상',
        icon: '🧠'
      },
      math_wiz: {
        name: '수학 천재',
        description: '수리력 모듈 90점 이상',
        icon: '🔢'
      }
    };
    
    const badgeList = badgeCodes.map(code => {
      return {
        code,
        ...(badgeInfo[code as keyof typeof badgeInfo] || {
          name: '알 수 없는 뱃지',
          description: '정보가 없습니다',
          icon: '❓'
        })
      };
    });
    
    setBadges(badgeList);
  };

  // 다음 훈련 추천 생성
  const getNextTrainingRecommendation = () => {
    if (!results) return null;
    
    const { moduleResults } = results;
    let recommendation = {
      moduleType: '',
      boardSize: results.boardSize,
      reason: ''
    };
    
    // 가장 낮은 점수의 모듈을 찾아 추천
    if (moduleResults.languageScore <= moduleResults.memoryScore && 
        moduleResults.languageScore <= moduleResults.logicScore) {
      recommendation = {
        moduleType: 'language',
        boardSize: results.boardSize,
        reason: '언어 능력을 더 향상시키면 더 효과적인 독서가 가능합니다.'
      };
    } else if (moduleResults.memoryScore <= moduleResults.logicScore) {
      recommendation = {
        moduleType: 'memory',
        boardSize: results.boardSize,
        reason: '기억력을 더 향상시키면 독서 중 내용을 더 잘 기억할 수 있습니다.'
      };
    } else {
      recommendation = {
        moduleType: 'math',
        boardSize: results.boardSize,
        reason: '논리적 사고력을 더 향상시키면 독서의 이해도가 높아집니다.'
      };
    }
    
    // 점수가 높으면 보드 크기 증가 추천
    if (results.overallScore >= 90 && results.boardSize < 5) {
      recommendation.boardSize = results.boardSize + 1;
      recommendation.reason += ' 현재 수준이 높으니 한 단계 높은 난이도에 도전해보세요.';
    }
    
    return recommendation;
  };
  
  // 결과 공유 기능
  const shareResults = () => {
    if (!results) return;
    
    const shareText = `젠고 인지훈련에서 ${results.overallScore}점을 획득했습니다! #젠고 #인지훈련 #하비투스33`;
    
    // 네이티브 공유 API가 있는 경우 사용
    if (navigator.share) {
      navigator.share({
        title: '젠고 인지훈련 결과',
        text: shareText,
        url: window.location.href,
      })
      .catch((error) => console.log('공유 실패:', error));
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(shareText)
        .then(() => alert('결과가 클립보드에 복사되었습니다.'))
        .catch(() => alert('클립보드 복사에 실패했습니다.'));
    }
  };

  if (loading) {
    return <div className="zengo-container loading">결과 로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="zengo-container error">
        <p>{error}</p>
        <button onClick={() => router.push('/zengo')}>돌아가기</button>
      </div>
    );
  }

  const nextTraining = getNextTrainingRecommendation();

  return (
    <div className="zengo-container">
      <div className="zengo-header">
        <h1>젠고 훈련 결과</h1>
        <div className="share-button" onClick={shareResults}>
          결과 공유하기
        </div>
      </div>

      <div className="results-main">
        <div className="results-summary">
          <div className="score-circle large">
            <div className="score-value">{results?.overallScore || 0}</div>
            <div className="score-label">총점</div>
          </div>
          
          <div className="training-info">
            <div className="info-item">
              <span className="info-label">훈련 모듈:</span> 
              <span className="info-value">
                {results?.moduleType === 'language' && '언어능력'}
                {results?.moduleType === 'memory' && '기억력'}
                {results?.moduleType === 'math' && '수리력'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">보드 크기:</span> 
              <span className="info-value">{results?.boardSize}x{results?.boardSize}</span>
            </div>
            <div className="info-item">
              <span className="info-label">소요 시간:</span> 
              <span className="info-value">{results?.trainingDuration}초</span>
            </div>
          </div>
        </div>
        
        <div className="results-board">
          <h2>훈련 결과</h2>
          <ZengoBoard 
            boardSize={results?.boardSize as BoardSize || 9} 
            stoneMap={stones}
            interactionMode="view"
            onIntersectionClick={() => {}}
            isShowing={false}
          />
        </div>
      </div>
      
      <div className="metrics-section">
        <h2>상세 성과</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <h3>정확도</h3>
            <div className="metric-value">{results?.moduleResults.accuracy}%</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">⏱️</div>
            <h3>평균 응답 시간</h3>
            <div className="metric-value">{results?.moduleResults.reactionTimeAvg}초</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🧠</div>
            <h3>기억력 점수</h3>
            <div className="metric-value">{results?.moduleResults.memoryScore}</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📝</div>
            <h3>언어 점수</h3>
            <div className="metric-value">{results?.moduleResults.languageScore}</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🔢</div>
            <h3>논리 점수</h3>
            <div className="metric-value">{results?.moduleResults.logicScore}</div>
          </div>
        </div>
      </div>
      
      {badges.length > 0 && (
        <div className="badges-section">
          <h2>획득한 뱃지</h2>
          <div className="badges-grid">
            {badges.map((badge, index) => (
              <div key={index} className="badge-card">
                <div className="badge-icon">{badge.icon}</div>
                <h3>{badge.name}</h3>
                <p>{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {nextTraining && (
        <div className="recommendation-section">
          <h2>다음 훈련 추천</h2>
          <div className="recommendation-card">
            <div className="recommendation-content">
              <h3>
                {nextTraining.moduleType === 'language' && '언어능력'}
                {nextTraining.moduleType === 'memory' && '기억력'}
                {nextTraining.moduleType === 'math' && '수리력'} 
                {nextTraining.boardSize}x{nextTraining.boardSize}
              </h3>
              <p>{nextTraining.reason}</p>
            </div>
            <Link href="/zengo" className="try-button">시작하기</Link>
          </div>
        </div>
      )}
      
      <div className="action-buttons">
        <Link href="/zengo" className="continue-button">
          다른 훈련하기
        </Link>
        <Link href="/dashboard" className="exit-button">
          대시보드로 이동
        </Link>
      </div>
    </div>
  );
} 