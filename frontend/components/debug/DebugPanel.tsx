'use client';

import { useState, useEffect } from 'react';
import { debugLogger, LogEntry } from '../../lib/debug';

interface DebugPanelProps {
  initiallyVisible?: boolean;
}

export function DebugPanel({ initiallyVisible = false }: DebugPanelProps) {
  const [visible, setVisible] = useState(initiallyVisible);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // 로그 업데이트 구독
    const unsubscribe = debugLogger.subscribe((newLogs) => {
      setLogs(newLogs);
    });
    
    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, []);

  // 로그 필터링
  const filteredLogs = selectedLevel === 'all' 
    ? logs 
    : logs.filter(log => log.level === selectedLevel);

  // 로그 레벨에 따른 색상
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-500';
      case 'warn': return 'text-yellow-500';
      case 'http': return 'text-blue-500';
      case 'info': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  // 로그 상세 정보 토글
  const toggleExpand = (index: number) => {
    setExpanded(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // 포매팅된 시간 표시
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  // 환경이 개발 모드가 아니면 아무것도 렌더링하지 않음
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 font-mono text-sm">
      <button
        onClick={() => setVisible(!visible)}
        className="bg-gray-800 text-white p-2 rounded-md shadow-lg hover:bg-gray-700 transition-colors"
      >
        {visible ? '🔽 디버그 패널 숨기기' : '🔼 디버그 패널 보기'}
      </button>

      {visible && (
        <div className="mt-2 w-[600px] max-h-[500px] bg-gray-900 bg-opacity-95 text-gray-200 rounded-lg shadow-xl overflow-hidden flex flex-col">
          <div className="p-3 bg-gray-800 flex justify-between items-center border-b border-gray-700">
            <div className="font-bold">Habitus33 디버그 콘솔</div>
            <div className="flex space-x-2">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-gray-700 text-white text-xs p-1 rounded border border-gray-600"
              >
                <option value="all">모든 로그</option>
                <option value="info">Info</option>
                <option value="http">HTTP</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
              </select>
              <button
                onClick={() => debugLogger.clearLogs()}
                className="bg-gray-700 hover:bg-gray-600 text-xs px-2 py-1 rounded"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-grow">
            {filteredLogs.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                아직 로그가 없습니다
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {filteredLogs.map((log, index) => (
                  <div key={index} className="px-3 py-2 hover:bg-gray-800">
                    <div 
                      className="flex justify-between items-start cursor-pointer"
                      onClick={() => toggleExpand(index)}
                    >
                      <div className="flex items-start">
                        <div className={`font-bold mr-2 ${getLevelColor(log.level)}`}>
                          [{log.level.toUpperCase()}]
                        </div>
                        <div className="truncate max-w-[360px]">{log.message}</div>
                      </div>
                      <div className="text-gray-400 text-xs">
                        {formatTime(log.timestamp)}
                      </div>
                    </div>

                    {/* 상세 내용 */}
                    {expanded[index] && log.details && (
                      <div className="mt-2 p-2 bg-gray-800 rounded text-xs overflow-x-auto">
                        <pre className="whitespace-pre-wrap break-words">
                          {typeof log.details === 'string' 
                            ? log.details 
                            : JSON.stringify(log.details, null, 2)
                          }
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 text-xs text-center text-gray-500 border-t border-gray-800">
            로그 수: {filteredLogs.length} / {logs.length}
          </div>
        </div>
      )}
    </div>
  );
} 