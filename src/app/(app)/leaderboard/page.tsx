'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import {
  Trophy,
  Flame,
  Zap,
  Dumbbell,
  Crown,
  Medal,
  Award,
  Loader2,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

type MetricType = 'xp' | 'streak' | 'workouts' | 'volume';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  level: number;
  xp: number;
  currentStreak: number;
  totalWorkouts: number;
  totalVolumeKg: number;
  isCurrentUser: boolean;
}

interface LeaderboardResponse {
  metric: MetricType;
  entries: LeaderboardEntry[];
  currentUserEntry?: LeaderboardEntry;
}

export default function LeaderboardPage() {
  const [metric, setMetric] = useState<MetricType>('xp');

  const { data, isLoading, isError } = useQuery<LeaderboardResponse>({
    queryKey: ['leaderboard', metric],
    queryFn: async () => {
      const res = await http.get<LeaderboardResponse>(`/gamification/leaderboard?metric=${metric}`);
      return res.data;
    },
  });

  const entries = data?.entries || [];
  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];
  const remainingEntries = entries.slice(3);
  const currentUserEntry = data?.currentUserEntry;

  const metricTabs: { id: MetricType; label: string; icon: any; unit: string }[] = [
    { id: 'xp', label: 'XP (Nível)', icon: Zap, unit: 'XP' },
    { id: 'streak', label: 'Sequência', icon: Flame, unit: 'dias' },
    { id: 'workouts', label: 'Treinos', icon: Dumbbell, unit: 'treinos' },
    { id: 'volume', label: 'Volume (Kg)', icon: TrendingUp, unit: 'kg' },
  ];

  const getMetricValue = (entry: LeaderboardEntry, m: MetricType) => {
    switch (m) {
      case 'xp':
        return `${entry.xp.toLocaleString()} XP`;
      case 'streak':
        return `${entry.currentStreak} dias`;
      case 'workouts':
        return `${entry.totalWorkouts} treinos`;
      case 'volume':
        return `${entry.totalVolumeKg.toLocaleString()} kg`;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-100 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-amber-400" />
            Ranking dos Campeões
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Compare o seu desempenho com os melhores atletas RPG da comunidade LevelFit
          </p>
        </div>

        {currentUserEntry && (
          <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-2xl flex items-center gap-3 shrink-0">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400/80">Sua Posição</div>
              <div className="text-sm font-black text-amber-300">
                #{currentUserEntry.rank} • Nível {currentUserEntry.level}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex items-center gap-2 bg-gray-900/90 border border-gray-800 p-1.5 rounded-2xl overflow-x-auto scrollbar-none">
        {metricTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = metric === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setMetric(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-105'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-xs text-gray-400 font-medium">Carregando pódio dos atletas...</p>
        </div>
      ) : isError ? (
        <div className="p-8 bg-rose-950/20 border border-rose-800/40 rounded-3xl text-center text-rose-400">
          Erro ao carregar o ranking. Tente novamente mais tarde.
        </div>
      ) : (
        <>
          {/* TOP 3 PODIUM */}
          {entries.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end pt-6">
              {/* 2º LUGAR (PRATA) */}
              <div className="order-2 md:order-1 bg-gradient-to-b from-slate-900 via-slate-900/90 to-gray-950 border border-slate-700/80 p-6 rounded-3xl text-center relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-400/10 rounded-full blur-2xl" />
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-700/60 text-slate-200 font-black text-sm mb-3 border border-slate-500">
                  <Medal className="w-5 h-5 text-slate-300" />
                </div>
                <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-700 p-1 mb-3 relative">
                  {top2.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={top2.avatarUrl} alt={top2.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center font-black text-2xl text-slate-300">
                      {top2.name.charAt(0)}
                    </div>
                  )}
                  <span className="absolute -bottom-2 -right-2 bg-slate-700 border border-slate-500 text-slate-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                    2º
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-gray-100 truncate">{top2.name}</h3>
                <p className="text-xs text-amber-400 font-semibold mt-0.5">Nv. {top2.level}</p>
                <div className="mt-3 py-2 px-3 bg-slate-950/80 rounded-xl text-xs font-black text-slate-300 border border-slate-800">
                  {getMetricValue(top2, metric)}
                </div>
              </div>

              {/* 1º LUGAR (OURO - DESTAQUE CENTRAL) */}
              <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/60 via-[#1e1708] to-gray-950 border-2 border-amber-500/80 p-7 rounded-3xl text-center relative overflow-hidden shadow-2xl shadow-amber-500/10 md:-translate-y-4">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black uppercase tracking-wider mb-3 shadow-lg shadow-amber-500/20">
                  <Crown className="w-4 h-4 text-amber-400 fill-amber-400" /> Campeão 1º
                </div>

                <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-200 p-1.5 mb-3 relative shadow-xl shadow-amber-500/20">
                  {top1.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={top1.avatarUrl} alt={top1.name} className="w-full h-full object-cover rounded-[18px]" />
                  ) : (
                    <div className="w-full h-full bg-slate-950 rounded-[18px] flex items-center justify-center font-black text-3xl text-amber-400">
                      {top1.name.charAt(0)}
                    </div>
                  )}
                </div>

                <h3 className="font-black text-lg text-amber-200 truncate">{top1.name}</h3>
                {top1.bio && (
                  <p className="text-[11px] text-gray-400 italic line-clamp-1 mt-0.5 px-2">
                    &quot;{top1.bio}&quot;
                  </p>
                )}
                <div className="mt-4 py-2.5 px-4 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-sm font-black text-amber-300 shadow-inner">
                  {getMetricValue(top1, metric)}
                </div>
              </div>

              {/* 3º LUGAR (BRONZE) */}
              <div className="order-3 bg-gradient-to-b from-amber-950/30 via-stone-900 to-gray-950 border border-amber-800/40 p-6 rounded-3xl text-center relative overflow-hidden shadow-xl">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-900/60 text-amber-400 font-black text-sm mb-3 border border-amber-700">
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-800/50 p-1 mb-3 relative">
                  {top3.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={top3.avatarUrl} alt={top3.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="w-full h-full bg-stone-950 rounded-xl flex items-center justify-center font-black text-2xl text-amber-500">
                      {top3.name.charAt(0)}
                    </div>
                  )}
                  <span className="absolute -bottom-2 -right-2 bg-amber-900 border border-amber-700 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                    3º
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-gray-100 truncate">{top3.name}</h3>
                <p className="text-xs text-amber-400 font-semibold mt-0.5">Nv. {top3.level}</p>
                <div className="mt-3 py-2 px-3 bg-stone-950/80 rounded-xl text-xs font-black text-amber-400 border border-amber-900/60">
                  {getMetricValue(top3, metric)}
                </div>
              </div>
            </div>
          )}

          {/* LISTA COMPLETA DOS DEMAIS ATLETAS */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-gray-800 font-extrabold text-sm text-gray-300 flex items-center justify-between">
              <span>Atletas Ranqueados</span>
              <span className="text-xs text-gray-500 font-normal">Mostrando Top {entries.length}</span>
            </div>

            <div className="divide-y divide-gray-800/60">
              {entries.map((entry) => (
                <div
                  key={entry.userId}
                  className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                    entry.isCurrentUser
                      ? 'bg-amber-500/15 border-l-4 border-l-amber-500'
                      : 'hover:bg-gray-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Number */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        entry.rank === 1
                          ? 'bg-amber-400 text-black'
                          : entry.rank === 2
                          ? 'bg-slate-300 text-black'
                          : entry.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-gray-950 text-gray-400 border border-gray-800'
                      }`}
                    >
                      #{entry.rank}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gray-950 border border-gray-800 overflow-hidden shrink-0">
                      {entry.avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={entry.avatarUrl} alt={entry.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold text-sm">
                          {entry.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Name & Bio */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-100 truncate">
                          {entry.name}
                        </span>
                        {entry.isCurrentUser && (
                          <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.2 rounded font-black uppercase">
                            Você
                          </span>
                        )}
                      </div>
                      {entry.bio ? (
                        <p className="text-xs text-gray-400 truncate max-w-xs sm:max-w-md">
                          {entry.bio}
                        </p>
                      ) : (
                        <span className="text-[11px] text-gray-500">Nível {entry.level}</span>
                      )}
                    </div>
                  </div>

                  {/* Metric Value */}
                  <div className="text-right shrink-0">
                    <div className="font-black text-sm text-amber-400">
                      {getMetricValue(entry, metric)}
                    </div>
                    <div className="text-[10px] text-gray-500 font-semibold">
                      Nv. {entry.level} • {entry.currentStreak}d streak
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
