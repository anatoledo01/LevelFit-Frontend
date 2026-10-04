'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Trophy,
  TrendingUp,
  Dumbbell,
  Zap,
} from 'lucide-react';
import { http } from '@/lib/http';
import { components } from '@/types/api.generated';
import { MUSCLE_GROUP_LABELS } from '@/lib/labels';

type PersonalRecord = components['schemas']['PersonalRecordDto'];
type VolumeChartPoint = components['schemas']['VolumeChartPointDto'];

export default function ProgressPage() {
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

  const maxVolumeInHistory = Math.max(...volumeHistory.map((v) => v.totalVolumeKg), 1000);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-100 flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-amber-400" />
          Evolução &amp; Recordes Pessoais
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Acompanhe o seu ganho de força, estatísticas de volume total de carga e marcas de 1RM estimadas
        </p>
      </div>

      {/* Seção 1: Gráfico Visual de Volume de Carga ao Longo do Tempo */}
      <div className="bg-gray-900/80 border border-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-gray-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 fill-current" />
              Volume Total de Carga por Treino (kg)
            </h3>
            <p className="text-xs text-gray-400">
              Soma total do peso movimentado (Carga × Repetições) em cada sessão concluída
            </p>
          </div>
        </div>

        {isLoadingVolume ? (
          <div className="h-44 bg-gray-950/50 rounded-2xl animate-pulse" />
        ) : volumeHistory.length === 0 ? (
          <div className="text-center py-12 bg-gray-950/40 border border-gray-800/80 rounded-2xl text-gray-500 text-xs">
            Nenhum histórico de volume registrado ainda. Finalize treinos para visualizar seu gráfico de progressão!
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-52 flex items-end gap-2 sm:gap-3 pt-8 pb-2 border-b border-gray-800 overflow-x-auto">
              {volumeHistory.map((pt, i) => {
                const heightPercent = Math.min(
                  100,
                  Math.max(12, Math.round((pt.totalVolumeKg / maxVolumeInHistory) * 100))
                );
                return (
                  <div
                    key={i}
                    className="flex-1 min-w-[40px] flex flex-col items-center gap-2 group h-full justify-end"
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-amber-300 bg-gray-950 px-2 py-0.5 rounded border border-gray-800 pointer-events-none whitespace-nowrap shadow-lg">
                      {pt.totalVolumeKg.toLocaleString('pt-BR')} kg
                    </div>

                    <div
                      className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-300 rounded-t-xl transition-all group-hover:brightness-125 shadow-lg shadow-amber-500/10"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] font-medium text-gray-400 truncate max-w-full">
                      {new Date(pt.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Seção 2: Tabela de Recordes Pessoais (PRs) por Exercício */}
      <div className="bg-gray-900/80 border border-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-gray-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Galeria de Recordes Pessoais (PRs)
            </h3>
            <p className="text-xs text-gray-400">
              Maior peso suportado e estimativa de 1RM (1-Rep Max) calculada via fórmula de Brzycki
            </p>
          </div>
        </div>

        {isLoadingPRs ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-950/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : prs.length === 0 ? (
          <div className="text-center py-14 bg-gray-950/40 border border-gray-800/80 rounded-2xl space-y-3">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto" />
            <h4 className="text-sm font-bold text-gray-300">Nenhum Recorde Pessoal Registrado</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Execute suas séries marcando-as como concluídas para gravar seus novos recordes de carga no sistema!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prs.map((pr) => (
              <div
                key={pr.exerciseId}
                className="bg-gray-950/60 border border-gray-800 p-5 rounded-2xl space-y-3 hover:border-amber-500/40 transition-all shadow-md group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 inline-block mb-1">
                      {MUSCLE_GROUP_LABELS[pr.primaryMuscle as keyof typeof MUSCLE_GROUP_LABELS] ||
                        pr.primaryMuscle}
                    </span>
                    <h4 className="font-extrabold text-base text-gray-100 group-hover:text-amber-400 transition-colors">
                      {pr.exerciseName}
                    </h4>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <Trophy className="w-5 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-gray-800/60">
                  <div className="bg-gray-900 p-3 rounded-xl border border-gray-800">
                    <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                      Carga Máxima
                    </div>
                    <div className="text-base font-black text-white">
                      {pr.maxWeightKg} kg{' '}
                      <span className="text-xs font-medium text-gray-400">({pr.maxReps} reps)</span>
                    </div>
                  </div>

                  <div className="bg-gray-900 p-3 rounded-xl border border-amber-500/20">
                    <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                      1RM Estimado
                    </div>
                    <div className="text-base font-black text-amber-300">{pr.estimated1RM} kg</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
