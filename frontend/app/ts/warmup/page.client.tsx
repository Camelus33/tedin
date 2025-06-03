'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/common/Button';
import Spinner from '@/components/ui/Spinner';
import { InformationCircleIcon, CheckCircleIcon, XCircleIcon, LightBulbIcon, ClockIcon, ChevronRightIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';

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
  name: string; // e.g., "Smooth Pursuit Circle", "Saccadic Jumps", "Predictive Tracking"
  targetType: 'dot' | 'icon';
  movementPattern: 'horizontal' | 'vertical' | 'circular' | 'figureEight' | 'randomJumps' | 'disappearing' | 'horizontalJumps' | 'verticalJumps';
  speed?: 'slow' | 'medium' | 'fast'; // or specific duration per step
  targetCount?: number;
  repetitions?: number; // How many times to cycle through a pattern
  durationPerSpot?: number; // For saccadic jumps
  disappearDuration?: number; // For predictive tracking
  instructionText: string;
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
  contentType: 'randomChars' | 'simpleStory';
  flowType: 'scroll' | 'highlight';
  initialSpeed: number; // chars/sec or words/sec or ms/word
  acceleration?: number; // speed increase per second or per block
  highlightRhythm?: number; // bpm for rhythmic highlight
  totalDuration?: number; // in seconds
  instructionText: string;
};

// NEW: Params for Number Saccades
type NumberSaccadesVariationParams = {
  name: string;
  targetType: 'number'; // Fixed for this type
  movementPattern: 'corners' | 'cornersAndCenter'; // Predefined patterns
  durationPerSpot: number; // ms
  repetitions: number; // How many full cycles of the pattern
  instructionText: string;
};

// NEW: Params for Word Gliding
type WordGlidingVariationParams = {
  name: string;
  contentType: 'simpleWords' | 'randomChars';
  flowType: 'highlight'; // Fixed for this type
  itemsPerLine: number; // Number of words or char blocks
  speed: number; // ms per item
  repetitions: number; // Number of lines to process
  instructionText: string;
};

// Union type for any variation parameters
type AnyVariationParams = 
  | BreathingVariationParams 
  | NumberSaccadesVariationParams // New
  | VisualSpanVariationParams
  | WordGlidingVariationParams; // New

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

// NEW: Content for Word Gliding
const SIMPLE_WORDS: string[] = [
  "하늘", "구름", "바다", "나무", "꽃잎", "햇살", "바람", "소리", "웃음", "기쁨", 
  "사랑", "행복", "친구", "가족", "여행", "음악", "책상", "의자", "연필", "공책",
  "시간", "기억", "꿈결", "세상", "마음", "생각", "이야기", "노래", "선물", "편지"
];

// NEW EXERCISE CONFIGURATIONS
const EXERCISE_CONFIGURATIONS: ExerciseConfig[] = [
  {
    id: 'guided_breathing',
    title: '마음챙김 호흡',
    generalDescription: '편안한 자세로 화면의 안내에 따라 숨을 조절하여 뇌에 신선한 산소를 공급하고 마음을 안정시킵니다.',
    tip: '숨을 내쉴 때 몸의 긴장이 함께 빠져나간다고 상상해보세요. 편안함이 중요합니다.',
    variations: [
      // Placeholder - will be filled in later
      { 
        name: '기본 호흡', 
        durations: { inhale: 4000, hold1: 2000, exhale: 6000 }, 
        totalCycles: 3, 
        instructionText: '기본 호흡: 화면의 안내에 따라 들이쉬고(4초), 잠시 멈췄다가(2초), 천천히 내쉬세요(6초).' 
      } as BreathingVariationParams,
      { 
        name: '박스 호흡', 
        durations: { inhale: 4000, hold1: 4000, exhale: 4000, hold2: 4000 }, 
        totalCycles: 3, 
        instructionText: '박스 호흡: 네모를 그리듯 들이쉬고(4초), 멈추고(4초), 내쉬고(4초), 다시 멈춥니다(4초).' 
      } as BreathingVariationParams,
      { 
        name: '이완 호흡 (4-7-8 변형)', 
        durations: { inhale: 4000, hold1: 7000, exhale: 8000 }, 
        totalCycles: 2, 
        instructionText: '이완 호흡: 깊게 들이쉬고(4초), 충분히 숨을 참았다가(7초), 길게 내뱉으세요(8초).' 
      } as BreathingVariationParams,
    ],
  },
  {
    id: 'number_saccades',
    title: '숫자 따라 시선 이동',
    generalDescription: '화면에 순서대로 나타나는 숫자를 따라 시선을 빠르게 이동합니다. 안구 이동의 정확성과 속도를 훈련합니다.',
    tip: '머리는 고정하고 눈동자만 움직여 숫자를 정확히 포착하세요. 숫자가 나타날 위치를 예측해보는 것도 좋습니다.',
    variations: [
      {
        name: '기본 4점 이동',
        targetType: 'number',
        movementPattern: 'corners',
        durationPerSpot: 1000, // ms
        repetitions: 3, // 3 cycles of 4 points = 12 numbers
        instructionText: '화면의 네 모서리에 순서대로 나타나는 숫자를 따라 빠르게 시선을 이동하세요.'
      } as NumberSaccadesVariationParams,
      {
        name: '중앙 활용 5점 이동',
        targetType: 'number',
        movementPattern: 'cornersAndCenter',
        durationPerSpot: 800, // ms
        repetitions: 2, // 2 cycles of 8 points (4 corners, 4 center returns) = 16 numbers
        instructionText: '화면의 네 모서리와 중앙에 번갈아 나타나는 숫자를 따라 빠르게 시선을 이동하세요.'
      } as NumberSaccadesVariationParams,
    ],
  },
  {
    id: 'visual_span',
    title: '동적 시야 확장',
    generalDescription: '중심을 주시하면서 주변에 나타나는 시각 정보를 빠르게 포착하여 한 번에 더 넓은 범위를 인식하는 능력을 훈련합니다.',
    tip: '중심에 시선을 고정한 채 주변을 넓게 인지하려고 노력하세요.',
    variations: [
      // Placeholder - will be filled in later
      {
        name: '3x3 문자 그리드',
        stimulusType: 'letters',
        gridSize: { rows: 3, cols: 3 },
        stimuliCount: 4, // Number of cells to show a letter in
        presentationTime: 350, // ms
        interStimulusInterval: 750, // ms
        repetitions: 12,
        instructionText: '중앙의 '+' 표시에 시선을 고정한 채, 그리드에 짧게 나타나는 문자들을 인지하세요.'
      } as VisualSpanVariationParams,
      {
        name: '단어 쌍 확장',
        stimulusType: 'words',
        wordLength: 3, // Approximate length of words to use/generate
        stimuliCount: 2, // Two words: one left, one right
        presentationTime: 450, // ms
        interStimulusInterval: 850, // ms
        repetitions: 10,
        instructionText: '중앙의 '+' 표시에 시선을 고정한 채, 좌우에 동시에 나타나는 단어들을 한눈에 파악하세요.'
      } as VisualSpanVariationParams,
    ],
  },
  {
    id: 'word_gliding',
    title: '단어 글라이딩',
    generalDescription: '한 줄의 텍스트 위를 시선이 부드럽게 미끄러지듯 따라가며 읽습니다. 자연스러운 시선 흐름과 리듬을 연습합니다.',
    tip: '단어의 의미를 파악하려 애쓰기보다, 시선이 막힘없이 부드럽게 흘러가는 감각에 집중하세요.',
    variations: [
      {
        name: '쉬운 단어 하이라이트',
        contentType: 'simpleWords',
        flowType: 'highlight',
        itemsPerLine: 6,
        speed: 450, // ms per word
        repetitions: 5, // 5 lines
        instructionText: '하이라이트되는 단어를 따라 시선을 부드럽게 이동하세요. 일정한 속도를 유지합니다.'
      } as WordGlidingVariationParams,
      {
        name: '무의미 문자열 하이라이트',
        contentType: 'randomChars',
        flowType: 'highlight',
        itemsPerLine: 5, // 5 blocks of random chars
        speed: 350, // ms per block
        repetitions: 5, // 5 lines
        instructionText: '나타나는 문자열 덩어리를 따라 시선을 부드럽게 이동하세요. 의미는 신경 쓰지 마세요.'
      } as WordGlidingVariationParams,
    ],
  },
];

export default function TSWarmupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [timeLeft, setTimeLeft] = useState<number>(180); // Adjusted total time for 4 exercises (e.g., 3 mins)
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
  
  // States specific to Guided Breathing
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2' | 'done'>('inhale');
  const [breathingCycle, setBreathingCycle] = useState<number>(1);

  // NEW: States for Number Saccades (replaces eye_tracking)
  const [currentSaccadeNumber, setCurrentSaccadeNumber] = useState<number>(1);
  const [currentSaccadeCoords, setCurrentSaccadeCoords] = useState<{ top: string, left: string } | null>(null);
  const [currentSaccadePatternStep, setCurrentSaccadePatternStep] = useState<number>(0);
  const [numberSaccadeRepCount, setNumberSaccadeRepCount] = useState<number>(0);
  const [numberSaccadesPhase, setNumberSaccadesPhase] = useState<'idle' | 'running' | 'done'>('idle');

  // States specific to Visual Span / Chunking (existing)
  const [chunkingPhase, setChunkingPhase] = useState<'showing' | 'hidden' | 'question' | 'done'>('hidden'); 
  const [currentVisualSpanStimulus, setCurrentVisualSpanStimulus] = useState<string[] | string | null>(null); 
  const [visualSpanRepetitionCount, setVisualSpanRepetitionCount] = useState<number>(0);
  type GridCell = { letter: string | null; id: number };
  const [gridStimulus, setGridStimulus] = useState<GridCell[]>([]);
  const [visualSpanPhase, setVisualSpanPhase] = useState<'idle' | 'presenting' | 'interval' | 'done'>('idle');

  // NEW: States for Word Gliding (replaces text_flow)
  const [currentGlideText, setCurrentGlideText] = useState<string[]>([]); // Holds words/chars for the current line
  const [currentGlideHighlightIdx, setCurrentGlideHighlightIdx] = useState<number>(-1);
  const [currentGlideSpeed, setCurrentGlideSpeed] = useState<number>(400); // ms per item
  const [wordGlideRepCount, setWordGlideRepCount] = useState<number>(0);
  const [wordGlidePhase, setWordGlidePhase] = useState<'idle' | 'running' | 'done'>('idle');

  // Predefined simple stories for Text Flow - Highlight variation (OLD - Not used by new WordGliding simpleWords)
  /*
  const SIMPLE_STORIES = [
    "작은 고양이가 햇볕 아래에서 낮잠을 잡니다. 바람이 부드럽게 나뭇잎을 흔듭니다. 새들이 하늘에서 노래합니다. 오늘은 참 평화로운 날입니다.",
    "소년은 강가에 앉아 물고기를 잡고 있었습니다. 갑자기 큰 물고기가 미끼를 물었습니다. 소년은 힘껏 낚싯대를 당겼습니다. 결국 멋진 물고기를 잡았습니다.",
    "소녀는 언덕 위에서 연을 날리고 있었습니다. 연은 바람을 타고 높이높이 올라갔습니다. 소녀는 웃으며 연을 바라보았습니다. 정말 신나는 하루였습니다.",
    "아침 일찍 농부가 밭으로 나갑니다. 오늘은 씨앗을 심을 예정입니다. 땅을 부드럽게 만들고 씨앗을 뿌립니다. 풍성한 수확을 기대합니다."
  ];
  */

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
      tip: '머리는 최대한 움직이지 않고 눈동자만 빠르게 움직이는 것이 중요해요! 리듬을 타면서 다음 지점으로 점프하듯 시선을 옮겨보세요.',
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
    
    // Eye Tracking / Saccades (Old - states removed, setters will be removed from here)
    // setDotPosition(null);
    // setSaccadeStep(0);
    // setSaccadeCycleCount(0);
    // setEyeTrackingPhase('idle'); 
    // setEyeTrackingCurrentRep(0);
    // setEyeTrackingTime(0);
    // console.log('[MainEffect DEBUG] eyeTrackingPhase set to idle, dotPosition to null.'); // Old log

    // NEW: Number Saccades (replaces eye_tracking)
    setNumberSaccadesPhase('done'); // Reset to done/neutral
    setCurrentSaccadeCoords(null);
    setCurrentSaccadePatternStep(0);
    setNumberSaccadeRepCount(0);
    setCurrentSaccadeNumber(1); // Default starting number

    // Visual Span / Chunking (Existing)
    setVisualSpanRepetitionCount(0);
    setCurrentVisualSpanStimulus(null);
    setGridStimulus([]);
    setVisualSpanPhase('idle');

    // Text Flow (Old - states removed, setters will be removed from here)
    // setTextFlowContent([]);
    // setCurrentHighlightIndex(-1); // Old state
    // setCurrentScrollPosition(0); 
    // setTextFlowPhase('idle'); 
    // setCurrentWordSpeed will be set from variationParams // Old comment
    // setTextFlowStartTime(0);

    // NEW: Word Gliding (replaces text_flow)
    setWordGlidePhase('done'); // Reset to done/neutral
    setCurrentGlideText([]);
    setCurrentGlideHighlightIdx(-1);
    setWordGlideRepCount(0);
    // currentGlideSpeed will be set from variationParams if this exercise is chosen
    
    // Initialize states for the *new* exercise type based on 'detail.id' and 'detail.variationParams'
    if (detail.id === 'guided_breathing') {
      setBreathingPhase('inhale');
      setBreathingCycle(1);
    } else if (detail.id === 'number_saccades') {
      // console.log('[MainEffect DEBUG] Confirmed number_saccades selected.'); // Old log adapted
      setNumberSaccadesPhase('idle'); // Start this exercise in idle phase
    } else if (detail.id === 'visual_span') {
      // Visual span is already reset to idle above, specific setup happens in its own useEffect
    } else if (detail.id === 'word_gliding') {
      // console.log('[MainEffect DEBUG] Confirmed word_gliding selected.');
      setWordGlidePhase('idle'); // Start this exercise in idle phase
      const params = detail.variationParams as WordGlidingVariationParams;
      setCurrentGlideSpeed(params.speed); 
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

  // NEW Effect for Number Saccades
  useEffect(() => {
    if (!activeExerciseDetail || activeExerciseDetail.id !== 'number_saccades' || numberSaccadesPhase === 'done') {
      setCurrentSaccadeCoords(null); // Clear coords if not active or done
      return;
    }

    const params = activeExerciseDetail.variationParams as NumberSaccadesVariationParams;
    let timerId: NodeJS.Timeout | undefined = undefined;

    // Define fixed positions for number patterns
    const positions = {
      corners: [
        { top: '15%', left: '15%' }, // Top-Left
        { top: '15%', left: '85%' }, // Top-Right
        { top: '85%', left: '85%' }, // Bottom-Right
        { top: '85%', left: '15%' }, // Bottom-Left
      ],
      cornersAndCenter: [
        { top: '15%', left: '15%' }, { top: '50%', left: '50%' }, // TL, Center
        { top: '15%', left: '85%' }, { top: '50%', left: '50%' }, // TR, Center
        { top: '85%', left: '85%' }, { top: '50%', left: '50%' }, // BR, Center
        { top: '85%', left: '15%' }, { top: '50%', left: '50%' }, // BL, Center
      ]
    };

    const currentPattern = positions[params.movementPattern];

    if (numberSaccadesPhase === 'idle') {
      setNumberSaccadesPhase('running');
      setCurrentSaccadePatternStep(0);
      setNumberSaccadeRepCount(0);
      setCurrentSaccadeNumber(1); // Start with number 1
      setCurrentSaccadeCoords(currentPattern[0]);
      return; // Allow state to update before starting timer logic
    }

    if (numberSaccadesPhase === 'running') {
      if (numberSaccadeRepCount >= params.repetitions) {
        setNumberSaccadesPhase('done');
        setUserInteracted(true);
        setCurrentSaccadeCoords(null);
        return;
      }

      setCurrentSaccadeCoords(currentPattern[currentSaccadePatternStep % currentPattern.length]);
      
      timerId = setTimeout(() => {
        const nextStep = currentSaccadePatternStep + 1;
        setCurrentSaccadeNumber(prev => prev + 1); // Increment displayed number
        
        if (nextStep >= currentPattern.length * params.repetitions) { // Check total steps across all reps
            setNumberSaccadesPhase('done');
            setUserInteracted(true);
            setCurrentSaccadeCoords(null);
        } else {
            setCurrentSaccadePatternStep(nextStep);
             // Check if a full pattern cycle is completed to increment repCount
            if (nextStep % currentPattern.length === 0) {
                setNumberSaccadeRepCount(prev => prev + 1);
                 // If all reps are done after this cycle, mark as done immediately
                if (numberSaccadeRepCount + 1 >= params.repetitions) {
                    setNumberSaccadesPhase('done');
                    setUserInteracted(true);
                    setCurrentSaccadeCoords(null);
                    return; // Exit early
                }
            }
        }
      }, params.durationPerSpot);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [activeExerciseDetail, numberSaccadesPhase, currentSaccadePatternStep, numberSaccadeRepCount]);

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

  // NEW Effect for Word Gliding
  useEffect(() => {
    if (!activeExerciseDetail || activeExerciseDetail.id !== 'word_gliding' || wordGlidePhase === 'done') {
      return;
    }

    const params = activeExerciseDetail.variationParams as WordGlidingVariationParams;
    let timerId: NodeJS.Timeout | undefined = undefined;

    const prepareNewLine = () => {
      let lineContent: string[] = [];
      if (params.contentType === 'simpleWords') {
        const shuffledWords = [...SIMPLE_WORDS].sort(() => 0.5 - Math.random());
        lineContent = shuffledWords.slice(0, params.itemsPerLine);
      } else { // randomChars
        lineContent = Array(params.itemsPerLine).fill('').map(() => {
            // Ensure RANDOM_CHAR_LINES is not empty and has elements
            if (RANDOM_CHAR_LINES.length > 0) {
                return RANDOM_CHAR_LINES[Math.floor(Math.random() * RANDOM_CHAR_LINES.length)];
            } 
            return "err#@!"; // Fallback if RANDOM_CHAR_LINES is empty
        });
      }
      setCurrentGlideText(lineContent);
      setCurrentGlideHighlightIdx(-1); 
      // currentGlideSpeed is set when exercise (variation) is selected
    };

    if (wordGlidePhase === 'idle') {
      prepareNewLine();
      setWordGlidePhase('running');
      return; // Allow state to update before timer logic
    }

    if (wordGlidePhase === 'running') {
      if (currentGlideText.length === 0) { // Content not ready (e.g. initial run after idle)
          prepareNewLine(); // Prepare it
          return; // Wait for next render cycle for content to be available
      }
      
      if (currentGlideHighlightIdx < currentGlideText.length - 1) {
        timerId = setTimeout(() => {
          setCurrentGlideHighlightIdx(prev => prev + 1);
        }, currentGlideSpeed); // currentGlideSpeed is already set from params
      } else {
        // Current line finished, check repetitions
        if (wordGlideRepCount < params.repetitions - 1) {
          setWordGlideRepCount(prev => prev + 1);
          setWordGlidePhase('idle'); // Go back to idle to prepare the next line
        } else {
          setWordGlidePhase('done');
          setUserInteracted(true);
        }
      }
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [activeExerciseDetail, wordGlidePhase, currentGlideHighlightIdx, currentGlideText, wordGlideRepCount, currentGlideSpeed]);

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
      <header className={`p-4 ${cyberTheme.bgSecondary} shadow-md flex justify-between items-center`}>
        <h1 className={`text-xl font-bold ${cyberTheme.primary}`}>집중력 예열 ({currentExerciseIndex + 1}/{EXERCISE_CONFIGURATIONS.length})</h1>
        <div className="flex items-center">
          <ClockIcon className={`h-5 w-5 mr-2 ${cyberTheme.secondary}`} />
          <span className={`text-lg font-mono ${cyberTheme.textLight}`}>{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className={`${cyberTheme.cardBg} rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md sm:max-w-lg md:max-w-xl border ${cyberTheme.borderPrimary}`}>
          
          {/* Progress Bar */}
          <div className={`w-full ${cyberTheme.progressBarBg} rounded-full h-2.5 mb-6`}>
            <div 
              className={`${cyberTheme.progressFg} h-2.5 rounded-full transition-all duration-300 ease-out`}
              style={{ width: `${((currentExerciseIndex + 1) / EXERCISE_CONFIGURATIONS.length) * 100}%` }}
            ></div>
          </div>

          <h2 className={`text-2xl font-semibold mb-3 ${cyberTheme.secondary}`}>{exercise.title}</h2>
          <p className={`${cyberTheme.textLight} mb-5 text-sm leading-relaxed`}>{exercise.description}</p>

          {/* Exercise Content */}
          <div className={`${cyberTheme.inputBg} p-4 rounded-lg mb-6 border ${cyberTheme.inputBorder} min-h-[120px] flex items-center justify-center`}>
            {/* Conditional rendering for dynamic content will be added here based on exercise.type */}
            {exercise.id === 'guided_breathing' && (exercise.variationParams as BreathingVariationParams).durations && (
              <div className="text-center w-full">
                <p className={`mb-2 text-sm ${cyberTheme.textMuted}`}>
                  호흡 주기: {breathingCycle} / {(exercise.variationParams as BreathingVariationParams).totalCycles}
                </p>
                
                {(exercise.variationParams as BreathingVariationParams).name === '박스 호흡' ? (
                  // Box Breathing UI
                  <div className="relative w-32 h-32 mx-auto mb-4 border-2 border-gray-600">
                    {/* Top Side */}
                    <div className={`absolute top-0 left-0 w-full h-2.5 transition-colors duration-200 ${(breathingPhase === 'inhale') ? cyberTheme.primary : 'bg-gray-600'}`} />
                    {/* Right Side */}
                    <div className={`absolute top-0 right-0 w-2.5 h-full transition-colors duration-200 ${(breathingPhase === 'hold1') ? cyberTheme.primary : 'bg-gray-600'}`} />
                    {/* Bottom Side */}
                    <div className={`absolute bottom-0 left-0 w-full h-2.5 transition-colors duration-200 ${(breathingPhase === 'exhale') ? cyberTheme.primary : 'bg-gray-600'}`} />
                    {/* Left Side */}
                    <div className={`absolute top-0 left-0 w-2.5 h-full transition-colors duration-200 ${(breathingPhase === 'hold2') ? cyberTheme.primary : 'bg-gray-600'}`} />
                  </div>
                ) : (
                  // Random Characters UI
                  <div className="text-center">
                    {currentGlideText.map((char, index) => (
                      <span
                        key={index}
                        className={`${currentGlideHighlightIdx === index ? cyberTheme.primary : cyberTheme.textMuted} text-2xl font-bold mr-2`}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Exercise Controls */}
          <div className="mt-6 flex justify-between">
            <Button
              onClick={handleQuitWarmup}
              variant="secondary"
              className={`${cyberTheme.buttonSecondaryBg} ${cyberTheme.buttonSecondaryHoverBg}`}
            >
              종료
            </Button>
            <Button
              onClick={handleNext}
              className={`${cyberTheme.buttonPrimaryBg} ${cyberTheme.buttonPrimaryHoverBg}`}
            >
              다음
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}