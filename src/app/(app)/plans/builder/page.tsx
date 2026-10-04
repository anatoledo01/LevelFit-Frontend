'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useCreatePlan,
  useUpdatePlan,
  useWorkoutPlan,
  CreateWorkoutPlanInput,
} from '@/features/plans/hooks/useWorkoutPlans';
import { useExercises, ExerciseDto } from '@/features/exercises/hooks/useExercises';
import { GOAL_LABELS, MUSCLE_GROUP_LABELS } from '@/lib/labels';
import { components } from '@/types/api.generated';
import {
  Dumbbell,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Search,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';

type GoalEnum = components['schemas']['CreateWorkoutPlanDto']['goal'];

interface ExerciseFormItem {
  exerciseId: string;
  exerciseName: string;
  muscle: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  notes?: string;
}

interface DayFormItem {
  name: string;
  exercises: ExerciseFormItem[];
}

export default function PlanBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const { data: existingPlan, isLoading: isLoadingPlan } = useWorkoutPlan(editId);
  const { mutateAsync: createPlan, isPending: isCreating } = useCreatePlan();
  const { mutateAsync: updatePlan, isPending: isUpdating } = useUpdatePlan();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<GoalEnum>('HYPERTROPHY');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [days, setDays] = useState<DayFormItem[]>([
    { name: 'A — Peito e Tríceps', exercises: [] },
    { name: 'B — Costas e Bíceps', exercises: [] },
  ]);

  // Estado para Modal de Escolha de Exercício
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const { exercises: exerciseList = [] } = useExercises({ q: exerciseSearch || undefined });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Se estiver editando, preenche com os dados existentes
  useEffect(() => {
    if (existingPlan) {
      setName(existingPlan.name);
      setDescription(existingPlan.description || '');
      setGoal(existingPlan.goal || 'HYPERTROPHY');
      setDaysPerWeek(existingPlan.daysPerWeek);
      if (existingPlan.days && existingPlan.days.length > 0) {
        setDays(
          existingPlan.days.map((d) => ({
            name: d.name,
            exercises: d.exercises.map((e) => ({
              exerciseId: e.exerciseId,
              exerciseName: e.exercise.name,
              muscle: e.exercise.primaryMuscle,
              sets: e.sets,
              repsMin: e.repsMin,
              repsMax: e.repsMax,
              restSeconds: e.restSeconds,
              notes: e.notes || '',
            })),
          })),
        );
      }
    }
  }, [existingPlan]);

  const addDay = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const letter = letters[days.length] || `Dia ${days.length + 1}`;
    setDays([...days, { name: `${letter} — Novo Treino`, exercises: [] }]);
  };

  const removeDay = (index: number) => {
    if (days.length <= 1) {
      setErrorMsg('A ficha precisa ter pelo menos 1 dia de treino.');
      return;
    }
    setDays(days.filter((_, i) => i !== index));
  };

  const addExerciseToDay = (ex: ExerciseDto) => {
    if (activeDayIndex === null) return;

    const newDays = [...days];
    newDays[activeDayIndex].exercises.push({
      exerciseId: ex.id,
      exerciseName: ex.name,
      muscle: ex.primaryMuscle,
      sets: 4,
      repsMin: 8,
      repsMax: 12,
      restSeconds: 90,
      notes: '',
    });

    setDays(newDays);
    setActiveDayIndex(null);
    setExerciseSearch('');
  };

  const removeExerciseFromDay = (dayIdx: number, exIdx: number) => {
    const newDays = [...days];
    newDays[dayIdx].exercises.splice(exIdx, 1);
    setDays(newDays);
  };

  const updateExerciseField = (
    dayIdx: number,
    exIdx: number,
    field: keyof ExerciseFormItem,
    value: any,
  ) => {
    const newDays = [...days];
    (newDays[dayIdx].exercises[exIdx] as any)[field] = value;
    setDays(newDays);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Informe o nome da ficha de treino.');
      return;
    }

    if (days.length === 0) {
      setErrorMsg('Adicione pelo menos 1 dia de treino.');
      return;
    }

    for (let i = 0; i < days.length; i++) {
      if (days[i].exercises.length === 0) {
        setErrorMsg(`O dia "${days[i].name}" precisa ter pelo menos 1 exercício cadastrado.`);
        return;
      }
    }

    const payload: CreateWorkoutPlanInput = {
      name,
      description,
      goal,
      daysPerWeek: Number(daysPerWeek),
      days: days.map((d, dIdx) => ({
        name: d.name,
        order: dIdx + 1,
        exercises: d.exercises.map((e, eIdx) => ({
          exerciseId: e.exerciseId,
          order: eIdx + 1,
          sets: Number(e.sets),
          repsMin: Number(e.repsMin),
          repsMax: Number(e.repsMax),
          restSeconds: Number(e.restSeconds),
          notes: e.notes || undefined,
        })),
      })),
    };

    try {
      if (editId) {
        await updatePlan({ id: editId, data: payload });
      } else {
        await createPlan(payload);
      }
      router.push('/plans');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar ficha de treino.');
    }
  };

  if (editId && isLoadingPlan) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const isSaving = isCreating || isUpdating;

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/plans')}
            className="p-2 text-gray-400 hover:text-white rounded-xl bg-gray-900 border border-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-100">
              {editId ? 'Editar Ficha de Treino' : 'Criar Minha Ficha do Zero'}
            </h1>
            <p className="text-xs text-gray-400">Monte sua divisão de dias, exercícios, séries e cargas</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl shadow-lg shadow-amber-500/20 text-xs flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Ficha
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Formulário Principal */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas da Ficha */}
        <div className="bg-gray-900/80 border border-gray-800 p-6 rounded-2xl space-y-4 shadow-lg">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Dumbbell className="w-4 h-4" />
            Informações Gerais da Ficha
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Nome da Ficha *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Minha Divisão Hipertrofia 4x"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Objetivo
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as GoalEnum)}
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 text-sm focus:outline-none focus:border-amber-500"
              >
                {Object.entries(GOAL_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Descrição ou Observações
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: Foco em progressão de carga no supino e agachamento"
              className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Estrutura dos Dias de Treino */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-200">
              Dias de Treino ({days.length})
            </h2>

            <button
              type="button"
              onClick={addDay}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-amber-400 border border-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar Dia
            </button>
          </div>

          {days.map((day, dIdx) => (
            <div key={dIdx} className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl space-y-4 shadow-md">
              {/* Header do Dia */}
              <div className="flex items-center justify-between gap-3 border-b border-gray-800 pb-3">
                <input
                  type="text"
                  value={day.name}
                  onChange={(e) => {
                    const newDays = [...days];
                    newDays[dIdx].name = e.target.value;
                    setDays(newDays);
                  }}
                  className="bg-transparent font-extrabold text-base text-gray-100 border-b border-gray-700 focus:border-amber-500 outline-none px-1 py-0.5"
                />

                <button
                  type="button"
                  onClick={() => removeDay(dIdx)}
                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Remover Dia"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Lista de Exercícios do Dia */}
              <div className="space-y-3">
                {day.exercises.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-2 text-center">
                    Nenhum exercício adicionado a este dia ainda.
                  </p>
                ) : (
                  day.exercises.map((ex, eIdx) => (
                    <div
                      key={eIdx}
                      className="bg-gray-950 border border-gray-800/80 p-4 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px] flex items-center justify-center">
                            {eIdx + 1}
                          </span>
                          <span className="font-bold text-sm text-gray-200">{ex.exerciseName}</span>
                          <span className="text-[10px] text-gray-400 px-2 py-0.5 rounded bg-gray-900 border border-gray-800">
                            {MUSCLE_GROUP_LABELS[ex.muscle] || ex.muscle}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeExerciseFromDay(dIdx, eIdx)}
                          className="text-gray-500 hover:text-red-400 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Configuração de Séries, Repetições e Descanso */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                            Séries
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={ex.sets}
                            onChange={(e) =>
                              updateExerciseField(dIdx, eIdx, 'sets', Number(e.target.value))
                            }
                            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                            Reps Mínimas
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={ex.repsMin}
                            onChange={(e) =>
                              updateExerciseField(dIdx, eIdx, 'repsMin', Number(e.target.value))
                            }
                            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                            Reps Máximas
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={ex.repsMax}
                            onChange={(e) =>
                              updateExerciseField(dIdx, eIdx, 'repsMax', Number(e.target.value))
                            }
                            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            Descanso (s)
                          </label>
                          <input
                            type="number"
                            step={15}
                            min={0}
                            value={ex.restSeconds}
                            onChange={(e) =>
                              updateExerciseField(dIdx, eIdx, 'restSeconds', Number(e.target.value))
                            }
                            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-amber-400 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <button
                  type="button"
                  onClick={() => setActiveDayIndex(dIdx)}
                  className="w-full py-2.5 bg-gray-950 hover:bg-gray-800/80 border border-dashed border-gray-800 text-amber-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Exercício ao {day.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </form>

      {/* Modal de Seleção de Exercício */}
      {activeDayIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-gray-800 w-full max-w-xl rounded-3xl p-6 space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-extrabold text-base text-gray-100">
                Selecione o Exercício para o Dia
              </h3>
              <button
                onClick={() => setActiveDayIndex(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                placeholder="Buscar por nome do exercício..."
                className="w-full pl-9 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {exerciseList.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => addExerciseToDay(ex)}
                  className="p-3 bg-gray-900/60 hover:bg-gray-900 border border-gray-800 hover:border-amber-500/40 rounded-xl cursor-pointer flex items-center justify-between transition-all group"
                >
                  <div>
                    <p className="font-bold text-xs text-gray-200 group-hover:text-amber-400">
                      {ex.name}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {MUSCLE_GROUP_LABELS[ex.primaryMuscle]} • {ex.equipment}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
