'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Target,
  Trophy,
  Award,
  Coins,
  CheckCircle2,
  Lock,
  Sparkles,
  Loader2,
  Gift,
} from 'lucide-react';
import { http } from '@/lib/http';
import { components } from '@/types/api.generated';

type Mission = components['schemas']['MissionResponseDto'];
type Achievement = components['schemas']['AchievementResponseDto'];

export default function MissionsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'missions' | 'achievements'>('missions');
  const [missionTypeFilter, setMissionTypeFilter] = useState<'ALL' | 'DAILY' | 'WEEKLY' | 'SPECIAL'>('ALL');
  const [claimedRewardMessage, setClaimedRewardMessage] = useState<{ xp: number; coins: number } | null>(null);

  // Fetch Missions
  const { data: missions = [], isLoading: isLoadingMissions } = useQuery({
    queryKey: ['user-missions'],
    queryFn: async () => {
      const res = await http.get<Mission[]>('/gamification/missions');
      return res.data;
    },
  });

  // Fetch Achievements
  const { data: achievements = [], isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['user-achievements'],
    queryFn: async () => {
      const res = await http.get<Achievement[]>('/gamification/achievements');
      return res.data;
    },
  });

  // Claim Mission Reward Mutation
  const claimMutation = useMutation({
    mutationFn: async (missionId: string) => {
      const res = await http.post<{ xpGranted: number; coinsGranted: number }>(
        `/gamification/missions/${missionId}/claim`
      );
      return res.data;
    },
    onSuccess: (data) => {
      setClaimedRewardMessage({ xp: data.xpGranted, coins: data.coinsGranted });
      queryClient.invalidateQueries({ queryKey: ['user-missions'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const filteredMissions = missions.filter((m) => {
    if (missionTypeFilter === 'ALL') return true;
    return m.type === missionTypeFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-100 flex items-center gap-2">
          <Target className="w-7 h-7 text-emerald-400" />
          Missões &amp; Conquistas RPG
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Cumpra desafios diários, semanais e especiais no aplicativo para acumular XP e Moedas
        </p>
      </div>

      {/* Primary Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab('missions')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'missions'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
          }`}
        >
          <Target className="w-4 h-4" />
          Quadro de Missões ({missions.length})
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'achievements'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Galeria de Conquistas ({achievements.filter((a) => a.unlocked).length}/{achievements.length})
        </button>
      </div>

      {/* Reward Claim Banner Toast */}
      {claimedRewardMessage && (
        <div className="bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 p-4 rounded-2xl shadow-xl flex items-center justify-between font-black text-sm animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>
              Recompensa Resgatada! +{claimedRewardMessage.xp} XP e +{claimedRewardMessage.coins} Moedas!
            </span>
          </div>
          <button
            onClick={() => setClaimedRewardMessage(null)}
            className="text-xs bg-slate-950 text-white px-3 py-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            OK
          </button>
        </div>
      )}

      {/* Tab 1: Missões */}
      {activeTab === 'missions' && (
        <div className="space-y-6">
          {/* Sub-filters for mission type */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: 'Todas as Missões' },
              { id: 'DAILY', label: '⚡ Diárias' },
              { id: 'WEEKLY', label: '📅 Semanas' },
              { id: 'SPECIAL', label: '👑 Desafios Especiais' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setMissionTypeFilter(f.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
                  missionTypeFilter === f.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoadingMissions ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-gray-900/50 border border-gray-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredMissions.length === 0 ? (
            <div className="text-center py-12 bg-gray-900/40 border border-gray-800/80 rounded-2xl space-y-2">
              <Target className="w-10 h-10 text-gray-600 mx-auto" />
              <h4 className="text-sm font-bold text-gray-300">Nenhuma missão nesta categoria</h4>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMissions.map((m) => {
                const percent = Math.min(100, Math.round((m.progress / m.target) * 100));
                const typeLabel =
                  m.type === 'DAILY' ? 'Missão Diária' : m.type === 'WEEKLY' ? 'Missão Semanal' : 'Desafio Especial';

                return (
                  <div
                    key={m.id}
                    className={`p-5 rounded-2xl border transition-all shadow-lg flex flex-col justify-between space-y-4 ${
                      m.claimed
                        ? 'bg-gray-900/40 border-gray-800/60 opacity-70'
                        : m.completed
                        ? 'bg-gradient-to-r from-emerald-950/40 via-gray-900 to-emerald-950/40 border-emerald-500/40 ring-1 ring-emerald-500/20'
                        : 'bg-gray-900/80 border-gray-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {typeLabel}
                        </span>

                        <div className="flex items-center gap-3 text-xs font-bold">
                          <span className="text-amber-400 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" /> +{m.xpReward} XP
                          </span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5" /> +{m.coinsReward}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-extrabold text-base text-gray-100">{m.title}</h3>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{m.description}</p>
                    </div>

                    {/* Progress Bar & Claim Button */}
                    <div className="space-y-2 pt-2 border-t border-gray-800/60">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-gray-400">Progresso</span>
                        <span className="text-emerald-400">
                          {m.progress} / {m.target} ({percent}%)
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-gray-950 rounded-full border border-gray-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {m.completed && !m.claimed && (
                        <button
                          onClick={() => claimMutation.mutate(m.id)}
                          disabled={claimMutation.isPending}
                          className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                          {claimMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Gift className="w-4 h-4" /> RESGATAR RECOMPENSA
                            </>
                          )}
                        </button>
                      )}

                      {m.claimed && (
                        <div className="text-center py-1 text-xs font-bold text-gray-500 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Recompensa Coletada
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Galeria de Conquistas */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {isLoadingAchievements ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-gray-900/50 border border-gray-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((ach) => {
                const percent = Math.min(100, Math.round((ach.progress / ach.target) * 100));

                return (
                  <div
                    key={ach.id}
                    className={`p-5 rounded-2xl border transition-all shadow-lg flex items-start gap-4 ${
                      ach.unlocked
                        ? 'bg-gradient-to-r from-amber-950/20 via-gray-900 to-amber-950/20 border-amber-500/40'
                        : 'bg-gray-900/60 border-gray-800 opacity-75'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                        ach.unlocked
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-gray-950 border-gray-800 text-gray-600'
                      }`}
                    >
                      {ach.unlocked ? <Trophy className="w-6 h-6 animate-pulse" /> : <Lock className="w-6 h-6" />}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                          {ach.category}
                        </span>

                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="text-amber-400">+{ach.xpReward} XP</span>
                          <span className="text-emerald-400">+{ach.coinsReward} 🪙</span>
                        </div>
                      </div>

                      <h4 className="font-extrabold text-base text-gray-100">{ach.name}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{ach.description}</p>

                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
                          <span>Progresso</span>
                          <span className={ach.unlocked ? 'text-amber-400' : 'text-gray-400'}>
                            {ach.progress} / {ach.target}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              ach.unlocked ? 'bg-gradient-to-r from-amber-500 to-yellow-300' : 'bg-gray-700'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
