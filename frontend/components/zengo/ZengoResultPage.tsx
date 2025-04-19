'use client';

import React from 'react';
import { ResultType } from '@/store/slices/zengoSlice';
import { ZengoSessionResult } from '@/src/types/zengo';
import styles from './ZengoResultPage.module.css';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface ZengoResultPageProps {
  result: ZengoSessionResult | null;
  resultType: ResultType;
  error: string | null;
  wordOrderCorrect?: boolean | null;
  onNextGame: () => void;
  onRetrySameContent: () => void;
  onBackToIntro: () => void;
}

const ZengoResultPage: React.FC<ZengoResultPageProps> = ({
  result,
  resultType,
  error,
  wordOrderCorrect,
  onNextGame,
  onRetrySameContent,
  onBackToIntro
}) => {
  // Redux 상태에서 필요한 데이터 직접 가져오기
  const { 
    placedStones, 
    usedStonesCount, 
    startTime, 
    currentContent 
  } = useSelector((state: RootState) => state.zengoProverb);

  // 계산 데이터
  const correctPlacements = placedStones.filter(stone => stone.correct).length;
  const incorrectPlacements = placedStones.filter(stone => !stone.correct).length;
  const timeTakenMs = startTime ? (Date.now() - startTime) : 0;
  
  // 컴포넌트 마운트 시 디버깅 로그 출력
  React.useEffect(() => {
    console.log('ZengoResultPage 렌더링:', { 
      hasResult: !!result, 
      resultType,
      wordOrderCorrect,
      hasError: !!error,
      calculatedData: {
        correctPlacements,
        incorrectPlacements,
        timeTakenMs,
        usedStonesCount
      }
    });
  }, [result, resultType, error, correctPlacements, incorrectPlacements, timeTakenMs, usedStonesCount, wordOrderCorrect]);

  // 에러가 있는 경우 먼저 처리
  if (error) {
    console.log('결과 페이지 에러 표시:', error);
    return (
      <div className={styles.resultContainer}>
        <div className={styles.errorResult}>
          <h2>결과 제출 중 오류가 발생했습니다</h2>
          <p className={styles.errorMessage}>{error}</p>
          <div className={styles.actionButtons}>
            <button className={styles.retryButton} onClick={onRetrySameContent}>
              다시 도전하기
            </button>
            <button className={styles.backButton} onClick={onBackToIntro}>
              메인으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 결과를 기다리는 중
  if (!result) {
    console.log('결과 대기 중...');
    return (
      <div className={styles.resultContainer}>
        <div className={styles.loading}>
          <h2>결과를 로딩 중입니다...</h2>
          <p>잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  // resultType이 없거나 유효하지 않은 경우 기본값으로 처리
  const actualResultType = resultType || 'FAIL';
  console.log('결과 표시 중:', { 
    actualResultType, 
    result,
    wordOrderCorrect,
    calculatedStats: {
      correctPlacements,
      totalWords: currentContent?.totalWords || 0,
      usedStonesCount
    } 
  });

  const getResultTitle = () => {
    switch (actualResultType) {
      case 'EXCELLENT':
        return '완벽한 성공!';
      case 'SUCCESS':
        return '성공!';
      case 'FAIL':
        return '아쉽게도 실패했습니다';
      default:
        return '게임 결과';
    }
  };

  const getResultDescription = () => {
    switch (actualResultType) {
      case 'EXCELLENT':
        return '모든 단어를 올바른 순서로 정확하게 찾았습니다.';
      case 'SUCCESS':
        return '모든 단어를 찾았으나, 순서가 맞지 않았습니다.';
      case 'FAIL':
        return '주어진 기회 내에 모든 단어를 찾지 못했습니다.';
      default:
        return '';
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  };

  // 어순 정확도 표시 컴포넌트
  const renderOrderAccuracy = () => {
    if (actualResultType === 'FAIL') return null; // 실패 시 표시하지 않음
    
    // 어순 정확도 결정 로직 개선
    // 1. wordOrderCorrect prop이 존재하면 그 값을 사용
    // 2. 없는 경우에만 resultType으로 판단 (EXCELLENT이면 정확)
    const isOrderCorrect = wordOrderCorrect !== undefined && wordOrderCorrect !== null
      ? wordOrderCorrect
      : actualResultType === 'EXCELLENT';
    
    console.log('어순 정확도 표시:', { 
      wordOrderCorrect, 
      resultType: actualResultType, 
      calculatedValue: isOrderCorrect 
    });
    
    return (
      <div className={styles.statsItem}>
        <span className={styles.statLabel}>어순 정확도:</span>
        <span className={`${styles.statValue} ${isOrderCorrect ? styles.correctValue : styles.incorrectValue}`}>
          {isOrderCorrect ? '정확함' : '부정확함'}
        </span>
      </div>
    );
  };

  return (
    <div className={styles.resultContainer}>
      <div className={`${styles.resultHeader} ${styles[actualResultType?.toLowerCase() || 'default']}`}>
        <h2>{getResultTitle()}</h2>
        <p>{getResultDescription()}</p>
      </div>

      {result && (
        <div className={styles.resultDetails}>
          <div className={styles.statsItem}>
            <span className={styles.statLabel}>총 게임 시간:</span>
            <span className={styles.statValue}>{formatTime(timeTakenMs)}</span>
          </div>

          <div className={styles.statsItem}>
            <span className={styles.statLabel}>찾은 단어:</span>
            <span className={styles.statValue}>{correctPlacements} / {currentContent?.totalWords || 0}</span>
          </div>

          <div className={styles.statsItem}>
            <span className={styles.statLabel}>사용한 돌:</span>
            <span className={styles.statValue}>{usedStonesCount}</span>
          </div>

          {/* 어순 정확도 표시 - 모든 결과 타입에 적용 (단, FAIL은 renderOrderAccuracy에서 제외) */}
          {renderOrderAccuracy()}

          {result.score !== undefined && (
            <div className={styles.statsItem}>
              <span className={styles.statLabel}>점수:</span>
              <span className={styles.statValue}>{result.score}</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.actionButtons}>
        {actualResultType === 'EXCELLENT' && (
          <div className={styles.buttonContainer}>
            <button className={styles.nextButton} onClick={onNextGame}>
              다음 게임
            </button>
          </div>
        )}

        {actualResultType === 'SUCCESS' && (
          <>
            <div className={styles.buttonContainer}>
              <button className={styles.nextButton} onClick={onNextGame}>
                다음 게임
              </button>
            </div>
            
            <div className={styles.buttonContainer}>
              <button className={styles.retryButton} onClick={onRetrySameContent}>
                같은 문장 다른 위치로 도전
              </button>
            </div>
          </>
        )}

        {actualResultType === 'FAIL' && (
          <div className={styles.buttonContainer}>
            <button className={styles.retryButton} onClick={onRetrySameContent}>
              같은 위치로 다시 도전하기
            </button>
          </div>
        )}

        <div className={styles.buttonContainer}>
          <button className={styles.backButton} onClick={onBackToIntro}>
            메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZengoResultPage; 