'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  Clock,
  Dumbbell,
  Loader2,
  X,
  AlertTriangle,
  Trophy,
} from 'lucide-react';
import { http } from '@/lib/http';
import { components } from '@/types/api.generated';
import { MUSCLE_GROUP_LABELS } from '@/lib/labels';
import { useActiveWorkoutStore } from '@/stores/useActiveWorkoutStore';
import { RestTimerBar } from '@/features/workout/components/RestTimerBar';
import { WorkoutFinishedModal } from '@/features/workout/components/WorkoutFinishedModal';

type WorkoutSessionResponse = components['schemas']['WorkoutSessionResponseDto'];
type WorkoutPlan = components['schemas']['WorkoutPlanResponseDto'];

export default function WorkoutExecutionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { startRest, setActiveSession } = useActiveWorkoutStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [finishedSessionData, setFinishedSessionData] = useState<WorkoutSessionResponse | null>(null);

  // Local state for set inputs: key = `${exerciseId}-${setNumber}` -> { weightKg: number, reps: number }
  const [setsInput, setSetsInput] = useState<Record<string, { weightKg: number; reps: number }>>({});

  // 1. Fetch active session
  const { data: session, isLoading: isLoadingSession, error } = useQuery({
    queryKey: ['active-session', sessionId],
    queryFn: async () => {
      const res = await http.get<WorkoutSessionResponse>('/sessions/active');
      return res.data;
    },
    refetchInterval: false,
  });

  // 2. Fetch plan details to render exercises and target sets
  const { data: plan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ['plan-details', session?.planId],
    queryFn: async () => {
      if (!session?.planId) return null;
      const res = await http.get<WorkoutPlan>(`/workout-plans/${session.planId}`);
      return res.data;
    },
    enabled: !!session?.planId,
  });

  // Set active session in store
  useEffect(() => {
    if (session) {
      setActiveSession(session.id, session.startedAt);
      
      // Initialize completed sets map in inputs
      const initialInputs: Record<string, { weightKg: number; reps: number }> = {};
      session.sets?.forEach((s) => {
        const key = `${s.exerciseId}-${s.setNumber}`;
        initialInputs[key] = { weightKg: s.weightKg, reps: s.reps };
      });
      setSetsInput((prev) => ({ ...initialInputs, ...prev }));
    }
  }, [session, setActiveSession]);

  // Elapsed timer stopwatch effect
  useEffect(() => {
    if (!session?.startedAt) return;
    const startMs = new Date(session.startedAt).getTime();

    const interval = setInterval(() => {
      const nowMs = new Date().getTime();
      setElapsedSeconds(Math.max(0, Math.floor((nowMs - startMs) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.startedAt]);

  // Record Set Mutation
  const recordSetMutation = useMutation({
    mutationFn: async (payload: {
      exerciseId: string;
      workoutExerciseId?: string;
      exerciseOrder: number;
      setNumber: number;
      weightKg: number;
      reps: number;
      completed: boolean;
      restSecondsTarget?: number;
      exerciseName: string;
    }) => {
      const res = await http.put<components['schemas']['WorkoutSetResponseDto']>(
        `/sessions/${sessionId}/sets`,
        {
          exerciseId: payload.exerciseId,
          workoutExerciseId: payload.workoutExerciseId,
          exerciseOrder: payload.exerciseOrder,
          setNumber: payload.setNumber,
          weightKg: payload.weightKg,
          reps: payload.reps,
          completed: payload.completed,
        }
      );
      return { set: res.data, payload };
    },
    onSuccess: ({ payload }) => {
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      // Trigger rest timer
      if (payload.completed) {
        startRest(payload.restSecondsTarget || 60, payload.exerciseName, payload.setNumber);
      }
    },
  });

  // Finish Session Mutation
  const finishMutation = useMutation({
    mutationFn: async () => {
      const res = await http.post<WorkoutSessionResponse>(`/sessions/${sessionId}/finish`);
      return res.data;
    },
    onSuccess: (data) => {
      setActiveSession(null);
      setFinishedSessionData(data);
    },
  });

  // Abandon Session Mutation
  const abandonMutation = useMutation({
    mutationFn: async () => {
      await http.post(`/sessions/${sessionId}/abandon`);
    },
    onSuccess: () => {
      setActiveSession(null);
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      router.push('/dashboard');
    },
  });

  if (isLoadingSession || isLoadingPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-sm font-medium">Carregando treino...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Sessão de treino não encontrada</h2>
          <p className="text-slate-400 text-sm mt-1">
            Não há nenhum treino ativo em andamento para esta sessão.
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  // Find the active workout day from the fetched plan
  const activeDay = plan?.days?.find((d) => d.id === session.dayId);
  const exercises = activeDay?.exercises || [];

  // Map completed sets from session backend
  const completedSetsLookup = new Set(
    session.sets?.filter((s) => s.completed).map((s) => `${s.exerciseId}-${s.setNumber}`)
  );

  const formatStopwatch = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (
    exerciseId: string,
    setNum: number,
    field: 'weightKg' | 'reps',
    val: number
  ) => {
    const key = `${exerciseId}-${setNum}`;
    setSetsInput((prev) => ({
      ...prev,
      [key]: {
        weightKg: field === 'weightKg' ? val : prev[key]?.weightKg ?? 0,
        reps: field === 'reps' ? val : prev[key]?.reps ?? 0,
      },
    }));
  };

  const handleToggleSet = (
    exerciseId: string,
    workoutExerciseId: string | undefined,
    exerciseOrder: number,
    setNum: number,
    targetWeight: number,
    targetReps: number,
    restSeconds: number,
    exerciseName: string
  ) => {
    const key = `${exerciseId}-${setNum}`;
    const inputVal = setsInput[key];
    const isCompleted = completedSetsLookup.has(key);

    const weightKg = inputVal?.weightKg ?? targetWeight;
    const reps = inputVal?.reps ?? targetReps;

    recordSetMutation.mutate({
      exerciseId,
      workoutExerciseId,
      exerciseOrder,
      setNumber: setNum,
      weightKg,
      reps,
      completed: !isCompleted,
      restSecondsTarget: restSeconds,
      exerciseName,
    });
  };

  return (
    <div className="max-w-3xl mx-auto pb-32">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 py-4 px-4 sm:px-0 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5" /> {session.planName}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{session.dayName}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Stopwatch */}
            <div className="bg-slate-900 border border-slate-700/60 px-3 py-1.5 rounded-xl flex items-center gap-2 font-mono text-cyan-300 font-bold text-sm shadow-inner">
              <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
              {formatStopwatch(elapsedSeconds)}
            </div>

            <button
              onClick={() => setShowAbandonConfirm(true)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all"
              title="Abandonar Treino"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-6 px-4 sm:px-0">
        {exercises.map((item, exIdx) => {
          const ex = item.exercise;
          const targetSetsCount = item.sets || 3;

          return (
            <div
              key={item.id || exIdx}
              className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Exercise Header */}
              <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 text-sm">
                    {exIdx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">{ex?.name || 'Exercício'}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 text-cyan-300">
                        {ex?.primaryMuscle ? MUSCLE_GROUP_LABELS[ex.primaryMuscle] : ''}
                      </span>
                      <span>•</span>
                      <span>Descanso: {item.restSeconds || 60}s</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Set Table Headers */}
              <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/50 grid grid-cols-12 text-xs font-semibold text-slate-400 text-center uppercase tracking-wider">
                <div className="col-span-2 text-left">Série</div>
                <div className="col-span-4">Carga (kg)</div>
                <div className="col-span-4">Reps</div>
                <div className="col-span-2">Concluir</div>
              </div>

              {/* Sets Rows */}
              <div className="divide-y divide-slate-800/50">
                {Array.from({ length: targetSetsCount }).map((_, setIdx) => {
                  const setNum = setIdx + 1;
                  const key = `${ex?.id}-${setNum}`;
                  const isCompleted = completedSetsLookup.has(key);
                  const currentInput = setsInput[key] || {
                    weightKg: 0,
                    reps: item.repsMin || 10,
                  };

                  return (
                    <div
                      key={setNum}
                      className={`px-4 py-3 grid grid-cols-12 items-center gap-2 transition-colors ${
                        isCompleted ? 'bg-emerald-950/20' : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="col-span-2 text-left font-bold text-sm text-slate-300">
                        Série {setNum}
                      </div>

                      {/* Weight Input */}
                      <div className="col-span-4">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="999"
                          value={currentInput.weightKg}
                          onChange={(e) =>
                            handleInputChange(
                              ex?.id || '',
                              setNum,
                              'weightKg',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-center text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                        />
                      </div>

                      {/* Reps Input */}
                      <div className="col-span-4">
                        <input
                          type="number"
                          step="1"
                          min="1"
                          max="100"
                          value={currentInput.reps}
                          onChange={(e) =>
                            handleInputChange(
                              ex?.id || '',
                              setNum,
                              'reps',
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-center text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                        />
                      </div>

                      {/* Toggle Check Button */}
                      <div className="col-span-2 flex justify-center">
                        <button
                          onClick={() =>
                            handleToggleSet(
                              ex?.id || '',
                              item.id,
                              exIdx + 1,
                              setNum,
                              0,
                              item.repsMin || 10,
                              item.restSeconds || 60,
                              ex?.name || ''
                            )
                          }
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400'
                              : 'bg-slate-800 border border-slate-700 hover:border-cyan-500 text-slate-400 hover:text-cyan-400'
                          }`}
                        >
                          <Check className="w-5 h-5 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 z-30 flex justify-center">
        <div className="max-w-3xl w-full">
          <button
            onClick={() => finishMutation.mutate()}
            disabled={finishMutation.isPending}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 active:scale-[0.98] font-black text-white text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {finishMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Trophy className="w-5 h-5" />
                CONCLUIR TREINO
              </>
            )}
          </button>
        </div>
      </div>

      {/* Floating Rest Timer Component */}
      <RestTimerBar />

      {/* Abandon Confirmation Modal */}
      {showAbandonConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Abandonar treino?</h3>
            <p className="text-sm text-slate-400 mt-1 mb-6">
              O progresso das séries não salvas neste treino será perdido. Tem certeza?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAbandonConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
              >
                Continuar Treinando
              </button>
              <button
                onClick={() => abandonMutation.mutate()}
                disabled={abandonMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30"
              >
                {abandonMutation.isPending ? 'Saindo...' : 'Abandonar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finished Workout Victory Modal */}
      {finishedSessionData && (
        <WorkoutFinishedModal
          isOpen={!!finishedSessionData}
          onClose={() => setFinishedSessionData(null)}
          sessionData={finishedSessionData}
        />
      )}
    </div>
  );
}
