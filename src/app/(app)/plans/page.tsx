'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SelectWorkoutModal } from '@/features/workout/components/SelectWorkoutModal';
import {
  useWorkoutPlans,
  useClonePlan,
  useArchivePlan,
  useActivatePlan,
} from '@/features/plans/hooks/useWorkoutPlans';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { GOAL_LABELS, DIFFICULTY_LABELS, MUSCLE_GROUP_LABELS } from '@/lib/labels';
import { http } from '@/lib/http';
import { components } from '@/types/api.generated';
import {
  Dumbbell,
  Sparkles,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  Zap,
  Copy,
  Edit3,
  Trash2,
  Check,
  Loader2,
  Play,
} from 'lucide-react';

type WorkoutSessionResponse = components['schemas']['WorkoutSessionResponseDto'];

export default function PlansPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [tab, setTab] = useState<'templates' | 'mine'>('templates');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [isSelectWorkoutOpen, setIsSelectWorkoutOpen] = useState(false);

  const { data: plans = [], isLoading } = useWorkoutPlans(tab);
  const { mutateAsync: clonePlan, isPending: isCloning } = useClonePlan();
  const { mutateAsync: archivePlan, isPending: isArchiving } = useArchivePlan();
  const { mutateAsync: activatePlan, isPending: isActivating } = useActivatePlan();

  // Start Session mutation
  const startSessionMutation = useMutation({
    mutationFn: async ({ planId, dayId }: { planId: string; dayId: string }) => {
      const res = await http.post<WorkoutSessionResponse>('/sessions/start', { planId, dayId });
      return res.data;
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      router.push(`/workout/${session.id}`);
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao iniciar o treino');
    },
  });

  const toggleExpand = (id: string) => {
    setExpandedPlanId((prev) => (prev === id ? null : id));
  };

  const handleClone = async (templateId: string) => {
    try {
      const cloned = await clonePlan(templateId);
      router.push(`/plans/builder?edit=${cloned.id}`);
    } catch {
      alert('Erro ao clonar ficha de treino');
    }
  };

  const handleActivate = async (planId: string) => {
    try {
      await activatePlan(planId);
    } catch {
      alert('Erro ao ativar ficha');
    }
  };

  const handleArchive = async (planId: string) => {
    if (!confirm('Deseja realmente remover esta ficha de treino das suas fichas?')) return;
    try {
      await archivePlan(planId);
    } catch {
      alert('Erro ao remover ficha');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-100 flex items-center gap-2">
            <Dumbbell className="w-7 h-7 text-amber-400" />
            Fichas de Treino
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Escolha uma ficha pronta da biblioteca, personalize ou crie sua própria ficha do zero
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsSelectWorkoutOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black rounded-xl shadow-lg shadow-amber-500/20 text-xs flex items-center gap-1.5 transition-all"
          >
            <Play className="w-4 h-4 fill-current text-black" />
            Começar Treino
          </button>

          <Link
            href="/plans/builder"
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Criar Minha Ficha
          </Link>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
        <button
          onClick={() => {
            setTab('templates');
            setExpandedPlanId(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            tab === 'templates'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Fichas Prontas da Biblioteca
        </button>

        <button
          onClick={() => {
            setTab('mine');
            setExpandedPlanId(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            tab === 'mine'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          Minhas Fichas ({tab === 'mine' ? plans.length : ''})
        </button>
      </div>

      {/* Lista de Fichas */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-900/50 border border-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/40 border border-gray-800/80 rounded-2xl space-y-3">
          <Dumbbell className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-gray-300">
            {tab === 'mine' ? 'Você ainda não possui fichas personalizadas' : 'Nenhuma ficha pronta encontrada'}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {tab === 'mine'
              ? 'Vá para a aba "Fichas Prontas da Biblioteca" para clonar e adaptar um modelo ou crie uma do zero!'
              : 'Execute o script de seed no backend para popular a biblioteca de treinos.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const isExpanded = expandedPlanId === plan.id;
            const isActivePlan = user?.activePlanId === plan.id;

            return (
              <div
                key={plan.id}
                className={`bg-gray-900/80 border rounded-2xl overflow-hidden transition-all shadow-lg ${
                  isActivePlan ? 'border-amber-500/60 ring-1 ring-amber-500/20' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Header do Card da Ficha */}
                <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {isActivePlan && (
                        <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-black flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          Ficha Ativa no Momento
                        </span>
                      )}
                      {plan.goal && (
                        <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {GOAL_LABELS[plan.goal] || plan.goal}
                        </span>
                      )}
                      {plan.difficulty && (
                        <span className="text-xs font-semibold text-gray-400 uppercase px-2 py-0.5 rounded bg-gray-800">
                          {DIFFICULTY_LABELS[plan.difficulty] || plan.difficulty}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        {plan.daysPerWeek}x por semana
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-gray-100">{plan.name}</h3>

                    {plan.description && (
                      <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  {/* Ações do Card */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                    {/* Ativar Ficha */}
                    {!isActivePlan && (
                      <button
                        onClick={() => handleActivate(plan.id)}
                        disabled={isActivating}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                        Ativar Ficha
                      </button>
                    )}

                    {/* Clonar / Personalizar Ficha Pronta */}
                    {plan.isTemplate ? (
                      <button
                        onClick={() => handleClone(plan.id)}
                        disabled={isCloning}
                        className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5"
                      >
                        {isCloning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
                        Personalizar esta Ficha
                      </button>
                    ) : (
                      <>
                        <Link
                          href={`/plans/builder?edit=${plan.id}`}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Editar
                        </Link>
                        <button
                          onClick={() => handleArchive(plan.id)}
                          disabled={isArchiving}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                          title="Arquivar Ficha"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => toggleExpand(plan.id)}
                      className="p-2 text-gray-400 hover:text-white bg-gray-800/60 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                    >
                      <span>{isExpanded ? 'Ocultar' : 'Ver Dias'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Detalhes Expandidos da Divisão de Treino */}
                {isExpanded && plan.days && (
                  <div className="border-t border-gray-800 bg-gray-950/60 p-5 sm:p-6 space-y-6">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Divisão dos Dias de Treino
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {plan.days.map((day) => (
                        <div
                          key={day.id}
                          className="bg-gray-900/90 border border-gray-800 p-4 rounded-xl space-y-3 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-3">
                              <h5 className="font-extrabold text-sm text-gray-100">{day.name}</h5>
                              <span className="text-[10px] text-gray-400 uppercase font-semibold">
                                {day.exercises.length} exercícios
                              </span>
                            </div>

                            <div className="space-y-2 mb-4">
                              {day.exercises.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between text-xs py-1.5 border-b border-gray-800/40 last:border-0"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded bg-gray-800 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                                      {item.order}
                                    </span>
                                    <div>
                                      <p className="font-bold text-gray-200">{item.exercise.name}</p>
                                      <p className="text-[10px] text-gray-500">
                                        {MUSCLE_GROUP_LABELS[item.exercise.primaryMuscle]}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <p className="font-extrabold text-amber-400">
                                      {item.sets}x {item.repsMin === item.repsMax ? item.repsMin : `${item.repsMin}-${item.repsMax}`}
                                    </p>
                                    <p className="text-[10px] text-gray-500 flex items-center justify-end gap-0.5">
                                      <Clock className="w-3 h-3 text-gray-500" />
                                      {item.restSeconds}s descanso
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Botão de Iniciar Treino do Dia */}
                          <button
                            onClick={() =>
                              startSessionMutation.mutate({ planId: plan.id, dayId: day.id })
                            }
                            disabled={startSessionMutation.isPending}
                            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {startSessionMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                INICIAR ESTE TREINO
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Select Workout Modal */}
      <SelectWorkoutModal
        isOpen={isSelectWorkoutOpen}
        onClose={() => setIsSelectWorkoutOpen(false)}
      />
    </div>
  );
}
