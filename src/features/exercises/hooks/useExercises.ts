'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/http';
import type { components } from '@/types/api.generated';

export type ExerciseDto = components['schemas']['ExerciseResponseDto'];

export interface UseExercisesParams {
  muscle?: string;
  equipment?: string;
  difficulty?: string;
  q?: string;
}

export function useExercises(params: UseExercisesParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.muscle) queryParams.set('muscle', params.muscle);
  if (params.equipment) queryParams.set('equipment', params.equipment);
  if (params.difficulty) queryParams.set('difficulty', params.difficulty);
  if (params.q) queryParams.set('q', params.q);

  const queryString = queryParams.toString();
  const url = `/api/exercises${queryString ? `?${queryString}` : ''}`;

  const { data: exercises = [], isLoading, error, refetch } = useQuery<ExerciseDto[]>({
    queryKey: ['exercises', params],
    queryFn: () => apiFetch<ExerciseDto[]>(url),
  });

  return {
    exercises,
    isLoading,
    error,
    refetch,
  };
}

export function useExercise(id: string | null) {
  return useQuery<ExerciseDto>({
    queryKey: ['exercise', id],
    queryFn: () => apiFetch<ExerciseDto>(`/api/exercises/${id}`),
    enabled: !!id,
  });
}
