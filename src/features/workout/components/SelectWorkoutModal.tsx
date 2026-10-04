'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { components } from '@/types/api.generated';
import {
  X,
  Dumbbell,
  Play,
  Loader2,
  Sparkles,
  Zap,
  Check,
  ChevronRight,
  Calendar,
} from 'lucide-react';

type WorkoutPlan = components['schemas']['WorkoutPlanResponseDto'];
type WorkoutSessionResponse = components['schemas']['WorkoutSessionResponseDto'];

interface SelectWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SelectWorkoutModal({ isOpen, onClose }: SelectWorkoutModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Fetch all plans (user plans + templates)
  const { data: plans = [], isLoading } = useQuery<WorkoutPlan[]>({
    queryKey: ['all-workout-plans-modal'],
    queryFn: async () => {
      const [mineRes, templatesRes] = await Promise.all([
        http.get<WorkoutPlan[]>('/workout-plans?type=mine').catch(() => ({ data: [] })),
        http.get<WorkoutPlan[]>('/workout-plans?type=templates').catch(() => ({ data: [] })),
      ]);
      return [...(mineRes.data || []), ...(templatesRes.data || [])];
    },
    enabled: isOpen,
  });

  // Start Session mutation
  const startSessionMutation = useMutation({
    mutationFn: async ({ planId, dayId }: { planId: string; dayId: string }) => {
      const res = await http.post<WorkoutSessionResponse>('/sessions/start', { planId, dayId });
      return res.data;
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      onClose();
      router.push(`/workout/${session.id}`);
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao iniciar o treino');
    },
  });

  if (!isOpen) return null;

  // Active plan or default to first plan
  const activePlan = plans.find((p) => p.id === user?.activePlanId) || plans[0];
  const currentSelectedPlan = plans.find((p) => p.id === selectedPlanId) || activePlan;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-amber-500/30 w-full max-w-2xl rounded-3xl shadow-2xl shadow-amber-500/10 flex flex-col max-h-[90vh] overflow-hidden relative">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-gray-800 flex items-start justify-between gap-4 bg-gradient-to-r from-gray-900 via-[#131b2e] to-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-md">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-100 flex items-center gap-2">
                Iniciar Treino de Hoje
              </h2>
              <p className="text-xs text-gray-400">
                Escolha a ficha e o dia de treino para entrar no modo arena!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs font-semibold">Carregando fichas de treino...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Dumbbell className="w-10 h-10 text-gray-600 mx-auto" />
              <p className="text-sm font-bold text-gray-300">Nenhuma ficha cadastrada no momento.</p>
              <button
                onClick={() => {
                  onClose();
                  router.push('/plans');
                }}
                className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl"
              >
                Ir para a página de Fichas
              </button>
            </div>
          ) : (
            <>
              {/* Seletor de Ficha */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
                  1. Selecione a Ficha de Treino
                </label>

                <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 scrollbar-thin">
                  {plans.map((plan) => {
                    const isSelected = currentSelectedPlan?.id === plan.id;
                    const isActive = user?.activePlanId === plan.id;
                    return (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`px-4 py-3 rounded-2xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-2 border text-left ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/60 ring-1 ring-amber-500/30'
                            : 'bg-gray-900/80 text-gray-300 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Ficha Ativa" />
                            )}
                            <span className="truncate max-w-[160px]">{plan.name}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-normal">
                            {plan.days?.length || 0} dias • {plan.daysPerWeek}x/sem
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seletor de Dia de Treino */}
              {currentSelectedPlan && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      2. Escolha o Dia de Treino ({currentSelectedPlan.name})
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentSelectedPlan.days?.map((day) => (
                      <div
                        key={day.id}
                        className="bg-gray-900/90 border border-gray-800 hover:border-amber-500/40 p-4 rounded-2xl space-y-3 flex flex-col justify-between transition-all group"
                      >
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-gray-800/80">
                            <h4 className="font-extrabold text-sm text-gray-100 group-hover:text-amber-400 transition-colors">
                              {day.name}
                            </h4>
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-800 px-2 py-0.5 rounded-md">
                              {day.exercises.length} exerc.
                            </span>
                          </div>

                          <div className="mt-2.5 space-y-1 max-h-32 overflow-y-auto pr-1">
                            {day.exercises.map((item) => (
                              <div
                                key={item.id}
                                className="text-[11px] text-gray-400 flex items-center justify-between py-0.5"
                              >
                                <span className="truncate font-medium text-gray-300">
                                  • {item.exercise.name}
                                </span>
                                <span className="text-[10px] font-semibold text-amber-400/90 shrink-0 ml-2">
                                  {item.sets}x{item.repsMin}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Botão de Início Instantâneo */}
                        <button
                          onClick={() =>
                            startSessionMutation.mutate({
                              planId: currentSelectedPlan.id,
                              dayId: day.id,
                            })
                          }
                          disabled={startSessionMutation.isPending}
                          className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                        >
                          {startSessionMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin text-black" />
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current text-black" />
                              INICIAR {day.name.toUpperCase()}
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
