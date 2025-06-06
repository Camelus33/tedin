'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';

// 시계열 데이터 포인트 정의
interface TimeSeriesDataPoint {
  date: string;
  value: number;
  baseline?: number;
}

interface TimeSeriesChartCardProps {
  title: string;
  description: string;
  data: TimeSeriesDataPoint[];
  metricLabel: string;
  yAxisLabel?: string;
  showBaseline?: boolean;
  baselineLabel?: string;
  maxValue?: number;
}

const TimeSeriesChartCard: React.FC<TimeSeriesChartCardProps> = ({ 
  title, 
  description, 
  data, 
  metricLabel, 
  yAxisLabel, 
  showBaseline = false,
  baselineLabel = '이전 평균',
  maxValue
}) => {
  const [appear, setAppear] = useState(false);
  const [activeData, setActiveData] = useState<TimeSeriesDataPoint | null>(null);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [userGoal, setUserGoal] = useState<number | null>(null);
  const [goalInputValue, setGoalInputValue] = useState('');
  const [isSettingGoal, setIsSettingGoal] = useState(false);
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [goalReflection, setGoalReflection] = useState<string | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 부드러운 등장 효과
    const timer = setTimeout(() => setAppear(true), 800);
    
    // 애니메이션 완료 후 상태 업데이트
    const animationTimer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1500);

    // 저장된 목표 불러오기
    const savedGoal = localStorage.getItem(`${metricLabel}-goal`);
    if (savedGoal) {
      setUserGoal(Number(savedGoal));
    }
    
    // 저장된 목표 반성 불러오기
    const savedReflection = localStorage.getItem(`${metricLabel}-reflection`);
    if (savedReflection) {
      setGoalReflection(savedReflection);
    }
    
    return () => {
      clearTimeout(timer);
      clearTimeout(animationTimer);
    };
  }, [metricLabel]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!chartContainerRef.current || !animationComplete) return;
    
    const chart = chartContainerRef.current;
    const chartRect = chart.getBoundingClientRect();
    const chartWidth = chartRect.width;
    
    // 마우스 X 위치의 상대 위치 계산 (0-1 사이)
    const relativeX = (e.clientX - chartRect.left) / chartWidth;
    
    // 데이터 포인트 인덱스 계산
    const dataIndex = Math.min(
      Math.max(0, Math.floor(relativeX * data.length)),
      data.length - 1
    );
    
    setSelectedPointIndex(dataIndex);
    setActiveData(data[dataIndex]);
  };

  const handleMouseLeave = () => {
    setSelectedPointIndex(null);
    setActiveData(null);
  };

  // 성장 메시지 생성
  const getGrowthMessage = () => {
    if (!data || data.length < 2) return "더 많은 데이터가 필요합니다.";
    
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const growth = lastValue - firstValue;
    
    if (growth > 10) return "놀라운 성장을 이루고 있습니다!";
    if (growth > 5) return "꾸준히 발전하고 있습니다.";
    if (growth > 0) return "조금씩 성장하고 있습니다.";
    if (growth === 0) return "안정적인 수준을 유지하고 있습니다.";
    if (growth > -5) return "작은 변동이 있습니다. 지속적인 연습이 도움이 됩니다.";
    return "새로운 도전과 연습이 필요한 시기입니다.";
  };

  // 목표 설정
  const handleSetGoal = () => {
    const goalValue = Number(goalInputValue);
    if (!isNaN(goalValue) && goalValue > 0) {
      setUserGoal(goalValue);
      localStorage.setItem(`${metricLabel}-goal`, goalValue.toString());
      setIsSettingGoal(false);
      setShowGoalInput(false);
    }
  };

  // 목표 진행률 계산
  const calculateGoalProgress = () => {
    if (!userGoal || !data || data.length === 0) return 0;
    const currentValue = data[data.length - 1].value;
    return Math.min(100, (currentValue / userGoal) * 100);
  };

  // 목표 리셋
  const handleResetGoal = () => {
    setUserGoal(null);
    localStorage.removeItem(`${metricLabel}-goal`);
    setGoalReflection(null);
    localStorage.removeItem(`${metricLabel}-reflection`);
  };

  // 목표 반성 저장
  const handleSaveReflection = (text: string) => {
    setGoalReflection(text);
    localStorage.setItem(`${metricLabel}-reflection`, text);
  };

  if (!data || data.length === 0) {
    return (
      <Card className="habitus-transition">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl">{title}</CardTitle>
          <CardDescription className="text-sm sm:text-md">{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-sm text-muted-foreground">아직 시계열 데이터가 충분하지 않습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 사용자 진행 상황 계산
  const progressPercentage = data.length > 1 
    ? Math.min(100, Math.max(0, ((data[data.length - 1].value - data[0].value) / Math.max(1, data[0].value)) * 100))
    : 0;

  // Y축 도메인 계산
  let yDomain: [number, number] = [0, 100];
  if (maxValue) {
    yDomain = [0, maxValue];
  } else {
    const maxDataValue = Math.max(...data.map(d => d.value));
    const goalValue = userGoal || 0;
    yDomain = [0, Math.max(100, Math.ceil(maxDataValue * 1.1), goalValue * 1.2)];
  }

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as TimeSeriesDataPoint;
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded">
          <p className="text-xs font-medium">{formatDate(data.date)}</p>
          <p className="text-xs">
            {metricLabel}: <span className="font-semibold">{data.value}</span>
          </p>
          {showBaseline && data.baseline !== undefined && (
            <p className="text-xs">
              {baselineLabel}: <span className="font-semibold">{data.baseline}</span>
            </p>
          )}
          {userGoal && (
            <p className="text-xs">
              목표까지: <span className="font-semibold">{Math.max(0, userGoal - data.value)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // 사용자 목표 반성 입력 폼
  const ReflectionForm = () => {
    const [text, setText] = useState(goalReflection || '');
    
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium mb-2" style={{ color: 'rgb(var(--primary-indigo))' }}>
          목표에 대한 나의 성찰
        </h4>
        <textarea
          className="w-full p-2 border border-gray-200 rounded text-sm mb-2"
          rows={3}
          placeholder="이 목표의 의미와 달성 계획에 대해 생각해보세요..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex justify-end">
          <Button
            className="text-xs"
            size="sm"
            style={{ backgroundColor: 'rgb(var(--primary-indigo))' }}
            onClick={() => handleSaveReflection(text)}
          >
            저장
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className={`quiet-victory ${appear ? 'appear' : ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl">{title}</CardTitle>
        <CardDescription className="text-sm sm:text-md">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {/* 목표 설정 영역 */}
        <div className="mb-4">
          {userGoal ? (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium" style={{ color: 'rgb(var(--primary-indigo))' }}>
                  나의 목표: {userGoal}
                </h4>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs py-1 h-auto"
                    onClick={() => setShowGoalInput(true)}
                  >
                    수정
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs py-1 h-auto text-red-500 border-red-200 hover:bg-red-50"
                    onClick={handleResetGoal}
                  >
                    삭제
                  </Button>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000"
                  style={{ 
                    width: `${calculateGoalProgress()}%`,
                    backgroundColor: 'rgb(var(--primary-indigo))'
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">
                진행률: {calculateGoalProgress().toFixed(1)}%
              </p>
              
              {showGoalInput ? (
                <div className="mt-2 flex space-x-2">
                  <Input
                    type="number"
                    placeholder="새 목표 값"
                    className="text-sm"
                    value={goalInputValue}
                    onChange={(e) => setGoalInputValue(e.target.value)}
                  />
                  <Button 
                    size="sm"
                    className="text-xs"
                    style={{ backgroundColor: 'rgb(var(--primary-indigo))' }}
                    onClick={handleSetGoal}
                  >
                    저장
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => setShowGoalInput(false)}
                  >
                    취소
                  </Button>
                </div>
              ) : null}
              
              {userGoal && <ReflectionForm />}
            </div>
          ) : (
            <div className="flex justify-end">
              {isSettingGoal ? (
                <div className="flex space-x-2 w-full">
                  <Input
                    type="number"
                    placeholder="목표 값을 입력하세요"
                    className="text-sm"
                    value={goalInputValue}
                    onChange={(e) => setGoalInputValue(e.target.value)}
                  />
                  <Button 
                    size="sm"
                    className="text-xs whitespace-nowrap"
                    style={{ backgroundColor: 'rgb(var(--primary-indigo))' }}
                    onClick={handleSetGoal}
                  >
                    목표 설정
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => setIsSettingGoal(false)}
                  >
                    취소
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setIsSettingGoal(true)}
                >
                  목표 설정하기
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div 
          ref={chartContainerRef}
          className="h-64 w-full relative" 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                style={{ fontSize: '0.75rem' }}
              />
              <YAxis 
                domain={yDomain}
                label={{ 
                  value: yAxisLabel, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: '0.75rem' }
                }}
                style={{ fontSize: '0.75rem' }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              
              {/* 목표선 추가 */}
              {userGoal && (
                <ReferenceLine 
                  y={userGoal} 
                  stroke="rgb(var(--primary-indigo))" 
                  strokeDasharray="3 3"
                  label={{
                    value: `목표: ${userGoal}`,
                    position: 'right',
                    fill: 'rgb(var(--primary-indigo))',
                    fontSize: 12
                  }}
                />
              )}
              
              {showBaseline && (
                <Line
                  type="monotone"
                  dataKey="baseline"
                  stroke="rgba(var(--secondary-beige), 0.7)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                  name={baselineLabel}
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke="rgb(var(--primary-indigo))"
                strokeWidth={3}
                activeDot={{
                  r: 6,
                  stroke: 'rgb(var(--primary-turquoise))',
                  strokeWidth: 2,
                  fill: 'white'
                }}
                name={metricLabel}
                // 성장 그래프 애니메이션 효과
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
              {selectedPointIndex !== null && (
                <ReferenceLine
                  x={data[selectedPointIndex].date}
                  stroke="rgb(var(--primary-turquoise))"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
          
          {/* 활성 데이터 포인트 정보 */}
          {activeData && (
            <div 
              className="absolute bg-white p-3 rounded-lg shadow-md border border-gray-100 transition-opacity duration-300 ease-in-out"
              style={{ 
                opacity: 1,
                left: `${(selectedPointIndex || 0) / (data.length - 1) * 100}%`,
                transform: 'translateX(-50%)',
                top: 0
              }}
            >
              <p className="text-sm font-medium" style={{ color: 'rgb(var(--primary-indigo))' }}>
                {formatDate(activeData.date)}
              </p>
              <p className="text-xs">
                {metricLabel}: <span className="font-semibold">{activeData.value}</span>
              </p>
            </div>
          )}
        </div>
        
        {/* 진행 상황 메시지 */}
        <div className="mt-6 text-center">
          <p className="text-sm font-medium" style={{ color: 'rgb(var(--secondary-green))' }}>
            {getGrowthMessage()}
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <span 
              className="text-xs py-1 px-2 rounded-full"
              style={{ 
                backgroundColor: 'rgba(var(--primary-indigo), 0.1)',
                color: 'rgb(var(--primary-indigo))'
              }}
            >
              시작: {data.length > 0 ? data[0].value : 0}
            </span>
            <span 
              className="text-xs py-1 px-2 rounded-full"
              style={{ 
                backgroundColor: 'rgba(var(--primary-turquoise), 0.1)',
                color: 'rgb(var(--primary-turquoise))'
              }}
            >
              현재: {data.length > 0 ? data[data.length - 1].value : 0}
            </span>
            <span 
              className="text-xs py-1 px-2 rounded-full"
              style={{ 
                backgroundColor: 'rgba(var(--secondary-green), 0.1)',
                color: 'rgb(var(--secondary-green))'
              }}
            >
              성장: {progressPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeSeriesChartCard; 