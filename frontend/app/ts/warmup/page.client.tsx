'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/common/Button';
import Spinner from '@/components/ui/Spinner';
import { InformationCircleIcon, CheckCircleIcon, XCircleIcon, LightBulbIcon, ClockIcon, ChevronRightIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';
import { warmupEventsService, type WarmupEventClientPayload } from '@/lib/apiClient';
import { v4 as uuidv4 } from 'uuid';

// Cyber Theme Definition (Consistent with other TS pages)
const cyberTheme = {
  primary: 'text-cyan-400',
  secondary: 'text-purple-400',
  bgPrimary: 'bg-gray-900',
  bgSecondary: 'bg-gray-800',
  cardBg: 'bg-gray-800/60',
  borderPrimary: 'border-cyan-500',
  borderSecondary: 'border-purple-500',
  gradient: 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900',
  textMuted: 'text-gray-400',
  textLight: 'text-gray-300',
  inputBg: 'bg-gray-700/50',
  inputBorder: 'border-gray-600',
  inputFocusBorder: 'focus:border-cyan-500',
  inputFocusRing: 'focus:ring-cyan-500/50',
  progressBarBg: 'bg-gray-700',
  progressFg: 'bg-cyan-500',
  buttonPrimaryBg: 'bg-cyan-600',
  buttonPrimaryHoverBg: 'hover:bg-cyan-700',
  buttonSecondaryBg: 'bg-gray-700/50',
  buttonSecondaryHoverBg: 'hover:bg-gray-600/50',
  buttonDisabledBg: 'bg-gray-600',
  tipBg: 'bg-gray-700/80',
  tipBorder: 'border-gray-500/50',
  tipIcon: 'text-yellow-400',
  errorText: 'text-red-400',
  errorBorder: 'border-red-500/50',
};

// NEW TYPE DEFINITIONS for Exercise Variations and Configuration

// Parameter types for each variation
type BreathingVariationParams = {
  name: string; // e.g., "Standard", "Box Breathing", "4-7-8"
  durations: { inhale: number; hold1?: number; exhale: number; hold2?: number }; // in ms
  totalCycles: number;
  instructionText: string;
};

type EyeTrackingVariationParams = {
  name: string; 
  targetType?: 'dot' | 'icon' | 'shape'; // Made optional
  movementPattern?: 'horizontal' | 'vertical' | 'circular' | 'figureEight' | 'randomJumps' | 'disappearing' | 'horizontalJumps' | 'verticalJumps' | 'peripheral';
  speed?: 'slow' | 'medium' | 'fast'; 
  targetCount?: number;
  repetitions?: number; 
  durationPerSpot?: number; 
  disappearDuration?: number; 
  locations?: Array<{ top: string; left: string }>;
  instructionText: string;
  // Fields for peripheral expansion - can be integrated or a new type created
  stimulusType?: 'shape' | 'letter' | 'number'; // Re-added from previous thought, makes sense for peripheral
  stimulusCount?: number; // How many stimuli appear at once for peripheral
  presentationTime?: number; // ms, for peripheral stimulus display
  interStimulusInterval?: number; // ms, for peripheral interval
};

type VisualSpanVariationParams = {
  name: string; // e.g., "Grid Letters", "Expanding Words"
  stimulusType: 'letters' | 'symbols' | 'words';
  gridSize?: { rows: number; cols: number }; // for grid based
  stimuliCount?: number; // number of items presented simultaneously
  wordLength?: number; // for word-based stimuli
  presentationTime: number; // ms
  interStimulusInterval: number; // ms
  repetitions: number;
  instructionText: string;
};

type TextFlowVariationParams = {
  name: string; // e.g., "Accelerating Scroll", "Rhythmic Highlight"
  contentType: 'randomChars' | 'simpleStory' | 'wordGroups';
  flowType: 'scroll' | 'highlight' | 'flash';
  initialSpeed: number; // chars/sec or words/sec or ms/word
  acceleration?: number; // speed increase per second or per block
  highlightRhythm?: number; // bpm for rhythmic highlight
  totalDuration?: number; // in seconds
  presentationTime?: number;
  interStimulusInterval?: number;
  wordsPerGroup?: number;
  totalGroups?: number;
  instructionText: string;
};

// Union type for any variation parameters
type AnyVariationParams = 
  | BreathingVariationParams 
  | EyeTrackingVariationParams
  | VisualSpanVariationParams
  | TextFlowVariationParams;

// Base configuration for each of the 4 main exercise types
type ExerciseConfig = {
  id: string; // e.g., 'guided_breathing', 'eye_tracking'
  title: string; // Main title for the exercise group
  generalDescription: string; // General description for this type of exercise
  tip?: string; // General tip for this type of exercise
  variations: AnyVariationParams[]; // Array of possible variations
};

// Type for the currently active exercise including its specific variation details
type ActiveExercise = {
  id: string;
  title: string; // This will be a combination of main title + variation name
  description: string; // Combination of general description + variation instruction
  tip?: string;
  variationParams: AnyVariationParams;
  // We will also need a 'completionMark' or similar to enable the 'Next' button,
  // replacing the old 'options' and 'correctAnswer' logic.
  // For now, a simple button press will advance.
};

// OLD TYPES (To be commented out / removed)
/*
// Types for warmup exercises
type Exercise = {
  type: string;
  title: string;
  description: string;
  content: string | React.ReactNode; // Allow ReactNode for styled content
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  tip?: string;
  // States for dynamic exercises - will be managed within the component,
  // but type can be extended if common state structures emerge.
  initialLogic?: (setShowStimulus: React.Dispatch<React.SetStateAction<boolean>>, setInternalStep: React.Dispatch<React.SetStateAction<number>>) => void;
  stimulusDuration?: number; // General duration for timed stimuli
  // For Chunking Practice - specific data structure
  chunks?: Array<{
    text: string;
    question: string; // Question specific to this chunk
    options: string[];
    correctAnswer: string;
  }>;
};
*/

// Removed: const updateStimuli = [5, 8, 2]; // Not used

// NEW EXERCISE CONFIGURATIONS
const EXERCISE_CONFIGURATIONS: ExerciseConfig[] = [
  {
    id: 'guided_breathing',
    title: '마음챙김 호흡',
    generalDescription: '편안한 자세로 화면의 안내에 따라 숨을 조절하여 뇌에 신선한 산소를 듬뿍 넣어주세요.',
    tip: '숨을 내쉴 때 마음 속 긴장이 함께 빠져나가는 장면을 떠올려 보세요.',
    variations: [
      {
        name: '기본 호흡',
        durations: { inhale: 3000, hold1: 1000, exhale: 4000 },
        totalCycles: 2,
        instructionText: '기본 호흡: 들이쉬기(3초) - 잠시 멈춤(1초) - 내쉬기(4초)를 2회 반복합니다.'
      } as BreathingVariationParams,
      {
        name: '박스 호흡',
        durations: { inhale: 3000, hold1: 3000, exhale: 3000, hold2: 3000 },
        totalCycles: 1,
        instructionText: '박스 호흡: 들이쉬기(3초) - 멈춤(3초) - 내쉬기(3초) - 멈춤(3초)를 1회 수행합니다.'
      } as BreathingVariationParams,
      {
        name: '이완 호흡 (간소화 변형)',
        durations: { inhale: 2000, hold1: 3000, exhale: 4000 },
        totalCycles: 2,
        instructionText: '이완 호흡: 들이쉬기(2초) - 멈춤(3초) - 내쉬기(4초)를 2회 반복합니다.'
      } as BreathingVariationParams,
    ],
  },
  {
    id: 'peripheral_vision_expansion',
    title: '고정점 응시와 주변 시야 확장',
    generalDescription: '중앙의 한 점에 시선을 고정한 채, 주변에 나타나는 시각적 자극을 인지하여 시야 범위를 넓히는 훈련입니다. 시선을 옮기지 않는 것이 중요합니다.',
    tip: '중심점을 계속 바라보면서 주변에 무엇이 나타나는지 느껴보세요. 모든 것을 다 볼 필요는 없어요.',
    variations: [
      {
        name: '단일 자극 순차 제시',
        stimulusType: 'shape',
        stimulusCount: 1,
        presentationTime: 300,
        interStimulusInterval: 700,
        repetitions: 15,
        locations: [
          { top: '15%', left: '15%' }, { top: '15%', left: '50%' }, { top: '15%', left: '85%' },
          { top: '50%', left: '15%' }, { top: '50%', left: '85%' },
          { top: '85%', left: '15%' }, { top: '85%', left: '50%' }, { top: '85%', left: '85%' },
        ],
        instructionText: '중앙의 점을 응시하세요. 주변에 나타나는 도형을 인지해 보세요.'
      } as EyeTrackingVariationParams,
    ],
  },
  
  {
    id: 'text_flow',
    title: '텍스트 흐름 훈련',
    generalDescription: '시야가 넓어질수록 파도는 더 멀리 퍼져나갑니다.',
    tip: '물결처럼 흐르는 텍스트를 따라가며 깊은 바다로 들어가세요. 물결 위에 떠 있듯 자연스럽게 흐름을 타보세요.',
    variations: [
      {
        name: '가속 단어 하이라이트',
        contentType: 'simpleStory',
        flowType: 'highlight',
        initialSpeed: 550,
        acceleration: 0.98,
        totalDuration: 16,
        instructionText: '하이라이트되는 단어를 따라 시선을 이동하세요. 속도가 점차 빨라지며 16초 내에 종료됩니다.'
      } as TextFlowVariationParams,
      {
        name: '단어 그룹 순간 노출',
        contentType: 'wordGroups',
        flowType: 'flash',
        presentationTime: 400,
        interStimulusInterval: 600,
        wordsPerGroup: 3,
        totalGroups: 15,
        instructionText: '화면 중앙에 짧게 나타나는 단어 그룹을 한눈에 파악하세요.'
      } as TextFlowVariationParams,
    ],
  },
];

export default function TSWarmupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  // Raw event buffer (not reactive)
  const eventsRef = useRef<WarmupEventClientPayload['events']>([]);

  const getModeIdForEvents = (exerciseId: string) => {
    if (exerciseId === 'peripheral_vision_expansion') return 'peripheral_vision' as const;
    if (exerciseId === 'guided_breathing') return 'guided_breathing' as const;
    return 'text_flow' as const;
  };

  const pushEvent = (exerciseId: string, eventType: string, data: Record<string, any>) => {
    const mode = getModeIdForEvents(exerciseId);
    eventsRef.current.push({
      mode,
      eventType,
      ts: new Date().toISOString(),
      clientEventId: uuidv4(),
      data,
    });
  };

  const [timeLeft, setTimeLeft] = useState<number>(60); // Total time for 3 exercises (3 x 20s)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0); // Renamed for clarity
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showTip, setShowTip] = useState(false);

  // NEW state for the currently active exercise and its chosen variation
  const [activeExerciseDetail, setActiveExerciseDetail] = useState<ActiveExercise | null>(null);
  const [userInteracted, setUserInteracted] = useState<boolean>(false); // Used to enable next button after an interaction

  // States for dynamic content within exercises
  // These will be controlled by specific logic for each exercise type
  const [exerciseInternalStep, setExerciseInternalStep] = useState<number>(0); // General step counter for multi-step exercises
  // const [showExerciseStimulus, setShowExerciseStimulus] = useState<boolean>(true); // This might be managed within each exercise's logic
  
  // States specific to Guided Breathing
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2' | 'done'>('inhale');
  const [breathingCycle, setBreathingCycle] = useState<number>(1);
  // const TOTAL_BREATHING_CYCLES = 3; // Will come from variationParams
  // const BREATHING_DURATIONS = { inhale: 4000, hold: 2000, exhale: 6000 }; // Will come from variationParams

  // States specific to Eye Saccades / Tracking (Old - will be repurposed/removed for peripheral)
  const [dotPosition, setDotPosition] = useState<{ top: string, left: string } | null>(null); // Will be used for the *central* fixed dot in peripheral.
  const [saccadeStep, setSaccadeStep] = useState<number>(0); // May not be needed.
  const [saccadeCycleCount, setSaccadeCycleCount] = useState<number>(0); // May not be needed.

  // NEW States for Peripheral Vision Expansion
  const [peripheralStimulus, setPeripheralStimulus] = useState<{
    location: { top: string, left: string };
    shape: 'circle' | 'square'; // Example shapes
    color: string; // Example color
    visible: boolean;
    id: number; // For key prop
  } | null>(null);
  const [peripheralRepetitionCount, setPeripheralRepetitionCount] = useState<number>(0);
  const [showCentralFixation, setShowCentralFixation] = useState<boolean>(true);
  const [peripheralStartTime, setPeripheralStartTime] = useState<number>(0);
  const [probeShownAt, setProbeShownAt] = useState<number | null>(null);
  const [probeRtMs, setProbeRtMs] = useState<number | null>(null);
  const [lastPeripheralTarget, setLastPeripheralTarget] = useState<'left' | 'right' | null>(null);
  const [lastAfcChoice, setLastAfcChoice] = useState<'left' | 'right' | null>(null);
  const [lastAfcCorrect, setLastAfcCorrect] = useState<boolean | null>(null);
  // Stimulus summary metrics
  const [stimulusCount, setStimulusCount] = useState<number>(0);
  const [presentDurations, setPresentDurations] = useState<number[]>([]);
  const [isiDurations, setIsiDurations] = useState<number[]>([]);
  const [quadrantCounts, setQuadrantCounts] = useState<{ Q1: number; Q2: number; Q3: number; Q4: number }>({ Q1: 0, Q2: 0, Q3: 0, Q4: 0 });

  // States specific to Chunking Practice / Visual Span
  const [chunkingPhase, setChunkingPhase] = useState<'showing' | 'hidden' | 'question' | 'done'>('hidden'); // Adapt for visual span
  // const [currentChunkToDisplay, setCurrentChunkToDisplay] = useState<NonNullable<Exercise['chunks']>[number] | null>(null); // Old, to be removed/replaced
  // const CHUNK_DISPLAY_DURATION = 1200; // Old
  // const CHUNK_BETWEEN_DURATION = 500; // Old
  // States for Visual Span specifically
  const [currentVisualSpanStimulus, setCurrentVisualSpanStimulus] = useState<string[] | string | null>(null); // e.g. array of letters for grid
  const [visualSpanRepetitionCount, setVisualSpanRepetitionCount] = useState<number>(0);

  // States for Eye Tracking Challenge (OLD - to be removed or heavily adapted)
  const [eyeTrackingPhase, setEyeTrackingPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [eyeTrackingCurrentRep, setEyeTrackingCurrentRep] = useState<number>(0);
  const [eyeTrackingTime, setEyeTrackingTime] = useState<number>(0); 

  // States for Visual Span Grid
  type GridCell = { letter: string | null; id: number };
  const [gridStimulus, setGridStimulus] = useState<GridCell[]>([]);
  const [visualSpanPhase, setVisualSpanPhase] = useState<'idle' | 'presenting' | 'interval' | 'done'>('idle');

  // States specific to Text Flow
  const [textFlowContent, setTextFlowContent] = useState<string[]>([]); // For highlight or word groups
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState<number>(-1); // For highlight
  // const [currentScrollPosition, setCurrentScrollPosition] = useState<number>(0); // OLD - For scroll, to be removed
  const [textFlowPhase, setTextFlowPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [currentWordSpeed, setCurrentWordSpeed] = useState<number>(500); 
  const [textFlowStartTime, setTextFlowStartTime] = useState<number>(0); 
  // NEW states for Word Group Flashing
  const [currentWordGroup, setCurrentWordGroup] = useState<string>('');
  const [currentGroupIndex, setCurrentGroupIndex] = useState<number>(0);
  const [wordGroupBank, setWordGroupBank] = useState<string[]>([]);
  const [highlightIntervals, setHighlightIntervals] = useState<number[]>([]);
  const [lastHighlightTs, setLastHighlightTs] = useState<number>(0);
  const [comprehensionAnswer, setComprehensionAnswer] = useState<boolean | null>(null);

  // Breathing measurement states
  const [relaxationBefore, setRelaxationBefore] = useState<number | null>(null);
  const [relaxationAfter, setRelaxationAfter] = useState<number | null>(null);

  // Accessibility & input
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [fixationHighContrast, setFixationHighContrast] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // Predefined simple stories for Text Flow - Highlight variation
  const SIMPLE_STORIES = [
    "작은 고양이가 햇볕 아래에서 낮잠을 잡니다. 바람이 부드럽게 나뭇잎을 흔듭니다. 새들이 하늘에서 노래합니다. 오늘은 참 평화로운 날입니다.",
    "소년은 강가에 앉아 물고기를 잡고 있었습니다. 갑자기 큰 물고기가 미끼를 물었습니다. 소년은 힘껏 낚싯대를 당겼습니다. 결국 멋진 물고기를 잡았습니다.",
    "소녀는 언덕 위에서 연을 날리고 있었습니다. 연은 바람을 타고 높이높이 올라갔습니다. 소녀는 웃으며 연을 바라보았습니다. 정말 신나는 하루였습니다.",
    "아침 일찍 농부가 밭으로 나갑니다. 오늘은 씨앗을 심을 예정입니다. 땅을 부드럽게 만들고 씨앗을 뿌립니다. 풍성한 수확을 기대합니다."
  ];

  const RANDOM_CHAR_LINES = [
    "xKzV RqWmP SvBn LkFcT",
    "aYjU sDbN oIhGv cXeWp",
    "mZoX qLyR bMwA jKuHv",
    "pSeC fVdN gHtJ lQwE",
    "uYrT wAcS zXiB nMpLo",
    "kFjD hGrS lPaM cVbN",
    "qZwX eRvT bNuM iOpL",
    "aSkD fGjH lQwE rTyU",
  ];

  // Predefined word groups for 'Word Group Flashing'
  const WORD_GROUPS_BANK: string[][] = [
    ["푸른", "하늘", "위로"],
    ["맑은", "강물이", "흐른다"],
    ["새들이", "즐겁게", "노래해"],
    ["따뜻한", "햇살", "가득"],
    ["시원한", "바람", "불어와"],
    ["넓은", "들판", "너머로"],
    ["예쁜", "꽃들이", "피었네"],
    ["조용한", "숲길", "산책"],
    ["높은", "산봉우리", "정상"],
    ["밤하늘", "별들이", "반짝"],
    ["빠르게", "달리는", "기차"],
    ["맛있는", "음식을", "먹자"],
    ["재미있는", "이야기", "한편"],
    ["새로운", "지식을", "배워"],
    ["함께", "미래를", "만들자"],
  ];

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // OLD EXERCISES ARRAY (To be commented out / removed)
  /*
  // Exercises focusing on cognitive priming for reading speed - Engaging & Challenging
  const exercises: Exercise[] = [
    {
      type: 'guided_breathing',
      title: '뇌 산소 충전! 편안한 심호흡',
      description: '편안한 자세로 화면의 안내에 따라 숨을 깊게 들이마시고, 천천히 내쉬세요. 뇌에 신선한 산소를 공급하여 집중력을 높여줍니다.',
      content: <p className="text-lg text-center">호흡 안내가 시작됩니다...</p>, // Placeholder, will be dynamic
      question: '안내에 따라 심호흡을 마치셨나요?',
      options: ['네, 마쳤습니다'], // Simple confirmation
      correctAnswer: '네, 마쳤습니다',
      tip: '숨을 내쉴 때 어깨와 몸의 긴장이 함께 빠져나간다고 상상해보세요. 편안한 마음이 예열의 첫걸음입니다.',
    },
    {
      type: 'eye_saccades',
      title: '시선 점프! 안구 스트레칭',
      description: '화면에 나타나는 목표 지점을 따라 눈동자만 빠르게 움직여보세요. 고개는 고정! 안구 근육을 유연하게 만들어 독서 시 시선 이동을 부드럽게 합니다.',
      content: <p className="text-lg text-center">안구 운동 목표 지점이 곧 나타납니다...</p>, // Placeholder, will be dynamic
      question: '목표 지점을 놓치지 않고 눈으로 따라오셨나요?',
      options: ['네, 잘 따라했습니다'], // Simple confirmation
      correctAnswer: '네, 잘 따라했습니다',
      tip: '머리는 최대한 움직이지 않고 눈동자만 빠르게 움직이는 것이 중요해요! 파도가 퍼져나가듯 시선을 넓혀보세요.',
    },
    {
      type: 'chunking_practice',
      title: '덩어리로 한눈에! 시야 확장',
      description: '화면에 짧게 나타나는 여러 단어 덩어리를 한 번의 시선으로 읽는 연습입니다. 눈이 머무는 횟수를 줄여 독서 속도를 높여줍니다.',
      content: <p className="text-lg text-center">단어 덩어리가 곧 제시됩니다...</p>, 
      question: '마지막으로 제시된 단어 덩어리는 무엇이었나요?', // Fallback/general question if needed
      options: [], // Will be populated from chunk data if in question phase
      correctAnswer: '', // Will be populated from chunk data
      chunks: [
        { text: '푸른 하늘 아래', question: '첫 번째로 나타난 덩어리는 무엇이었나요?', options: ['푸른 하늘 아래', '넓은 바다 위로', '초록빛 들판에'], correctAnswer: '푸른 하늘 아래' },
        { text: '빠르게 달리는 기차', question: '두 번째로 나타난 덩어리는 무엇이었나요?', options: ['느리게 걷는 거북이', '빠르게 달리는 기차', '높이 나는 비행기'], correctAnswer: '빠르게 달리는 기차' },
        { text: '조용히 내리는 밤비', question: '세 번째로 나타난 덩어리는 무엇이었나요?', options: ['시끄럽게 우는 매미', '따뜻한 햇살 아래', '조용히 내리는 밤비'], correctAnswer: '조용히 내리는 밤비' },
      ],
      tip: '단어 하나하나에 집중하기보다 전체 덩어리를 하나의 이미지처럼 받아들이세요. 주변 시야까지 활용하여 넓게 보는 연습이 중요합니다.',
    },
    {
      type: 'target_scanning',
      title: '숨은 정보 스캔! 핵심어 찾기',
      description: '짧은 문장들 속에서 특정 단어나 숫자를 최대한 빠르게 찾아보세요. 필요한 정보만 쏙쏙 골라 읽는 능력을 키웁니다.',
      content: '여기에 스캐닝을 위한 샘플 텍스트가 들어갑니다. 이 텍스트는 여러 줄로 구성될 수 있으며, 사용자는 이 안에서 특정 정보를 찾아야 합니다. 예를 들어, 회의 시간은 오후 3시이고, 참석자는 총 5명입니다.', // Sample content
      question: '위 글에서 회의 시작 시간은 언제인가요?',
      options: ['오후 2시', '오후 3시', '오후 4시'],
      correctAnswer: '오후 3시',
      tip: '질문에서 키워드를 먼저 파악하고, 그 단어를 중심으로 글을 빠르게 훑어보세요. 숫자나 고유명사처럼 눈에 띄는 정보를 먼저 찾는 것도 방법입니다.',
    }
  ];
  */

  // Timer logic
  useEffect(() => {
    if (isLoading || timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleFinishWarmup();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [isLoading, timeLeft]);

  // Loading simulation
  useEffect(() => {
    const loadingTimer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(loadingTimer);
  }, []);

  // Flush queued warmup events once on mount (best-effort)
  useEffect(() => {
    warmupEventsService.flushQueue().catch(() => {});
  }, []);

  // NEW: useEffect to select and set the active exercise variation
  useEffect(() => {
    console.log(`[MainEffect DEBUG] CurrentExerciseIndex: ${currentExerciseIndex}`);
    if (EXERCISE_CONFIGURATIONS.length === 0) {
      console.log('[MainEffect DEBUG] No exercise configurations found.');
      return;
    }

    setUserInteracted(false); // Reset interaction status for the new exercise/variation

    const currentConfig = EXERCISE_CONFIGURATIONS[currentExerciseIndex];
    if (!currentConfig || currentConfig.variations.length === 0) {
      setError('현재 운동에 대한 설정을 찾을 수 없습니다.');
      setActiveExerciseDetail(null);
      console.log('[MainEffect DEBUG] Error: Current config not found or has no variations.');
      return;
    }

    // Randomly select a variation
    const randomVariationIndex = Math.floor(Math.random() * currentConfig.variations.length);
    const selectedVariationParams = currentConfig.variations[randomVariationIndex];

    // Construct the ActiveExercise object
    const detail: ActiveExercise = {
      id: currentConfig.id,
      title: `${currentConfig.title} - ${selectedVariationParams.name}`,
      description: `${currentConfig.generalDescription} ${(selectedVariationParams as any).instructionText || ''}`,
      tip: currentConfig.tip,
      variationParams: selectedVariationParams,
    };
    setActiveExerciseDetail(detail);
    console.log('[MainEffect DEBUG] Set activeExerciseDetail.id:', detail.id, 'VariationName:', selectedVariationParams.name);

    // Reset states specific to ALL exercise types before setting new ones
    // Guided Breathing
    setBreathingPhase('done'); 
    setBreathingCycle(0);    
    
    // Eye Tracking / Saccades
    setDotPosition(null);
    setSaccadeStep(0);
    setSaccadeCycleCount(0);
    setEyeTrackingPhase('idle'); 
    setEyeTrackingCurrentRep(0);
    setEyeTrackingTime(0);
    console.log('[MainEffect DEBUG] eyeTrackingPhase set to idle, dotPosition to null.');

    // Visual Span / Chunking
    // setChunkingPhase('done'); // Old state, visualSpanPhase is primary now
    setVisualSpanRepetitionCount(0);
    setCurrentVisualSpanStimulus(null);
    setGridStimulus([]);
    setVisualSpanPhase('idle'); // Reset main visual span state

    // Text Flow
    setTextFlowContent([]);
    setCurrentHighlightIndex(-1);
    setTextFlowPhase('idle'); // Reset main text flow state
    // setCurrentWordSpeed will be set from variationParams
    setTextFlowStartTime(0);
    
    // Initialize states for the *new* exercise type based on 'detail.id' and 'detail.variationParams'
    if (detail.id === 'guided_breathing') {
      setBreathingPhase('inhale');
      setBreathingCycle(1);
    } else if (detail.id === 'peripheral_vision_expansion') {
      console.log('[MainEffect DEBUG] Confirmed peripheral_vision_expansion selected. eyeTrackingPhase should be idle now.');
      // setSaccadePhase('horizontal'); // This was an old state, ensure it's not interfering or remove if fully unused
    } else if (detail.id === 'visual_span') {
      // Initial state for visual_span is 'idle', logic inside its useEffect will handle 'presenting' etc.
      // setGridStimulus([]); // Already reset above
    } else if (detail.id === 'text_flow') {
      // Initial state for text_flow is 'idle', logic inside its useEffect will handle 'running'
      const params = detail.variationParams as TextFlowVariationParams;
      setCurrentWordSpeed(params.initialSpeed); // Set initial speed from params
    }

  }, [currentExerciseIndex]); // Removed EXERCISE_CONFIGURATIONS from deps, it's constant

  // Reset dynamic exercise states when exercise changes (OLD - to be adapted or merged with above)
  /*
  useEffect(() => {
      // setShowExerciseStimulus(true); 
      setExerciseInternalStep(0);   
      // setCurrentChunkIndex(0);      
      // setShowChunk(false);          
      setShowTip(false);
      
      // Reset breathing state if new exercise is not breathing, or if it's the start of breathing exercise
      // if (exercises[currentExercise]?.type === 'guided_breathing') {
      //   setBreathingPhase('inhale');
      //   setBreathingCycle(1);
      // } else {
      //   setBreathingPhase('done'); // Or some neutral state
      // }

      // if (exercises[currentExercise]?.type === 'eye_saccades') {
      //   setSaccadeStep(0);
      //   setSaccadePhase('horizontal');
      //   setSaccadeCycleCount(0);
      //   // setDotPosition(EYE_SACCADE_LOCATIONS[0]); // Start at the first defined horizontal loc
      // } else {
      //   setDotPosition(null); 
      //   setSaccadePhase('done');
      // }
      
  // }, [currentExercise, exercises]); // Added exercises to dependency array for safety, though type access is main key
  */

  // Effect for Guided Breathing Logic
  useEffect(() => {
    if (!activeExerciseDetail || activeExerciseDetail.id !== 'guided_breathing' || breathingPhase === 'done') {
      return;
    }
    const params = activeExerciseDetail.variationParams as BreathingVariationParams;
    if (!params.durations) return;


    let timerId: NodeJS.Timeout;

    if (breathingPhase === 'inhale') {
      timerId = setTimeout(() => setBreathingPhase(params.durations.hold1 ? 'hold1' : 'exhale'), params.durations.inhale);
    } else if (breathingPhase === 'hold1' && params.durations.hold1) {
      timerId = setTimeout(() => setBreathingPhase('exhale'), params.durations.hold1);
    } else if (breathingPhase === 'exhale') {
      timerId = setTimeout(() => {
        if (params.durations.hold2) {
          setBreathingPhase('hold2');
        } else {
          if (breathingCycle < params.totalCycles) {
            setBreathingCycle(prev => prev + 1);
            setBreathingPhase('inhale');
          } else {
            setBreathingPhase('done');
            setUserInteracted(true); // Mark as completed for next button
          }
        }
      }, params.durations.exhale);
    } else if (breathingPhase === 'hold2' && params.durations.hold2) {
       timerId = setTimeout(() => {
            if (breathingCycle < params.totalCycles) {
                setBreathingCycle(prev => prev + 1);
                setBreathingPhase('inhale');
            } else {
                setBreathingPhase('done');
                setUserInteracted(true); // Mark as completed
            }
        }, params.durations.hold2);
    }


    return () => clearTimeout(timerId);
  }, [activeExerciseDetail, breathingPhase, breathingCycle]);

  // OLD Effect for Eye Tracking Challenge (To be REMOVED/REPLACED)
  /*
  useEffect(() => {
    // ...entire old eye tracking logic for dot movement (circular, jumps) is now commented out or will be deleted...
    // This was the section with console.log('[EyeTracking DEBUG]...')
  }, [activeExerciseDetail, eyeTrackingPhase, eyeTrackingCurrentRep, eyeTrackingTime, saccadeStep]);
  */

  // NEW Effect for Peripheral Vision Expansion
  useEffect(() => {
    if (!activeExerciseDetail || activeExerciseDetail.id !== 'peripheral_vision_expansion' || eyeTrackingPhase === 'done') {
      setPeripheralStimulus(null);
      setShowCentralFixation(true); // Keep fixation if exercise not active or done
      return;
    }

    const params = activeExerciseDetail.variationParams as EyeTrackingVariationParams;
    if (!params.locations || params.locations.length === 0) return;

    let stimulusTimer: NodeJS.Timeout;
    let intervalTimer: NodeJS.Timeout;

    if (eyeTrackingPhase === 'idle') {
      setEyeTrackingPhase('running');
      setPeripheralRepetitionCount(0);
      setShowCentralFixation(true); // Ensure fixation is visible
      setDotPosition({ top: '50%', left: '50%' }); // Central fixation dot
      setPeripheralStartTime(Date.now());
      return;
    }

    if (eyeTrackingPhase === 'running') {
      // Hard limit ~16s for stimulus run within 20s cap
      if (peripheralStartTime && Date.now() - peripheralStartTime >= 16000) {
        setEyeTrackingPhase('done');
        setUserInteracted(true);
        setPeripheralStimulus(null);
        setShowCentralFixation(true);
        return;
      }
      if (peripheralRepetitionCount >= (params.repetitions || 10)) {
        setEyeTrackingPhase('done');
        setUserInteracted(true);
        setPeripheralStimulus(null);
        setShowCentralFixation(true); // Show fixation at the end screen if needed
        return;
      }

      // Show stimulus
      const randomLocationIndex = Math.floor(Math.random() * params.locations.length);
      const newStimulus = {
        location: params.locations[randomLocationIndex],
        shape: 'circle' as 'circle' | 'square',
        color: fixationHighContrast ? 'bg-white' : (cyberTheme.secondary.replace('text-', 'bg-') || 'bg-purple-400'),
        visible: true,
        id: Date.now(),
      };
      setPeripheralStimulus(newStimulus);
      setStimulusCount(c => c + 1);
      // Record stimulus_presented raw event
      try {
        const presentMs = prefersReducedMotion ? Math.min(400, (params.presentationTime || 300)) : (params.presentationTime || 300);
        const isiMs = prefersReducedMotion ? Math.max(700, (params.interStimulusInterval || 500)) : (params.interStimulusInterval || 500);
        pushEvent('peripheral_vision_expansion', 'stimulus_presented', {
          topPct: parseFloat(newStimulus.location.top),
          leftPct: parseFloat(newStimulus.location.left),
          presentMs,
          isiMs,
          quadrant: (() => {
            const leftVal = parseFloat(newStimulus.location.left);
            const side: 'left' | 'right' = isNaN(leftVal) ? 'left' : (leftVal <= 50 ? 'left' : 'right');
            const topVal = parseFloat(newStimulus.location.top);
            return (topVal <= 50 ? (side === 'left' ? 'Q2' : 'Q1') : (side === 'left' ? 'Q3' : 'Q4'));
          })(),
        });
      } catch {}
      // Record target side and first probe timestamp
      try {
        const leftStr = newStimulus.location.left;
        const leftVal = typeof leftStr === 'string' ? parseFloat(leftStr) : 50;
        const side: 'left' | 'right' = isNaN(leftVal) ? 'left' : (leftVal <= 50 ? 'left' : 'right');
        setLastPeripheralTarget(side);
        // Quadrant from top/left
        const topVal = parseFloat(newStimulus.location.top);
        const q = (topVal <= 50 ? (side === 'left' ? 'Q2' : 'Q1') : (side === 'left' ? 'Q3' : 'Q4')) as keyof typeof quadrantCounts;
        setQuadrantCounts(prev => ({ ...prev, [q]: prev[q] + 1 }));
      } catch {}
      if (probeShownAt === null) {
        setProbeShownAt(Date.now());
      }
      setShowCentralFixation(true); // Central fixation always on during stimulus

      const presentMs = prefersReducedMotion ? Math.min(400, (params.presentationTime || 300)) : (params.presentationTime || 300);
      const isiMs = prefersReducedMotion ? Math.max(700, (params.interStimulusInterval || 500)) : (params.interStimulusInterval || 500);
      stimulusTimer = setTimeout(() => {
        setPeripheralStimulus(prev => prev ? { ...prev, visible: false } : null);
        setPresentDurations(prev => [...prev, presentMs]);
        // Interval before next stimulus
        intervalTimer = setTimeout(() => {
          setIsiDurations(prev => [...prev, isiMs]);
          setPeripheralRepetitionCount(prev => prev + 1);
          // Loop back by virtue of state change and this effect re-running
        }, isiMs);
      }, presentMs);
    }

    return () => {
      clearTimeout(stimulusTimer);
      clearTimeout(intervalTimer);
    };
  }, [activeExerciseDetail, eyeTrackingPhase, peripheralRepetitionCount, probeShownAt]);

  // Effect for Visual Span Grid / Word Pairs
  useEffect(() => {
    if (!activeExerciseDetail || activeExerciseDetail.id !== 'visual_span' || visualSpanPhase === 'done') {
      return;
    }

    const params = activeExerciseDetail.variationParams as VisualSpanVariationParams;
    let timerId: NodeJS.Timeout;

    const getRandomLetters = (count: number): string[] => {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Using English alphabet for simplicity
      // Or Korean: ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ
      let letters: string[] = [];
      for (let i = 0; i < count; i++) {
        letters.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
      }
      return letters;
    };

    const generateGridStimulus = () => {
      if (!params.gridSize || !params.stimuliCount) return;
      const totalCells = params.gridSize.rows * params.gridSize.cols;
      let newGrid: GridCell[] = Array(totalCells).fill(null).map((_, i) => ({ letter: null, id: i }));
      
      const lettersToShow = getRandomLetters(params.stimuliCount);
      let availableIndices = Array.from(Array(totalCells).keys());
      
      for (let i = 0; i < params.stimuliCount; i++) {
        if (availableIndices.length === 0) break;
        const randIdx = Math.floor(Math.random() * availableIndices.length);
        const cellIdxToFill = availableIndices.splice(randIdx, 1)[0];
        if (newGrid[cellIdxToFill]) {
            newGrid[cellIdxToFill].letter = lettersToShow[i];
        }
      }
      setGridStimulus(newGrid);
      setCurrentVisualSpanStimulus(null); // Not used for grid like this, words use it differently
    };
    
    const generateWordPairStimulus = () => {
        if (!params.wordLength || params.stimuliCount !== 2) return;
        // Simplified: using random letters to form "words"
        const word1 = getRandomLetters(params.wordLength).join('');
        const word2 = getRandomLetters(params.wordLength).join('');
        setCurrentVisualSpanStimulus([word1, word2]);
        setGridStimulus([]); // Not used for word pairs
    };

    if (visualSpanPhase === 'idle') {
      setVisualSpanRepetitionCount(0);
      if (params.stimulusType === 'letters' && params.gridSize) {
        generateGridStimulus();
      } else if (params.stimulusType === 'words') {
        generateWordPairStimulus();
      }
      setVisualSpanPhase('presenting');
    } else if (visualSpanPhase === 'presenting') {
      timerId = setTimeout(() => {
        setVisualSpanPhase('interval');
      }, params.presentationTime);
    } else if (visualSpanPhase === 'interval') {
      // Hide stimulus during interval by clearing them or setting a flag
      if (params.stimulusType === 'letters') setGridStimulus(prev => prev.map(cell => ({...cell, letter: null }))); 
      else setCurrentVisualSpanStimulus(null);

      timerId = setTimeout(() => {
        if (visualSpanRepetitionCount + 1 < params.repetitions) {
          setVisualSpanRepetitionCount(prev => prev + 1);
          if (params.stimulusType === 'letters' && params.gridSize) {
            generateGridStimulus();
          } else if (params.stimulusType === 'words') {
            generateWordPairStimulus();
          }
          setVisualSpanPhase('presenting');
        } else {
          setVisualSpanPhase('done');
          setUserInteracted(true);
        }
      }, params.interStimulusInterval);
    }

    return () => clearTimeout(timerId);
  }, [activeExerciseDetail, visualSpanPhase, visualSpanRepetitionCount]);

  // Effect for Text Flow (Highlight and Word Group Flashing)
  useEffect(() => {
    if (!activeExerciseDetail || activeExerciseDetail.id !== 'text_flow' || textFlowPhase === 'done') {
      return;
    }

    const params = activeExerciseDetail.variationParams as TextFlowVariationParams;
    let timerId: NodeJS.Timeout | undefined = undefined;

    const prepareWordGroups = () => {
      const groups: string[] = [];
      const numGroups = params.totalGroups || 15;
      const wordsPer = params.wordsPerGroup || 3;
      for (let i = 0; i < numGroups; i++) {
        const randomGroupSource = WORD_GROUPS_BANK[Math.floor(Math.random() * WORD_GROUPS_BANK.length)];
        groups.push(randomGroupSource.slice(0, wordsPer).join(' '));
      }
      setWordGroupBank(groups);
      setCurrentGroupIndex(0);
      setCurrentWordGroup(groups[0] || '');
    };
    
    const prepareHighlightContent = () => {
      const story = SIMPLE_STORIES[Math.floor(Math.random() * SIMPLE_STORIES.length)];
      setTextFlowContent(story.split(/\s+/)); 
      setCurrentHighlightIndex(-1);
      setCurrentWordSpeed(params.initialSpeed);
      const now = Date.now();
      setTextFlowStartTime(now);
      setLastHighlightTs(now);
      setHighlightIntervals([]);
    };


    if (textFlowPhase === 'idle') {
      if (params.flowType === 'flash') {
        prepareWordGroups();
      } else if (params.flowType === 'highlight') {
        prepareHighlightContent();
      }
      setTextFlowPhase('running');
      return; // Allow state to update before proceeding
    }

    if (textFlowPhase === 'running') {
      // Enforce total duration cutoff for highlight mode
      if (
        (params.flowType === 'highlight') &&
        params.totalDuration &&
        textFlowStartTime &&
        Date.now() - textFlowStartTime >= params.totalDuration * 1000
      ) {
        setTextFlowPhase('done');
        setUserInteracted(true);
        return;
      }
      if (params.flowType === 'flash') {
        if (currentGroupIndex >= (params.totalGroups || 15) -1) { // Check if it's the last group already shown
            // After last group is shown for its presentationTime, then mark done
            timerId = setTimeout(() => {
                setTextFlowPhase('done');
                setUserInteracted(true);
                setCurrentWordGroup('');
            }, params.presentationTime || 400);
        } else {
            // Show current group
            setCurrentWordGroup(wordGroupBank[currentGroupIndex] || '');
            timerId = setTimeout(() => {
                // After presentation time, "hide" by clearing or prepare for next one
                setCurrentWordGroup(''); // Visually hide
                // Then, after interStimulusInterval, show next group
                setTimeout(() => {
                    setCurrentGroupIndex(prev => prev + 1);
                    // The next word group will be set at the start of the next 'running' phase iteration
                }, params.interStimulusInterval || 600);
            }, params.presentationTime || 400);
        }

      } else if (params.flowType === 'highlight') {
        if (textFlowContent.length === 0 && params.contentType === 'simpleStory') {
            prepareHighlightContent(); 
            return; 
        }
        if (currentHighlightIndex < textFlowContent.length - 1) {
          timerId = setTimeout(() => {
            const now = Date.now();
            if (lastHighlightTs) {
              setHighlightIntervals(prev => [...prev, now - lastHighlightTs]);
            }
            setLastHighlightTs(now);
            setCurrentHighlightIndex(prev => prev + 1);
            if (params.acceleration) {
              setCurrentWordSpeed(prevSpeed => Math.max(100, prevSpeed * params.acceleration!));
            }
          }, currentWordSpeed);
        } else {
          setTextFlowPhase('done');
          setUserInteracted(true);
        }
      } 
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [activeExerciseDetail, textFlowPhase, currentHighlightIndex, textFlowContent, currentWordSpeed, textFlowStartTime, currentGroupIndex, wordGroupBank]);

  // Effect for Chunking Practice Logic (OLD - to be adapted for Visual Span)
  /*
  useEffect(() => {
    // This logic will be entirely replaced by Visual Span logic
    // For now, let's assume it completes and enables interaction if it were active.
    if (activeExerciseDetail && activeExerciseDetail.id === 'visual_span' && chunkingPhase !== 'done') {
      // Placeholder: Simulate completion for now
      // setChunkingPhase('done');
      // setUserInteracted(true);
    }
  }, [activeExerciseDetail, chunkingPhase]);
  */

  const handleAnswerSelect = (answer: string | string[], isCorrect?: boolean) => {
    // This function will be simplified or repurposed.
    // For now, it just marks that the user has interacted.
    setUserInteracted(true);
    setShowTip(false); // Hide tip when an answer is selected
    if (isCorrect !== undefined) {
      console.log(`Exercise ${currentExerciseIndex + 1} - Selected: "${answer}", Correct: ${isCorrect}`);
    }
  };

  const handleNext = () => {
    setShowTip(false); // Hide tip when moving to next exercise
    if (currentExerciseIndex < EXERCISE_CONFIGURATIONS.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      handleFinishWarmup();
    }
  };

  const handleFinishWarmup = useCallback(async () => {
    if (!sessionId) return;
    try {
      // Activate the session (warmup -> active)
      await api.put(`/sessions/${sessionId}/activate`);
      // Build and send raw warmup events first (fire-and-forget)
      try {
        const device = {
          width: typeof window !== 'undefined' ? window.innerWidth : 0,
          height: typeof window !== 'undefined' ? window.innerHeight : 0,
          dpr: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
          reducedMotion: typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
        };
        // Push any summary events we still want as raw atoms
        if (relaxationBefore !== null) pushEvent('guided_breathing', 'relaxation_before', { value: relaxationBefore });
        if (relaxationAfter !== null) pushEvent('guided_breathing', 'relaxation_after', { value: relaxationAfter });
        if (highlightIntervals.length > 0) {
          // Emit each highlight interval as events
          highlightIntervals.forEach((intervalMs, idx) => {
            pushEvent('text_flow', 'highlight_tick', { wordIndex: idx, intervalMs });
          });
        }
        // Compose payload and send
        const eventsPayload: WarmupEventClientPayload = {
          sessionId,
          warmupVersion: 'v1',
          device,
          events: eventsRef.current.splice(0),
        };
        warmupEventsService.sendEvents(eventsPayload).catch(() => {});
      } catch (e) {
        // Ignore metrics errors; do not block navigation
      }
    } catch (error) {
      console.error('세션 활성화 오류', error);
      alert('세션을 활성화하는 중 오류가 발생했습니다.');
      return;
    }
    // Navigate to reading stage
    router.push(`/ts/reading?sessionId=${sessionId}`);
  }, [sessionId, router]);

  const handleToggleTip = () => {
    setShowTip(prev => !prev);
  };

  const handleQuitWarmup = () => {
    // Consider adding a confirmation modal here
    router.push('/dashboard'); // Or a more appropriate exit point
  };

  const exercise = activeExerciseDetail; // Use the new state

  // Loading State UI
  if (isLoading || !exercise) { // Check activeExerciseDetail
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${cyberTheme.gradient} p-4`}>
        <Spinner size="lg" color="cyan" />
        <p className={`mt-4 ${cyberTheme.textMuted}`}>인지 시스템 활성화 준비 중...</p>
      </div>
    );
  }

  // Error State UI
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${cyberTheme.gradient} p-4`}>
        <div className={`${cyberTheme.cardBg} rounded-xl shadow-lg p-5 max-w-md w-full border ${cyberTheme.errorBorder}`}>
          <h1 className={`text-xl font-bold ${cyberTheme.errorText} mb-3 flex items-center`}>
            <XCircleIcon className="h-6 w-6 mr-2" /> 오류 발생
          </h1>
          <p className={`mb-4 text-sm ${cyberTheme.textMuted}`}>{error || '훈련 데이터를 불러오는 데 실패했습니다.'}</p>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="secondary"
            className={`w-full ${cyberTheme.buttonSecondaryBg} ${cyberTheme.buttonSecondaryHoverBg}`}
          >
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // Main Exercise UI
  return (
    <div className={`min-h-screen flex flex-col ${cyberTheme.gradient} text-gray-100`}>
      {/* Header */}
      <header className={`p-3 sm:p-4 ${cyberTheme.bgSecondary} shadow-md flex justify-between items-center`}>
        <h1 className={`text-lg sm:text-xl font-bold ${cyberTheme.primary}`}>준비 운동 ({currentExerciseIndex + 1}/{EXERCISE_CONFIGURATIONS.length})</h1>
        <div className="flex items-center">
          <ClockIcon className={`h-5 w-5 mr-2 ${cyberTheme.secondary}`} />
          <span className={`text-base sm:text-lg font-mono ${cyberTheme.textLight}`}>{formatTime(timeLeft)}</span>
          {/* High-contrast toggle (peripheral) */}
          <button
            aria-label="고대비 고정점 토글"
            className={`ml-3 text-xs px-2 py-1 rounded border ${cyberTheme.inputBorder} ${cyberTheme.buttonSecondaryHoverBg}`}
            onClick={() => setFixationHighContrast(v => !v)}
          >
            HC {fixationHighContrast ? 'ON' : 'OFF'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className={`${cyberTheme.cardBg} rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-md sm:max-w-lg md:max-w-xl border ${cyberTheme.borderPrimary}`}>
          
          {/* Progress Bar */}
          <div className={`w-full ${cyberTheme.progressBarBg} rounded-full h-2 sm:h-2.5 mb-4 sm:mb-6`}>
            <div 
              className={`${cyberTheme.progressFg} h-2 sm:h-2.5 rounded-full transition-all duration-300 ease-out`}
              style={{ width: `${((currentExerciseIndex + 1) / EXERCISE_CONFIGURATIONS.length) * 100}%` }}
            ></div>
          </div>

          <h2 className={`text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 ${cyberTheme.secondary}`}>{exercise.title}</h2>
          <p className={`${cyberTheme.textLight} mb-4 sm:mb-5 text-xs sm:text-sm leading-relaxed`}>{exercise.description}</p>

          {/* Exercise Content */}
          <div className={`${cyberTheme.inputBg} p-4 rounded-lg mb-5 sm:mb-6 border ${cyberTheme.inputBorder} min-h-[150px] sm:min-h-[120px] flex items-center justify-center`}>
            {/* Conditional rendering for dynamic content will be added here based on exercise.type */}
            {exercise.id === 'guided_breathing' && (exercise.variationParams as BreathingVariationParams).durations && (
              <div className="text-center w-full">
                <p className={`mb-2 text-sm ${cyberTheme.textMuted}`}>
                  호흡 주기: {breathingCycle} / {(exercise.variationParams as BreathingVariationParams).totalCycles}
                </p>
                {/* Relaxation slider BEFORE */}
                {breathingCycle === 1 && relaxationBefore === null && (
                  <div className="mb-2">
                    <label className={`block text-xs mb-1 ${cyberTheme.textMuted}`}>현재 긴장도(0-10)</label>
                    <input type="range" min={0} max={10} defaultValue={5} onChange={(e)=> { const v = parseInt(e.target.value); if (relaxationBefore === null) { pushEvent('guided_breathing','relaxation_before',{ value: v }); } setRelaxationBefore(v); }} className="w-full"/>
                  </div>
                )}
                
                {(exercise.variationParams as BreathingVariationParams).name === '박스 호흡' ? (
                  // Box Breathing UI
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-4 border-2 border-gray-600">
                    {/* Top Side */}
                    <div className={`absolute top-0 left-0 w-full h-2 sm:h-2.5 transition-colors duration-200 ${(breathingPhase === 'inhale') ? cyberTheme.primary : 'bg-gray-600'}`} />
                    {/* Right Side */}
                    <div className={`absolute top-0 right-0 w-2.5 h-full transition-colors duration-200 ${(breathingPhase === 'hold1') ? cyberTheme.primary : 'bg-gray-600'}`} />
                    {/* Bottom Side */}
                    <div className={`absolute bottom-0 left-0 w-full h-2 sm:h-2.5 transition-colors duration-200 ${(breathingPhase === 'exhale') ? cyberTheme.primary : 'bg-gray-600'}`} />
                    {/* Left Side */}
                    <div className={`absolute top-0 left-0 w-2.5 h-full transition-colors duration-200 ${(breathingPhase === 'hold2') ? cyberTheme.primary : 'bg-gray-600'}`} />
                    
                    <div className="absolute inset-0 flex items-center justify-center text-center px-1 break-words">
                        {breathingPhase === 'inhale' && <p className={`${cyberTheme.textLight} text-xs sm:text-base`}>들이쉬세요</p>}
                        {breathingPhase === 'hold1' && <p className={`${cyberTheme.textLight} text-xs sm:text-base`}>멈추세요</p>}
                        {breathingPhase === 'exhale' && <p className={`${cyberTheme.textLight} text-xs sm:text-base`}>내쉬세요</p>}
                        {breathingPhase === 'hold2' && <p className={`${cyberTheme.textLight} text-xs sm:text-base`}>멈추세요</p>}
                        {breathingPhase === 'done' && <CheckCircleIcon className={`w-12 h-12 sm:w-16 sm:h-16 ${cyberTheme.primary}`} />}
                    </div>
                  </div>
                ) : (
                  // Default Circle Breathing UI
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-4">
                    {/* 물방울 내부 (물리적 효과를 위한 그라데이션) */}
                    <div 
                      className={`absolute inset-0 rounded-full bg-gradient-to-b from-cyan-300 to-cyan-500 opacity-30 transition-all`}
                      style={{ 
                        transform: breathingPhase === 'inhale' || breathingPhase === 'hold1' ? 'scale(1)' : 'scale(0.5)',
                        transitionDuration: `${breathingPhase === 'inhale' ? (activeExerciseDetail.variationParams as BreathingVariationParams).durations.inhale : breathingPhase === 'exhale' ? (activeExerciseDetail.variationParams as BreathingVariationParams).durations.exhale : 1000}ms`,
                        transitionTimingFunction: breathingPhase === 'inhale' ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : 'cubic-bezier(0.47, 0, 0.745, 0.715)'
                      }}
                    />
                    {/* 물방울 테두리 (빛 반사 효과) */}
                    <div 
                      className={`absolute inset-0 rounded-full border-2 ${cyberTheme.borderPrimary} flex items-center justify-center transition-all overflow-hidden`}
                      style={{
                         transform: breathingPhase === 'inhale' || breathingPhase === 'hold1' ? 'scale(1)' : 'scale(0.5)',
                         transitionDuration: `${breathingPhase === 'inhale' ? (activeExerciseDetail.variationParams as BreathingVariationParams).durations.inhale : breathingPhase === 'exhale' ? (activeExerciseDetail.variationParams as BreathingVariationParams).durations.exhale : 1000}ms`,
                         transitionTimingFunction: breathingPhase === 'inhale' ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : 'cubic-bezier(0.47, 0, 0.745, 0.715)'
                      }}
                    >
                      {/* 물방울 내부 빛 반사 효과 */}
                      <div 
                        className="absolute w-full h-1/3 top-0 left-0 bg-gradient-to-b from-white to-transparent opacity-30"
                        style={{
                          borderRadius: '50% 50% 100% 100% / 60% 60% 100% 100%',
                        }}
                      />
                    </div>
                     <div className="absolute inset-0 flex items-center justify-center text-center text-xs sm:text-base px-1 leading-tight break-words">
                          {breathingPhase === 'inhale' && <p className={`${cyberTheme.textLight} text-xs sm:text-base`}>물방울이<br className="sm:hidden" /> 형성되고<br />(들이쉬기)</p>}
                          {breathingPhase === 'hold1' && <p className={`${cyberTheme.textLight} text-xs sm:text-base`}>떨어지고<br />(멈추기)</p>}
                          {breathingPhase === 'exhale' && <p className={`${cyberTheme.textLight} text-xs sm:text-base`}>퍼져나가는<br />(내쉬기)</p>}
                          {breathingPhase === 'hold2' && <p className={`${cyberTheme.textLight} text-xs sm:text-base`}>멈추세요</p>}
                          {breathingPhase === 'done' && <CheckCircleIcon className={`w-12 h-12 sm:w-16 sm:h-16 ${cyberTheme.primary}`} />}
                      </div>
                  </div>
                )}

                <p className={`text-sm sm:text-lg ${cyberTheme.textLight}`}>
                  {breathingPhase === 'inhale' && `물방울이 떨어지는 순간처럼, 호흡에 집중하세요 (${(exercise.variationParams as BreathingVariationParams).durations.inhale / 1000}초)`}
                  {breathingPhase === 'hold1' && (exercise.variationParams as BreathingVariationParams).durations.hold1 && `물방울이 떨어지는 순간을 느껴보세요 (${(exercise.variationParams as BreathingVariationParams).durations.hold1! / 1000}초)`}
                  {breathingPhase === 'exhale' && `물방울이 퍼져나가는 리듬을 느껴보세요 (${(exercise.variationParams as BreathingVariationParams).durations.exhale / 1000}초)`}
                  {breathingPhase === 'hold2' && (exercise.variationParams as BreathingVariationParams).durations.hold2 && `잠시 멈추세요 (${(exercise.variationParams as BreathingVariationParams).durations.hold2! / 1000}초)`}
                  {breathingPhase === 'done' && '물방울이 완성되었습니다!'}
                </p>
                {/* Relaxation slider AFTER */}
                {breathingPhase === 'done' && relaxationAfter === null && (
                  <div className="mt-2">
                    <label className={`block text-xs mb-1 ${cyberTheme.textMuted}`}>지금 긴장도(0-10)</label>
                    <input type="range" min={0} max={10} defaultValue={3} onChange={(e)=> { const v = parseInt(e.target.value); if (relaxationAfter === null) { pushEvent('guided_breathing','relaxation_after',{ value: v }); } setRelaxationAfter(v); }} className="w-full"/>
                  </div>
                )}
              </div>
            )}
            {exercise.id === 'peripheral_vision_expansion' && (
              <div className="text-center relative w-full h-32 sm:h-40 flex items-center justify-center border border-gray-700"
                   onClick={() => {
                     if (eyeTrackingPhase === 'running' && probeShownAt && probeRtMs === null) {
                       const rt = Date.now() - probeShownAt;
                       setProbeRtMs(rt);
                       pushEvent('peripheral_vision_expansion', 'probe_tap', { rtMs: rt });
                     }
                   }}>
                {showCentralFixation && dotPosition && ( // dotPosition is now central fixation
                  <div
                    className={`absolute w-2 h-2 sm:w-3 sm:h-3 ${fixationHighContrast ? 'bg-white' : 'bg-red-500'} rounded-full`} // Central dot style
                    style={{
                      top: dotPosition.top,
                      left: dotPosition.left,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}
                {peripheralStimulus && peripheralStimulus.visible && (
                  <>
                    {/* 주 자극 */}
                    <div
                      key={peripheralStimulus.id}
                       className={`absolute w-6 h-6 sm:w-8 sm:h-8 rounded-md transition-transform duration-200 ease-out ${peripheralStimulus.color} ${peripheralStimulus.shape === 'square' ? '' : 'rounded-full'}`}
                      style={{
                        top: peripheralStimulus.location.top,
                        left: peripheralStimulus.location.left,
                        transform: 'translate(-50%, -50%)',
                        opacity: 1,
                        boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
                      }}
                    />
                    {/* 파도 효과 - 첫 번째 파동 */}
                    <div
                       className="absolute rounded-full bg-purple-400 opacity-0 animate-ripple will-change-transform will-change-opacity"
                      style={{
                        top: peripheralStimulus.location.top,
                        left: peripheralStimulus.location.left,
                        transform: 'translate(-50%, -50%)',
                        width: '8px',
                        height: '8px',
                        animation: 'ripple 1s ease-out'
                      }}
                    />
                  </>
                )}
                {eyeTrackingPhase === 'running' && probeRtMs === null && (
                  <p className={`${cyberTheme.textMuted} absolute bottom-1 text-xs`}>자극이 보일 때 화면을 한 번 탭하세요</p>
                )}
                {eyeTrackingPhase === 'done' && (
                  <CheckCircleIcon className={`w-12 h-12 sm:w-16 sm:h-16 ${cyberTheme.primary}`} />
                )}
                {eyeTrackingPhase === 'idle' && <p className={`${cyberTheme.textMuted}`}>고정점 응시 준비 중...</p>}
              </div>
            )}
            {/* Peripheral final 2AFC */}
            {exercise.id === 'peripheral_vision_expansion' && eyeTrackingPhase === 'done' && lastAfcChoice === null && (
              <div className="mt-2 flex justify-center gap-3">
                <Button onClick={() => { setLastAfcChoice('left'); const correct = (lastPeripheralTarget === 'left'); setLastAfcCorrect(correct); pushEvent('peripheral_vision_expansion', 'afc_answer', { choice: 'left', target: lastPeripheralTarget, correct }); }} className="px-3 py-1">좌</Button>
                <Button onClick={() => { setLastAfcChoice('right'); const correct = (lastPeripheralTarget === 'right'); setLastAfcCorrect(correct); pushEvent('peripheral_vision_expansion', 'afc_answer', { choice: 'right', target: lastPeripheralTarget, correct }); }} className="px-3 py-1">우</Button>
              </div>
            )}
            {exercise.id === 'peripheral_vision_expansion' && eyeTrackingPhase === 'done' && lastAfcChoice !== null && (
              <p className={`mt-2 text-center text-sm ${cyberTheme.textLight}`}>선택: {lastAfcChoice === 'left' ? '좌' : '우'} · 정답: {lastAfcCorrect ? '정답' : '오답'}</p>
            )}
            {exercise.id === 'visual_span' && (
              <div className="text-center w-full relative min-h-[100px]">
                { (visualSpanPhase === 'idle' || visualSpanPhase === 'interval') && 
                  <p className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-3xl ${cyberTheme.secondary}`}>+</p>
                }
                {(exercise.variationParams as VisualSpanVariationParams).stimulusType === 'letters' && 
                 (exercise.variationParams as VisualSpanVariationParams).gridSize && 
                 visualSpanPhase === 'presenting' && gridStimulus.length > 0 && (
                  <div 
                    className="grid gap-1 sm:gap-2 mx-auto"
                    style={{
                      gridTemplateColumns: `repeat(${(exercise.variationParams as VisualSpanVariationParams).gridSize!.cols}, minmax(0, 1fr))`,
                      width: `${(exercise.variationParams as VisualSpanVariationParams).gridSize!.cols * 2.5}rem`, // Adjusted for mobile
                    }}
                  >
                    {gridStimulus.map((cell) => (
                      <div 
                        key={cell.id} 
                        className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border rounded ${cyberTheme.inputBorder} ${cyberTheme.textLight} text-base sm:text-xl`}
                      >
                        {cell.letter}
                      </div>
                    ))}
                  </div>
                )}
                {(exercise.variationParams as VisualSpanVariationParams).stimulusType === 'words' &&
                  visualSpanPhase === 'presenting' && currentVisualSpanStimulus && Array.isArray(currentVisualSpanStimulus) && (
                  <div className="flex justify-around items-center w-full px-2 sm:px-4">
                    <span className={`text-lg sm:text-2xl font-semibold ${cyberTheme.textLight}`}>{currentVisualSpanStimulus[0]}</span>
                    <span className={`text-lg sm:text-2xl font-semibold ${cyberTheme.textLight}`}>{currentVisualSpanStimulus[1]}</span>
                  </div>
                )}
                {visualSpanPhase === 'interval' && visualSpanRepetitionCount < (exercise.variationParams as VisualSpanVariationParams).repetitions -1 && (
                    <p className={`${cyberTheme.textMuted}`}>다음 자극 준비 중...</p>
                )}
                {visualSpanPhase === 'done' && (
                  <CheckCircleIcon className={`w-16 h-16 ${cyberTheme.primary}`} />
                )}
                {visualSpanPhase === 'idle' && <p className={`${cyberTheme.textMuted}`}>시야 확장 준비 중...</p>}
              </div>
            )}
            {exercise.id === 'text_flow' && (
                 <div className="text-center w-full overflow-hidden relative flex items-center justify-center" style={{ height: '150px' }}>
                      { (exercise.variationParams as TextFlowVariationParams).flowType === 'highlight' && textFlowPhase === 'running' && textFlowContent.length > 0 && (
                          <p className={`text-xl ${cyberTheme.textLight} p-4`}>
                              {textFlowContent.map((word, index) => {
                                  // 현재 강조 단어와 그 주변 단어들에 대한 스타일 계산
                                  let highlightClass = '';
                                  let transformStyle = {};
                                  
                                  if (index === currentHighlightIndex) {
                                      // 현재 강조 단어
                                      highlightClass = `${cyberTheme.primary} font-bold`;
                                      transformStyle = { 
                                          transform: 'translateY(-2px) scale(1.05)',
                                          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                      };
                                  } else if (index === currentHighlightIndex - 1 || index === currentHighlightIndex + 1) {
                                      // 인접 단어들 - 약간의 강조
                                      highlightClass = prefersReducedMotion ? '' : 'text-cyan-300';
                                  }
                                  
                                  return (
                                      <span 
                                          key={index} 
                                          className={`inline-block transition-all ${highlightClass}`}
                                          style={transformStyle}
                                      >
                                          {word}{' '}
                                      </span>
                                  );
                              })}
                          </p>
                      )}
                      { (exercise.variationParams as TextFlowVariationParams).flowType === 'flash' && textFlowPhase === 'running' && currentWordGroup && (
                         <div className="relative">
                           {/* 파도 배경 효과 */}
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-wave"></div>
                           <p className={`text-2xl font-semibold ${cyberTheme.textLight} p-4 relative z-10`}
                              style={{
                                animation: 'fadeInOut 0.8s ease-in-out',
                                animationFillMode: 'both'
                              }}
                           >
                              {currentWordGroup.split(' ').map((word, idx) => (
                                <span 
                                  key={idx} 
                                  className="inline-block mx-1"
                                  style={{
                                    animation: `floatIn 0.5s ease-out ${idx * 0.1}s both`
                                  }}
                                >
                                  {word}
                                </span>
                              ))}
                           </p>
                         </div>
                      )}
                      {textFlowPhase === 'done' && (
                          <CheckCircleIcon className={`w-16 h-16 ${cyberTheme.primary} m-auto`} />
                      )}
                      {textFlowPhase === 'idle' && <p className={`${cyberTheme.textMuted}`}>텍스트 흐름 준비 중...</p>}
                  </div>
            )}
            {/* Text comprehension quick check */}
            {exercise.id === 'text_flow' && textFlowPhase === 'done' && comprehensionAnswer === null && (
              <div className="mt-2 flex justify-center gap-3">
                <Button onClick={() => { setComprehensionAnswer(true); pushEvent('text_flow', 'comprehension', { value: true }); }} className="px-3 py-1">이해됨</Button>
                <Button onClick={() => { setComprehensionAnswer(false); pushEvent('text_flow', 'comprehension', { value: false }); }} variant="secondary" className="px-3 py-1">애매함</Button>
              </div>
            )}
            {exercise.id === 'text_flow' && textFlowPhase === 'done' && comprehensionAnswer !== null && (
              <p className={`mt-2 text-center text-sm ${cyberTheme.textLight}`}>이해도 응답: {comprehensionAnswer ? '이해됨' : '애매함'}</p>
            )}

            {/* Fallback for unhandled exercise types (should ideally not happen) */}
            {exercise.id !== 'guided_breathing' && exercise.id !== 'peripheral_vision_expansion' && exercise.id !== 'text_flow' && (
              <p className="text-center text-lg">알 수 없는 예열 운동입니다.</p>
            )}
          </div>
          
          {/* Question/Prompt area - to be simplified or removed for most exercises */}
          {/* For now, let's assume a generic completion button will be used mostly */}
          { (exercise.id === 'guided_breathing' && breathingPhase === 'done') ||
            (exercise.id === 'peripheral_vision_expansion' && eyeTrackingPhase === 'done') || 
            (exercise.id === 'text_flow' && textFlowPhase === 'done') ? 
            (
              <p className={`font-medium mb-3 ${cyberTheme.textLight}`}>준비 끝! 이제 파도를 만날 준비가 되었어요.</p>
            ) : (
              <p className={`font-medium mb-3 ${cyberTheme.textLight}`}>화면의 안내에 따라 훈련을 진행하세요.</p>
            )
          }


          {/* Options / Input - This section will be heavily refactored or removed.
              For now, we rely on userInteracted state set by exercise logic.
          */}
          <div className="space-y-3 mb-6">
            {/* Example of a generic "I'm Done" button if an exercise doesn't auto-advance */}
            {/* This is a placeholder and might not be the final interaction model */}
            { !userInteracted && (exercise.id === 'some_exercise_that_needs_manual_confirm') && (
              <button
                    onClick={() => setUserInteracted(true)}
                className={`w-full text-left p-3 rounded-md transition-colors duration-150
                    ${cyberTheme.buttonSecondaryBg} ${cyberTheme.buttonSecondaryHoverBg} ${cyberTheme.textMuted}
                    border ${cyberTheme.inputBorder} focus:outline-none focus:ring-2 ${cyberTheme.inputFocusRing}`}
                >
                    완료 확인 (임시)
              </button>
            )}
          </div>

          {/* Tip Section */}
          {exercise.tip && (
            <div className="mb-6">
              <button 
                onClick={handleToggleTip}
                className={`flex items-center text-sm ${cyberTheme.textMuted} ${cyberTheme.buttonSecondaryHoverBg} p-2 rounded-md`}
              >
                <LightBulbIcon className={`h-5 w-5 mr-2 ${showTip ? cyberTheme.tipIcon : cyberTheme.textMuted}`} />
                {showTip ? '도움말 숨기기' : '도움말 보기'}
              </button>
              {showTip && (
                <div className={`mt-2 p-3 rounded-md ${cyberTheme.tipBg} border ${cyberTheme.tipBorder}`}>
                  <p className={`text-xs ${cyberTheme.textLight}`}>{exercise.tip}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleFinishWarmup}
              variant="secondary"
              className={`w-full sm:w-auto ${cyberTheme.buttonSecondaryBg} ${cyberTheme.buttonSecondaryHoverBg} ${cyberTheme.textMuted}`}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Skip
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!userInteracted}
              className={`w-full flex-grow ${!userInteracted ? cyberTheme.buttonDisabledBg : cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg}`}
            >
              {currentExerciseIndex === EXERCISE_CONFIGURATIONS.length - 1 ? '이제 물결 속으로' : '다음 훈련'} 
              <ChevronRightIcon className="h-5 w-5 ml-2" />
            </Button>
          </div>

        </div>
      </main>

      {/* Footer (Optional - can be minimal) */}
      <footer className={`text-center p-3 text-xs ${cyberTheme.textMuted} ${cyberTheme.bgSecondary}/50`}>
        Habitus33 - 뇌 기능 최적화 시스템
      </footer>
    </div>
  );
} 