import { create } from 'zustand';

interface ActiveWorkoutState {
  // Session details
  activeSessionId: string | null;
  startedAt: string | null;

  // Rest Timer State
  isResting: boolean;
  restSecondsLeft: number;
  restTotalSeconds: number;
  exerciseName: string | null;
  currentSetNumber: number | null;

  // Actions
  setActiveSession: (sessionId: string | null, startedAt?: string) => void;
  startRest: (seconds: number, exerciseName?: string, setNumber?: number) => void;
  addRestSeconds: (seconds: number) => void;
  stopRest: () => void;
  tickRest: () => void;
}

// Simple Web Audio API beep sound generator for rest timer finish
function playBeepSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Play 3 short pleasant beeps
    const times = [0, 0.15, 0.3];
    times.forEach((startTime) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime + startTime); // A5 note
      gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + 0.1);
    });
  } catch (err) {
    console.warn('AudioContext not supported or blocked:', err);
  }
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>((set, get) => ({
  activeSessionId: null,
  startedAt: null,

  isResting: false,
  restSecondsLeft: 0,
  restTotalSeconds: 0,
  exerciseName: null,
  currentSetNumber: null,

  setActiveSession: (sessionId, startedAt) =>
    set({
      activeSessionId: sessionId,
      startedAt: startedAt || (sessionId ? new Date().toISOString() : null),
    }),

  startRest: (seconds, exerciseName, setNumber) => {
    set({
      isResting: true,
      restSecondsLeft: seconds,
      restTotalSeconds: seconds,
      exerciseName: exerciseName || null,
      currentSetNumber: setNumber || null,
    });
  },

  addRestSeconds: (seconds) => {
    const current = get().restSecondsLeft;
    const total = get().restTotalSeconds;
    set({
      restSecondsLeft: Math.max(0, current + seconds),
      restTotalSeconds: total + (seconds > 0 ? seconds : 0),
    });
  },

  stopRest: () => {
    set({
      isResting: false,
      restSecondsLeft: 0,
      restTotalSeconds: 0,
      exerciseName: null,
      currentSetNumber: null,
    });
  },

  tickRest: () => {
    const { restSecondsLeft, isResting } = get();
    if (!isResting) return;

    if (restSecondsLeft <= 1) {
      playBeepSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      set({
        isResting: false,
        restSecondsLeft: 0,
      });
    } else {
      set({ restSecondsLeft: restSecondsLeft - 1 });
    }
  },
}));
