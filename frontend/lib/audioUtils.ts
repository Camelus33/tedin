let audioContext: AudioContext | null = null;

// Function to initialize AudioContext (must be called after a user gesture)
const initAudioContext = () => {
    if (!audioContext && typeof window !== 'undefined') {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            console.log("AudioContext initialized.");
        } catch (e) {
            console.error("Web Audio API is not supported in this browser", e);
        }
    }
    return audioContext;
};

// Function to play a simple tone
const playToneInternal = (
    frequency: number,
    type: OscillatorType = 'sine',
    duration: number = 0.1 // duration in seconds
) => {
    const ctx = initAudioContext();
    if (!ctx || ctx.state === 'suspended') {
        // Attempt to resume context if suspended (often due to user interaction needed)
        ctx?.resume().then(() => playToneInternal(frequency, type, duration));
        console.log("AudioContext suspended, user interaction might be needed.");
        return; 
    }

    try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        // Simple envelope (fade out)
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime); // Start volume
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
        console.error("Error playing tone:", e);
    }
};

const SOUND_FILE_MAP: Record<string, string[]> = {
  place: ['/sounds/stone-place.mp3', '/sounds/stone-place.ogg', '/sounds/stone-place.wav'],
  correct: ['/sounds/correct.mp3', '/sounds/correct.ogg', '/sounds/correct.wav'],
  incorrect: ['/sounds/incorrect.mp3', '/sounds/incorrect.ogg', '/sounds/incorrect.wav'],
  perfect: ['/sounds/perfect.mp3', '/sounds/perfect.ogg', '/sounds/perfect.wav'],
};

// Exported function to play predefined sounds
export const playSound = (type: 'place' | 'correct' | 'incorrect' | 'perfect') => {
  const files = SOUND_FILE_MAP[type];
  if (!files) return;
  let played = false;
  for (const src of files) {
    const audio = new Audio(src);
    audio.volume = 0.7;
    audio.onerror = (e) => {
      console.error(`[사운드] 파일을 못 불러왔어요:`, src, e);
    };
    audio.onplay = () => {
      console.log(`[사운드] 재생 성공:`, src);
    };
    audio.onended = () => {
      console.log(`[사운드] 재생 끝:`, src);
    };
    audio.play().then(() => {
      played = true;
    }).catch((err) => {
      console.warn(`[사운드] 재생 실패:`, src, err);
    });
    // 한 번만 시도(여러 번 겹치지 않게)
    break;
  }
};

// Export a function to ensure context is started on user interaction
export const ensureAudioContext = () => {
    initAudioContext();
    // If context is suspended, try to resume it. 
    // This is often needed on the first user interaction.
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}; 