'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { GOAL_LABELS } from '@/lib/labels';
import { http } from '@/lib/http';
import { components } from '@/types/api.generated';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  Flame,
  Coins,
  Trophy,
  Target,
  Dumbbell,
  Calendar,
  Zap,
  ArrowRight,
  Activity,
} from 'lucide-react';

type WorkoutSessionResponse = components['schemas']['WorkoutSessionResponseDto'];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Check for existing active session
  const { data: activeSession } = useQuery({
    queryKey: ['active-session'],
    queryFn: async () => {
      try {
        const res = await http.get<WorkoutSessionResponse>('/sessions/active');
        return res.data;
      } catch {
        return null;
      }
    },
  });

  if (!user) return null;

  const stats = user.stats || {
    xp: 0,
    level: 1,
    coins: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalWorkouts: 0,
    totalSets: 0,
    totalVolumeKg: 0,
    totalPRs: 0,
  };

  // LevelFit XP progress calculation
  const currentLevel = stats.level;
  const xpForCurrentLevelStart = 50 * (currentLevel - 1) * (currentLevel + 8);
  const xpForNextLevelStart = 50 * currentLevel * (currentLevel + 9);
  const xpRequiredForNext = xpForNextLevelStart - xpForCurrentLevelStart;
  const currentLevelXp = Math.max(0, stats.xp - xpForCurrentLevelStart);
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((currentLevelXp / xpRequiredForNext) * 100)),
  );

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Active Workout Floating Alert Banner if user has session in progress */}
      {activeSession && (
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950 border border-cyan-500/40 p-4 rounded-2xl shadow-xl shadow-cyan-950/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
              <Activity className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Treino em Andamento!
              </div>
              <p className="text-sm font-black text-white">
                {activeSession.planName} • <span className="text-cyan-300">{activeSession.dayName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push(`/workout/${activeSession.id}`)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <span>CONTINUAR TREINO</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* User Hero RPG Card */}
      <div className="bg-gradient-to-r from-gray-900 via-[#131b2e] to-gray-900 border border-gray-800 p-5 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          {/* Avatar & Identidade */}
          <div className="flex items-center gap-3.5 sm:gap-4 w-full md:w-auto">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-1 shadow-lg shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center text-amber-400 font-black text-xl sm:text-3xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black text-gray-100 truncate max-w-[180px] sm:max-w-none">{user.name}</h1>
                <span className="text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                  {GOAL_LABELS[user.goal] || user.goal}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
                <span>Nível {stats.level}</span> •{' '}
                <span className="text-amber-400 font-semibold">{stats.xp.toLocaleString()} XP Total</span>
              </p>
            </div>
          </div>

          {/* Botão Começar Treino Principal */}
          <button
            onClick={() => {
              if (activeSession) {
                router.push(`/workout/${activeSession.id}`);
              } else {
                router.push('/plans');
              }
            }}
            className="w-full md:w-auto px-6 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-3 group"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-black/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-black" />
            </div>
            <span>{activeSession ? 'VOLTAR AO TREINO' : 'COMEÇAR TREINO'}</span>
          </button>
        </div>

        {/* Barra de Progresso de XP */}
        <div className="mt-6 sm:mt-8 space-y-2 relative z-10">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold">
            <span className="text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
              NÍVEL {stats.level}
            </span>
            <span className="text-gray-400">
              {currentLevelXp.toLocaleString()} / {xpRequiredForNext.toLocaleString()} XP ({progressPercent}%)
            </span>
          </div>

          <div className="w-full h-3 sm:h-3.5 bg-gray-950 rounded-full border border-gray-800 p-0.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-500 shadow-sm shadow-amber-500/50"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid de Estatísticas Rápidas de Gamificação (Ultra-Responsive) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Streak */}
        <div className="bg-gray-900/80 border border-gray-800 p-3.5 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 overflow-hidden">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg sm:text-2xl font-black text-gray-100 truncate">{stats.currentStreak} dias</p>
            <p className="text-[10px] sm:text-xs text-gray-400 font-semibold leading-tight">Sequência Atual</p>
          </div>
        </div>

        {/* Coins */}
        <div className="bg-gray-900/80 border border-gray-800 p-3.5 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 overflow-hidden">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg sm:text-2xl font-black text-gray-100 truncate">{stats.coins}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 font-semibold leading-tight">Moedas 🪙</p>
          </div>
        </div>

        {/* Total Workouts */}
        <div className="bg-gray-900/80 border border-gray-800 p-3.5 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 overflow-hidden">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg sm:text-2xl font-black text-gray-100 truncate">{stats.totalWorkouts}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 font-semibold leading-tight">Treinos Concluídos</p>
          </div>
        </div>

        {/* PRs */}
        <div className="bg-gray-900/80 border border-gray-800 p-3.5 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 overflow-hidden">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg sm:text-2xl font-black text-gray-100 truncate">{stats.totalPRs}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 font-semibold leading-tight">Recordes Pessoais</p>
          </div>
        </div>
      </div>

      {/* Cards de Seções do App */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Próximo Treino Banner */}
        <div className="bg-gray-900/80 border border-gray-800 p-5 sm:p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Sua Ficha Ativa
              </span>
              <Link href="/plans" className="text-xs text-amber-400 hover:underline font-semibold">
                Ver Fichas
              </Link>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-100">Pronto para o próximo treino?</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Selecione uma das fichas prontas da biblioteca ou crie a sua própria divisão de treino personalizada.
            </p>
          </div>

          <Link
            href="/plans"
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-100 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors text-center block"
          >
            Escolher ou Criar Ficha
          </Link>
        </div>

        {/* Missões Banner */}
        <div className="bg-gray-900/80 border border-gray-800 p-5 sm:p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Missões Diárias
              </span>
              <Link href="/missions" className="text-xs text-emerald-400 hover:underline font-semibold">
                Ver Missões
              </Link>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-100">Missão: Primeiro Treino</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Complete 1 treino hoje para ganhar +100 XP e +20 moedas virtuais.
            </p>
          </div>

          <Link
            href="/missions"
            className="w-full py-3 bg-emerald-950/60 border border-emerald-500/20 hover:bg-emerald-900/40 text-emerald-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors text-center block"
          >
            Ver Todas as Missões
          </Link>
        </div>
      </div>
    </div>
  );
}
