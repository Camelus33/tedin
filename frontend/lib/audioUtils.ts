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

// Exported function to play predefined sounds
export const playSound = (type: 'place' | 'correct' | 'incorrect') => {
    // Ensure AudioContext is initialized (might happen here or on first click)
    initAudioContext(); 

    switch (type) {
        case 'place':
            playToneInternal(440, 'sine', 0.08); // A4 note, short duration
            break;
        case 'correct':
            playToneInternal(660, 'sine', 0.1); // E5 note
            // Optional: Play a second higher tone shortly after for effect
            // setTimeout(() => playToneInternal(880, 'sine', 0.05), 80);
            break;
        case 'incorrect':
            playToneInternal(220, 'square', 0.15); // A3 note, square wave for harsher sound
            break;
        default:
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