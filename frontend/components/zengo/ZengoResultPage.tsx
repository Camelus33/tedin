'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ResultType } from '@/store/slices/zengoSlice';
import { ZengoSessionResult, IMyVerseSessionResult } from '@/src/types/zengo';
import styles from './ZengoResultPage.module.css';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface ZengoResultPageProps {
  result: ZengoSessionResult | IMyVerseSessionResult | null;
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
  const t = useTranslations('zengo.result');
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
          <h2>{t('errorTitle')}</h2>
          <p className={styles.errorMessage}>{error}</p>
          <div className={styles.actionButtons}>
            <button className={styles.retryButton} onClick={onRetrySameContent}>
              {t('buttonTryAgain')}
            </button>
            <button className={styles.backButton} onClick={onBackToIntro}>
              {t('buttonGameSettings')}
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
          <h2>{t('loadingTitle')}</h2>
          <p>{t('loadingMessage')}</p>
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
        return t('titleExcellent');
      case 'SUCCESS':
        return t('titleSuccess');
      case 'FAIL':
        return t('titleFail');
      default:
        return t('titleDefault');
    }
  };

  const getResultDescription = () => {
    switch (actualResultType) {
      case 'EXCELLENT':
        return t('descriptionExcellent');
      case 'SUCCESS':
        return t('descriptionSuccess');
      case 'FAIL':
        return t('descriptionFail');
      default:
        return '';
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}${t('timeUnitMinutes')} ${remainingSeconds}${t('timeUnitSeconds')}`;
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
        <span className={styles.statLabel}>{t('labelOrderAccuracy')}</span>
        <span className={`${styles.statValue} ${isOrderCorrect ? styles.correctValue : styles.incorrectValue}`}>
          {isOrderCorrect ? t('valueCorrect') : t('valueIncorrect')}
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
            <span className={styles.statLabel}>{t('labelTime')}</span>
            <span className={styles.statValue}>{formatTime(timeTakenMs)}</span>
          </div>

          <div className={styles.statsItem}>
            <span className={styles.statLabel}>{t('labelWordsFound')}</span>
            <span className={styles.statValue}>{correctPlacements} / {currentContent?.totalWords || 0}</span>
          </div>

          <div className={styles.statsItem}>
            <span className={styles.statLabel}>{t('labelStonesUsed')}</span>
            <span className={styles.statValue}>{usedStonesCount}</span>
          </div>

          {/* 어순 정확도 표시 - 모든 결과 타입에 적용 (단, FAIL은 renderOrderAccuracy에서 제외) */}
          {renderOrderAccuracy()}

          {result.score !== undefined && (
            <div className={styles.statsItem}>
              <span className={styles.statLabel}>{t('labelScore')}</span>
              <span className={styles.statValue}>{result.score}</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.actionButtons}>
        {actualResultType === 'EXCELLENT' && (
          <div className={styles.buttonContainer}>
            <button className={styles.nextButton} onClick={onNextGame}>
              {t('buttonNextGame')}
            </button>
          </div>
        )}

        {actualResultType === 'SUCCESS' && (
          <>
            <div className={styles.buttonContainer}>
              <button className={styles.nextButton} onClick={onNextGame}>
                {t('buttonNextGame')}
              </button>
            </div>
            
            <div className={styles.buttonContainer}>
              <button className={styles.retryButton} onClick={onRetrySameContent}>
                {t('buttonRetrySameSentence')}
              </button>
            </div>
          </>
        )}

        {actualResultType === 'FAIL' && (
          <div className={styles.buttonContainer}>
            <button className={styles.retryButton} onClick={onRetrySameContent}>
              {t('buttonRetrySamePosition')}
            </button>
          </div>
        )}

        <div className={styles.buttonContainer}>
          <button className={styles.backButton} onClick={onBackToIntro}>
            {t('buttonGameSettings')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZengoResultPage; 