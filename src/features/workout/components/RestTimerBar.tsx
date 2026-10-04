'use client';

import { useEffect } from 'react';
import { Play, Plus, SkipForward, Timer } from 'lucide-react';
import { useActiveWorkoutStore } from '@/stores/useActiveWorkoutStore';

export function RestTimerBar() {
  const {
    isResting,
    restSecondsLeft,
    restTotalSeconds,
    exerciseName,
    currentSetNumber,
    tickRest,
    addRestSeconds,
    stopRest,
  } = useActiveWorkoutStore();

  useEffect(() => {
    if (!isResting) return;

    const interval = setInterval(() => {
      tickRest();
    }, 1000);

    return () => clearInterval(interval);
  }, [isResting, tickRest]);

  if (!isResting) return null;

  const minutes = Math.floor(restSecondsLeft / 60);
  const seconds = restSecondsLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const percentage = restTotalSeconds > 0 ? (restSecondsLeft / restTotalSeconds) * 100 : 0;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-900/95 border border-cyan-500/30 backdrop-blur-xl shadow-2xl shadow-cyan-950/50 rounded-2xl p-4 text-white overflow-hidden relative">
        {/* Animated top progress indicator line */}
        <div
          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-1000 ease-linear"
          style={{ width: `${percentage}%` }}
        />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 animate-pulse">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Descanso {exerciseName ? `• ${exerciseName}` : ''} {currentSetNumber ? `(Série ${currentSetNumber})` : ''}
              </div>
              <div className="text-2xl font-black tracking-tight font-mono text-cyan-200">
                {formattedTime}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => addRestSeconds(30)}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-cyan-300 text-xs font-bold px-3 py-2 rounded-xl border border-cyan-500/20 transition-all"
              title="Adicionar 30 segundos"
            >
              <Plus className="w-3.5 h-3.5" />
              30s
            </button>
            <button
              onClick={stopRest}
              className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-cyan-600/30 transition-all"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Pular
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
