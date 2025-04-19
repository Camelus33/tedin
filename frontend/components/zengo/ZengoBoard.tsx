'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { clearStoneFeedback } from '@/store/slices/zengoSlice';
import './ZengoBoard.css';
import { BoardStoneData, BoardSize, InteractionMode } from '@/src/types/zengo';

// Stone component - extracted to prevent re-renders
const Stone = React.memo(({ stone, cellSize, boardSize }: { stone: BoardStoneData; cellSize?: number; boardSize: number }) => {
  if (!stone || !stone.color || stone.visible === undefined) {
    return null; // 안전하게 null 반환
  }
  
  const sizeFactor = boardSize > 3 ? 0.7 : 0.6;
  const fontFactor = 0.16;
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
    >
      {stone.value}
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
  onIntersectionClick: (position: [number, number]) => void;
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
  const handleClick = useCallback(() => {
    onIntersectionClick([x, y]);
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
}

const ZengoBoard: React.FC<ZengoBoardProps> = ({
  boardSize,
  stoneMap,
  interactionMode,
  onIntersectionClick,
  isShowing = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [feedbackStones, setFeedbackStones] = useState<BoardStoneData[]>([]);
  
  // Initial board size: dynamic based on viewport width (80% of vw) with upper limits
  const initialSize = useMemo(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 800;
    const maxSize = vw * 0.8;
    if (boardSize === 3) return Math.min(maxSize, 400);   // 3x3: 조금 더 크게
    if (boardSize === 5) return Math.min(maxSize, 500);
    if (boardSize === 7) return Math.min(maxSize, 650);
    return Math.min(maxSize, 350);
  }, [boardSize]);
  
  const [boardWidthPx, setBoardWidthPx] = useState(initialSize);

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
        setBoardWidthPx(calculateBoardSize());
      }, 100);
    };

    setBoardWidthPx(calculateBoardSize());
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
    };
  }, [calculateBoardSize]);

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
      width: `${boardWidthPx}px`,
      height: `${boardWidthPx}px`,
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

  const handleIntersectionClick = useCallback((position: [number, number]) => {
    if (interactionMode === 'click') {
      onIntersectionClick(position);
    }
  }, [interactionMode, onIntersectionClick]);

  // Dynamic cell size for stone rendering
  const cellSize = boardWidthPx / boardSize;

  return (
    <div className="board">
      <div
        ref={boardContainerRef}
        className="zengo-board"
        style={gridTemplateStyle}
        data-board-size={boardSize}
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

