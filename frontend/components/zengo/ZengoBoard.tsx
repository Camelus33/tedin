'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { clearStoneFeedback } from '@/store/slices/zengoSlice';
import './ZengoBoard.css';
import { BoardStoneData, BoardSize, InteractionMode } from '@/src/types/zengo';
import { splitStoneText } from '@/src/utils/splitStoneText';
import { zengoDataCollector } from '@/lib/zengoDataCollector';

// Stone component - extracted to prevent re-renders
const Stone = React.memo(({ stone, cellSize, boardSize }: { stone: BoardStoneData; cellSize?: number; boardSize: number }) => {
  // Prepare stone value and lines unconditionally to follow hook rules
  const valueStr = stone ? String(stone.value) : '';
  const lines = useMemo(() => splitStoneText(valueStr), [valueStr]);
  if (!stone || !stone.color || stone.visible === undefined) {
    return null; // 안전하게 null 반환
  }
  
  // If text exceeds 10 chars, do not render this stone
  if (lines.length === 0) {
    return null;
  }
  
  // Calculate stone size and dynamic font size based on line count
  const sizeFactor = boardSize > 3 ? 0.7 : 0.6;
  const baseFontFactor = 0.16;
  const shrinkMultiplier = 1 - (lines.length - 1) * 0.2; // 1 line:1, 2 lines:0.8, 3 lines:0.6
  const fontFactor = baseFontFactor * shrinkMultiplier;
  const style = cellSize
    ? {
        width: `${cellSize * sizeFactor}px`,
        height: `${cellSize * sizeFactor}px`,
        fontSize: `${cellSize * fontFactor}px`,
      }
    : undefined;
  return (
    <div
      className={`stone ${stone.color} 
        ${stone.isNew ? 'animate-new' : ''} 
        ${stone.isHiding ? 'animate-hide' : ''}
        ${stone.memoryPhase ? 'memory-phase' : ''}
        ${stone.feedback ? stone.feedback : ''}`}
      style={style}
      aria-label={valueStr}
    >
      {lines.map((line, idx) => (
        <div key={idx}>{line}</div>
      ))}
    </div>
  );
});

Stone.displayName = 'Stone';

// Intersection component - extracted to prevent re-renders
interface BoardIntersectionProps {
  x: number;
  y: number;
  stone: BoardStoneData | undefined;
  isStarPoint: boolean;
  placeable: boolean;
  isShowing: boolean;
  onIntersectionClick: (position: [number, number], event?: React.MouseEvent) => void;
  cellSize?: number;
  boardSize: number;
}

const BoardIntersection = React.memo(({ 
  x, y, 
  stone, 
  isStarPoint, 
  placeable, 
  isShowing, 
  onIntersectionClick,
  cellSize,
  boardSize,
}: BoardIntersectionProps) => {
  const handleClick = useCallback((event: React.MouseEvent) => {
    onIntersectionClick([x, y], event);
  }, [x, y, onIntersectionClick]);

  return (
    <div
      className={`board-intersection ${placeable && !isShowing ? 'placeable' : ''}`}
      onClick={handleClick}
    >
      {isStarPoint && <div className="star-point"></div>}
      {stone && stone.visible === true && <Stone stone={stone} cellSize={cellSize} boardSize={boardSize} />}
    </div>
  );
});

BoardIntersection.displayName = 'BoardIntersection';

interface ZengoBoardProps {
  boardSize: BoardSize;
  stoneMap: BoardStoneData[];
  interactionMode: InteractionMode;
  onIntersectionClick: (position: [number, number]) => void;
  isShowing?: boolean;
  // === V2 데이터 수집 관련 ===
  enableDataCollection?: boolean; // 데이터 수집 활성화 여부
  correctPositions?: { x: number; y: number }[]; // 정답 위치들
  onDataCollected?: (data: any) => void; // 데이터 수집 완료 콜백
}

const ZengoBoard: React.FC<ZengoBoardProps> = ({
  boardSize,
  stoneMap,
  interactionMode,
  onIntersectionClick,
  isShowing = false,
  enableDataCollection = false,
  correctPositions = [],
  onDataCollected,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [feedbackStones, setFeedbackStones] = useState<BoardStoneData[]>([]);
  
  // === V2 데이터 수집 관련 상태 ===
  const [dataCollectionInitialized, setDataCollectionInitialized] = useState<boolean>(false);

  // === V2 데이터 수집 초기화 ===
  useEffect(() => {
    if (enableDataCollection && correctPositions.length > 0 && !dataCollectionInitialized) {
      console.log('[ZengoBoard] 데이터 수집 초기화 시작');
      zengoDataCollector.startSession(correctPositions);
      setDataCollectionInitialized(true);
    }
  }, [enableDataCollection, correctPositions, dataCollectionInitialized]);

  // === V2 마우스 움직임 추적 ===
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (enableDataCollection && dataCollectionInitialized) {
      const rect = boardContainerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        zengoDataCollector.trackMouseMovement(x, y);
      }
    }
  }, [enableDataCollection, dataCollectionInitialized]);
  
  // 모바일: w-full, max-w-[95vw], aspect-square, clamp() 등으로 완전 반응형
  // PC/패드: 기존 크기 유지
  const getResponsiveBoardSize = () => {
    if (typeof window === 'undefined') return 400;
    const vw = window.innerWidth;
    if (vw <= 640) {
      // 모바일: 거의 전체 화면 사용, 최대 95vw
      return Math.max(220, Math.min(vw * 0.95, 400));
    }
    // PC/패드: 기존 상한 유지
    if (boardSize === 3) return 400;
    if (boardSize === 5) return 500;
    if (boardSize === 7) return 650;
    return 350;
  };
  const [boardWidthPx, setBoardWidthPx] = useState(getResponsiveBoardSize());

  const stonePositionMap = useMemo(() => {
    const map = new Map<string, BoardStoneData>();
    if (!stoneMap || !Array.isArray(stoneMap)) return map;
    
    stoneMap.forEach(stone => {
      if (stone && stone.position && Array.isArray(stone.position) && stone.position.length === 2) {
        const key = `${stone.position[0]},${stone.position[1]}`;
        map.set(key, stone);
      }
    });
    return map;
  }, [stoneMap]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    const newFeedbackStones = stoneMap?.filter(stone => stone && stone.feedback) || [];
    
    if (newFeedbackStones.length > 0) {
      setFeedbackStones(newFeedbackStones);
      
      timer = setTimeout(() => {
        setFeedbackStones([]);
        newFeedbackStones.forEach(stone => {
          if (stone && stone.position && Array.isArray(stone.position) && stone.position.length === 2) {
            dispatch(clearStoneFeedback({ 
              x: stone.position[0], 
              y: stone.position[1] 
            }));
          }
        });
      }, 1000);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [stoneMap, dispatch]);

  const calculateBoardSize = useCallback(() => {
    if (!boardContainerRef.current) {
      if (boardSize === 5) return 400;
      if (boardSize === 7) return 490;
      return 300;
    }
    
    const containerWidth = boardContainerRef.current.clientWidth;
    const containerHeight = boardContainerRef.current.clientHeight || window.innerHeight;
    const minSize = boardSize === 5 ? 400 : 
                    boardSize === 7 ? 490 : 300;
    
    const size = Math.max(
      minSize,
      Math.min(containerWidth, containerHeight) - 20
    );
    
    return size;
  }, [boardSize]);

  useEffect(() => {
    let resizeTimer: NodeJS.Timeout | null = null;
    
    const handleResize = () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      
      resizeTimer = setTimeout(() => {
        setBoardWidthPx(getResponsiveBoardSize());
      }, 100);
    };

    setBoardWidthPx(getResponsiveBoardSize());
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
    };
  }, [boardSize]);

  const starPoints = useMemo(() => {
    if (boardSize === 19) {
      return [
        [3, 3], [3, 9], [3, 15],
        [9, 3], [9, 9], [9, 15],
        [15, 3], [15, 9], [15, 15]
      ];
    } else if (boardSize === 13) {
      return [[3, 3], [3, 9], [6, 6], [9, 3], [9, 9]];
    } else if (boardSize === 7) {
      return [[1, 1], [1, 5], [3, 3], [5, 1], [5, 5]];
    } else if (boardSize === 5) {
      return [[1, 1], [1, 3], [3, 1], [3, 3]];
    } else {
      return [[2, 2], [2, 6], [4, 4], [6, 2], [6, 6]];
    }
  }, [boardSize]);

  const isStarPoint = useCallback((x: number, y: number) => {
    return starPoints.some(([sx, sy]) => sx === x && sy === y);
  }, [starPoints]);

  const getStoneAtPosition = useCallback((position: [number, number]) => {
    if (!position || position.length !== 2) return undefined;
    const key = `${position[0]},${position[1]}`;
    const stone = stonePositionMap.get(key);
    
    if (stone && (!stone.position || !Array.isArray(stone.position) || stone.position.length !== 2)) {
      console.warn('Invalid stone data found:', stone);
      return undefined;
    }
    
    return stone;
  }, [stonePositionMap]);

  const isPlaceablePosition = useCallback((position: [number, number]) => {
    if (interactionMode !== 'click') return false;
    if (!position || position.length !== 2) return false;
    
    const key = `${position[0]},${position[1]}`;
    const stone = stonePositionMap.get(key);
    return stone === undefined ? false : (stone.visible === false);
  }, [interactionMode, stonePositionMap]);

  const positions = useMemo(() => {
    return Array.from({ length: boardSize }, (_, i) => 
      Array.from({ length: boardSize }, (_, j) => [i, j] as [number, number])
    ).flat();
  }, [boardSize]);

  const gridTemplateStyle = useMemo(() => {
    return {
      gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
      gridTemplateRows: `repeat(${boardSize}, 1fr)`,
      width: '100%',
      maxWidth: boardWidthPx,
      height: boardWidthPx,
      aspectRatio: '1 / 1',
    };
  }, [boardSize, boardWidthPx]);

  // Debug: log style and dimensions to verify grid layout
  useEffect(() => {
    console.log('ZengoBoard debug:', {
      gridTemplateStyle,
      boardSize,
      boardWidthPx,
      isShowing
    });
  }, [gridTemplateStyle, boardSize, boardWidthPx, isShowing]);

  const handleIntersectionClick = useCallback((position: [number, number], event?: React.MouseEvent) => {
    if (interactionMode === 'click') {
      // === V2 데이터 수집 ===
      if (enableDataCollection && dataCollectionInitialized && event) {
        const rect = boardContainerRef.current?.getBoundingClientRect();
        if (rect) {
          const clickX = event.clientX - rect.left;
          const clickY = event.clientY - rect.top;
          zengoDataCollector.recordClick(clickX, clickY, position[0], position[1]);
        }
      }
      
      onIntersectionClick(position);
    }
  }, [interactionMode, onIntersectionClick, enableDataCollection, dataCollectionInitialized]);

  // Dynamic cell size for stone rendering
  const cellSize = boardWidthPx / boardSize;

  // === V2 데이터 수집 완료 처리 ===
  const finishDataCollection = useCallback(() => {
    if (enableDataCollection && dataCollectionInitialized && onDataCollected) {
      const collectedData = zengoDataCollector.finishSession();
      onDataCollected(collectedData);
      console.log('[ZengoBoard] 데이터 수집 완료 및 콜백 호출');
    }
  }, [enableDataCollection, dataCollectionInitialized, onDataCollected]);

  return (
    <div className="board w-full max-w-[95vw] sm:max-w-[650px] aspect-square mx-auto">
      <div
        ref={boardContainerRef}
        className="zengo-board w-full h-full aspect-square"
        style={gridTemplateStyle}
        data-board-size={boardSize}
        onMouseMove={enableDataCollection ? handleMouseMove : undefined}
      >
        {positions.map(([x, y]) => {
          const stone = getStoneAtPosition([x, y]);
          const placeable = isPlaceablePosition([x, y]);
          
          return (
            <BoardIntersection
              key={`${x}-${y}`}
              x={x}
              y={y}
              stone={stone}
              isStarPoint={isStarPoint(x, y)}
              placeable={placeable}
              isShowing={isShowing}
              onIntersectionClick={handleIntersectionClick}
              cellSize={cellSize}
              boardSize={boardSize}
            />
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(ZengoBoard);

