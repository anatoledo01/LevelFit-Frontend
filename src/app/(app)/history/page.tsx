'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Dumbbell,
  Award,
  Coins,
  ChevronDown,
  ChevronUp,
  History,
  TrendingUp,
  Trophy,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { http } from '@/lib/http';
import { components } from '@/types/api.generated';
import { MUSCLE_GROUP_LABELS } from '@/lib/labels';

type WorkoutSession = components['schemas']['WorkoutSessionResponseDto'];
type PersonalRecord = components['schemas']['PersonalRecordDto'];
type VolumeChartPoint = components['schemas']['VolumeChartPointDto'];

interface HistoryResponse {
  data: WorkoutSession[];
  total: number;
  page: number;
  totalPages: number;
}

export default function UnifiedHistoryProgressPage() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'progress'>('sessions');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Fetch Workout Sessions
  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['workout-history'],
    queryFn: async () => {
      const res = await http.get<HistoryResponse>('/sessions');
      return res.data;
    },
  });

  // Fetch PRs
  const { data: prs = [], isLoading: isLoadingPRs } = useQuery({
    queryKey: ['personal-records'],
    queryFn: async () => {
      const res = await http.get<PersonalRecord[]>('/progress/prs');
      return res.data;
    },
  });

  // Fetch Volume progression
  const { data: volumeHistory = [], isLoading: isLoadingVolume } = useQuery({
    queryKey: ['volume-progress'],
    queryFn: async () => {
      const res = await http.get<VolumeChartPoint[]>('/progress/volume');
      return res.data;
    },
  });

  const toggleExpand = (id: string) => {
    setExpandedSessionId((prev) => (prev === id ? null : id));
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const maxVolumeInHistory = Math.max(...volumeHistory.map((v) => v.totalVolumeKg), 1000);
  const totalSessionsCount = sessionsData?.total || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-100 flex items-center gap-2">
          <History className="w-8 h-8 text-amber-400" />
          Histórico &amp; Evolução
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Acompanhe todos os seus treinos concluídos, recordes pessoais (PRs) e o volume acumulado de carga
        </p>
      </div>

      {/* Navigation Tabs (Histórico de Sessões vs Evolução & Recordes) */}
      <div className="flex items-center gap-2 bg-gray-900/90 border border-gray-800 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeTab === 'sessions'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Sessões Realizadas</span>
          {totalSessionsCount > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'sessions' ? 'bg-black text-amber-400' : 'bg-gray-800 text-gray-300'
              }`}
            >
              {totalSessionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeTab === 'progress'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Evolução &amp; Recordes</span>
          {prs.length > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'progress' ? 'bg-black text-amber-400' : 'bg-gray-800 text-gray-300'
              }`}
            >
              {prs.length} PRs
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: SESSÕES DE TREINO (HISTÓRICO) */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {isLoadingSessions ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-gray-900/50 border border-gray-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : !sessionsData || sessionsData.data.length === 0 ? (
            <div className="text-center py-16 bg-gray-900/40 border border-gray-800/80 rounded-3xl space-y-3">
              <Dumbbell className="w-12 h-12 text-gray-600 mx-auto" />
              <h3 className="text-lg font-bold text-gray-300">Nenhum treino registrado ainda</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Assim que você concluir seu primeiro treino, o histórico completo e o resumo de recompensas aparecerão aqui!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessionsData.data.map((session) => {
                const isExpanded = expandedSessionId === session.id;
                const durationMin = session.durationSec ? Math.floor(session.durationSec / 60) : 0;
                const isCompleted = session.status === 'COMPLETED';

                return (
                  <div
                    key={session.id}
                    className="bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-3xl overflow-hidden transition-all shadow-lg"
                  >
                    {/* Card Header */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              isCompleted
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" /> Abandonado
                              </>
                            )}
                          </span>

                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                            {formatDate(session.startedAt)}
                          </span>
                        </div>

                        <h3 className="text-xl font-black text-gray-100">
                          {session.planName} • <span className="text-amber-400">{session.dayName}</span>
                        </h3>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-300">
                          <div className="flex items-center gap-1 text-amber-300">
                            <Clock className="w-3.5 h-3.5" /> {durationMin} min
                          </div>
                          <div className="flex items-center gap-1 text-emerald-300">
                            <Dumbbell className="w-3.5 h-3.5" /> {session.totalVolumeKg.toLocaleString('pt-BR')} kg levantados
                          </div>
                          <div className="flex items-center gap-1 text-amber-400">
                            <Award className="w-3.5 h-3.5" /> +{session.xpEarned} XP
                          </div>
                          <div className="flex items-center gap-1 text-emerald-400">
                            <Coins className="w-3.5 h-3.5" /> +{session.coinsEarned} 🪙
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleExpand(session.id)}
                        className="self-start sm:self-center px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                      >
                        <span>{isExpanded ? 'Ocultar Séries' : 'Ver Séries'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Expandable Sets Grid */}
                    {isExpanded && session.sets && (
                      <div className="border-t border-gray-800 bg-gray-950/60 p-5 sm:p-6 space-y-4">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          Séries Registradas ({session.sets.length})
                        </h4>

                        {session.sets.length === 0 ? (
                          <p className="text-xs text-gray-500">Nenhuma série foi gravada nesta sessão.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {session.sets.map((set) => (
                              <div
                                key={set.id}
                                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                                  set.completed
                                    ? 'bg-gray-900 border-gray-800'
                                    : 'bg-rose-950/20 border-rose-500/20 text-rose-300'
                                }`}
                              >
                                <div>
                                  <div className="font-bold text-gray-200">Série #{set.setNumber}</div>
                                  <div className="text-gray-400 font-medium">Ordem #{set.exerciseOrder}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-black text-amber-300 text-sm">
                                    {set.weightKg} kg × {set.reps} reps
                                  </div>
                                  {set.isPR && (
                                    <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 inline-block mt-0.5">
                                      🏆 Recorde!
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EVOLUÇÃO & RECORDES (GRÁFICO DE VOLUME + GALERIA DE PRs) */}
      {activeTab === 'progress' && (
        <div className="space-y-8">
          {/* Timeline Chart Volume */}
          <div className="bg-gray-900/80 border border-gray-800 p-6 rounded-3xl shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-100 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400 fill-current" />
                  Volume Total de Carga por Treino (kg)
                </h3>
                <p className="text-xs text-gray-400">
                  Carga total movimentada (Peso × Repetições) em cada treino concluído
                </p>
              </div>
            </div>

            {isLoadingVolume ? (
              <div className="h-40 bg-gray-950/50 rounded-2xl animate-pulse" />
            ) : volumeHistory.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-xs">
                Nenhum histórico de volume registrado ainda. Finalize treinos para visualizar seu gráfico de progressão!
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-48 flex items-end gap-2 sm:gap-3 pt-6 pb-2 border-b border-gray-800 overflow-x-auto">
                  {volumeHistory.map((pt, i) => {
                    const heightPercent = Math.min(
                      100,
                      Math.max(12, Math.round((pt.totalVolumeKg / maxVolumeInHistory) * 100))
                    );
                    return (
                      <div
                        key={i}
                        className="flex-1 min-w-[36px] flex flex-col items-center gap-2 group h-full justify-end"
                      >
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-amber-300 bg-gray-950 px-2 py-0.5 rounded border border-gray-800 pointer-events-none whitespace-nowrap">
                          {pt.totalVolumeKg.toLocaleString('pt-BR')} kg
                        </div>

                        <div
                          className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-300 rounded-t-lg transition-all group-hover:brightness-125"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[9px] font-medium text-gray-500 truncate max-w-full">
                          {new Date(pt.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Recordes Pessoais (PRs) */}
          <div className="bg-gray-900/80 border border-gray-800 p-6 rounded-3xl shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-100 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Galeria de Recordes Pessoais (PRs)
                </h3>
                <p className="text-xs text-gray-400">
                  Maior peso suportado e estimativa de 1RM (1-Rep Max) via fórmula de Brzycki
                </p>
              </div>
            </div>

            {isLoadingPRs ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-950/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : prs.length === 0 ? (
              <div className="text-center py-12 bg-gray-950/40 border border-gray-800/80 rounded-2xl space-y-2">
                <Trophy className="w-10 h-10 text-gray-600 mx-auto" />
                <h4 className="text-sm font-bold text-gray-300">Nenhum Recorde Pessoal Registrado</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Execute suas séries marcando-as como concluídas para gravar seus novos recordes de carga!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prs.map((pr) => (
                  <div
                    key={pr.exerciseId}
                    className="bg-gray-950/60 border border-gray-800 p-4 rounded-2xl space-y-3 hover:border-amber-500/40 transition-all shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 inline-block mb-1">
                          {MUSCLE_GROUP_LABELS[pr.primaryMuscle as keyof typeof MUSCLE_GROUP_LABELS] ||
                            pr.primaryMuscle}
                        </span>
                        <h4 className="font-extrabold text-base text-gray-100">{pr.exerciseName}</h4>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                        <Trophy className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-800/60">
                      <div className="bg-gray-900 p-2.5 rounded-xl">
                        <div className="text-gray-500 text-[10px] font-semibold">Carga Máxima</div>
                        <div className="text-base font-black text-white">
                          {pr.maxWeightKg} kg{' '}
                          <span className="text-xs font-medium text-gray-400">({pr.maxReps} reps)</span>
                        </div>
                      </div>

                      <div className="bg-gray-900 p-2.5 rounded-xl">
                        <div className="text-gray-500 text-[10px] font-semibold">1RM Estimado</div>
                        <div className="text-base font-black text-amber-400">{pr.estimated1RM} kg</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
