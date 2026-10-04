'use client';

import { useState } from 'react';
import { useExercises, ExerciseDto } from '@/features/exercises/hooks/useExercises';
import {
  MUSCLE_GROUP_LABELS,
  EQUIPMENT_LABELS,
  DIFFICULTY_LABELS,
} from '@/lib/labels';
import {
  Search,
  Dumbbell,
  Filter,
  X,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Info,
  Layers,
} from 'lucide-react';

export default function ExercisesPage() {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [activeExercise, setActiveExercise] = useState<ExerciseDto | null>(null);

  const { exercises, isLoading } = useExercises({
    q: search || undefined,
    muscle: selectedMuscle || undefined,
    equipment: selectedEquipment || undefined,
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-100 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-amber-400" />
            Biblioteca de Exercícios
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Explore execuções detalhadas, grupos musculares e equipamentos
          </p>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-gray-900/80 border border-gray-800 p-4 rounded-2xl space-y-4">
        {/* Input de Busca */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome do exercício (ex.: Supino, Agachamento, Tríceps)..."
            className="w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtros em Chips */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs">
          {/* Grupo Muscular Select */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 focus:outline-none focus:border-amber-500 text-xs"
            >
              <option value="">Todos os Grupos Musculares</option>
              {Object.entries(MUSCLE_GROUP_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Equipamento Select */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-200 focus:outline-none focus:border-amber-500 text-xs"
            >
              <option value="">Todos os Equipamentos</option>
              {Object.entries(EQUIPMENT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {(selectedMuscle || selectedEquipment || search) && (
            <button
              onClick={() => {
                setSelectedMuscle('');
                setSelectedEquipment('');
                setSearch('');
              }}
              className="text-amber-400 hover:underline font-semibold text-xs ml-auto"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid de Exercícios */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-gray-900/50 border border-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/40 border border-gray-800/80 rounded-2xl space-y-3">
          <Dumbbell className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-gray-300">Nenhum exercício encontrado</h3>
          <p className="text-xs text-gray-500">Tente ajustar seus termos de busca ou filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              onClick={() => setActiveExercise(ex)}
              className="bg-gray-900/70 hover:bg-gray-900 border border-gray-800 hover:border-amber-500/40 p-5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {MUSCLE_GROUP_LABELS[ex.primaryMuscle] || ex.primaryMuscle}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase px-2 py-0.5 rounded bg-gray-800">
                    {DIFFICULTY_LABELS[ex.difficulty] || ex.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-gray-100 group-hover:text-amber-400 transition-colors">
                  {ex.name}
                </h3>

                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {ex.description}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1 font-medium">
                  <Dumbbell className="w-3.5 h-3.5 text-gray-500" />
                  {EQUIPMENT_LABELS[ex.equipment] || ex.equipment}
                </span>

                <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Ver Execução
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes da Execução */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-gray-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveExercise(null)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white rounded-xl bg-gray-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {MUSCLE_GROUP_LABELS[activeExercise.primaryMuscle]}
                </span>
                <span className="text-xs font-semibold text-gray-400 uppercase px-2 py-0.5 rounded bg-gray-800">
                  {EQUIPMENT_LABELS[activeExercise.equipment]}
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-100">{activeExercise.name}</h2>
              <p className="text-xs text-gray-300 leading-relaxed">{activeExercise.description}</p>
            </div>

            {/* Músculos Secundários */}
            {activeExercise.secondaryMuscles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Músculos Auxiliares / Secundários
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeExercise.secondaryMuscles.map((m) => (
                    <span
                      key={m}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-800/80 text-gray-300 border border-gray-700/50"
                    >
                      {MUSCLE_GROUP_LABELS[m] || m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Instruções de Passo a Passo */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                Instruções de Execução Correta
              </h4>
              <div className="space-y-2.5">
                {activeExercise.instructions.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-gray-200 leading-relaxed mt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Botão Fechar */}
            <button
              onClick={() => setActiveExercise(null)}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
