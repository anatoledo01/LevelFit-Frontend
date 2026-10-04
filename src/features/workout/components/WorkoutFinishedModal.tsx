'use client';

import { useRouter } from 'next/navigation';
import { Award, Coins, Flame, Sparkles, Trophy, Dumbbell, Clock } from 'lucide-react';

interface WorkoutFinishedModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: {
    planName: string;
    dayName: string;
    durationSec?: number;
    totalVolumeKg: number;
    xpEarned: number;
    coinsEarned: number;
  };
}

export function WorkoutFinishedModal({
  isOpen,
  onClose,
  sessionData,
}: WorkoutFinishedModalProps) {
  const router = RouterHook();

  if (!isOpen) return null;

  const minutes = Math.floor((sessionData.durationSec || 0) / 60);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center relative overflow-hidden shadow-2xl shadow-cyan-500/20 animate-in zoom-in-95 duration-300">
        {/* Glowing background highlights */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy Icon */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-xl shadow-cyan-500/30 mb-6">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-emerald-400">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Victory Royale
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Treino Concluído!
        </h2>
        <p className="text-sm text-slate-400 mt-1 font-medium">
          {sessionData.planName} • <span className="text-cyan-400">{sessionData.dayName}</span>
        </p>

        {/* Rewards Grid */}
        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" /> Experiência
            </div>
            <div className="text-2xl font-black text-amber-300">
              +{sessionData.xpEarned} <span className="text-xs font-semibold">XP</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Coins className="w-4 h-4" /> FitCoins
            </div>
            <div className="text-2xl font-black text-emerald-300">
              +{sessionData.coinsEarned}
            </div>
          </div>
        </div>

        {/* Workout Stats */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-6 flex justify-around text-slate-300 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-xs text-slate-500 font-medium">Duração</div>
              <div className="font-bold text-white">{minutes} min</div>
            </div>
          </div>
          <div className="w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-xs text-slate-500 font-medium">Volume Total</div>
              <div className="font-bold text-white">{sessionData.totalVolumeKg.toLocaleString('pt-BR')} kg</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            router.push('/dashboard');
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 active:scale-[0.98] font-black text-white text-base shadow-xl shadow-cyan-500/25 transition-all"
        >
          COLETAR RECOMPENSAS
        </button>
      </div>
    </div>
  );
}

function RouterHook() {
  return useRouter();
}
