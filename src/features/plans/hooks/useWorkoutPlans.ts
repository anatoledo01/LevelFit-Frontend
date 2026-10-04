'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/http';
import type { components } from '@/types/api.generated';

export type WorkoutPlanDto = components['schemas']['WorkoutPlanResponseDto'];
export type CreateWorkoutPlanInput = components['schemas']['CreateWorkoutPlanDto'];

export function useWorkoutPlans(scope: 'templates' | 'mine' = 'templates') {
  return useQuery<WorkoutPlanDto[]>({
    queryKey: ['workout-plans', scope],
    queryFn: () => apiFetch<WorkoutPlanDto[]>(`/api/workout-plans?scope=${scope}`),
  });
}

export function useWorkoutPlan(id: string | null) {
  return useQuery<WorkoutPlanDto>({
    queryKey: ['workout-plan', id],
    queryFn: () => apiFetch<WorkoutPlanDto>(`/api/workout-plans/${id}`),
    enabled: !!id,
  });
}

export function useClonePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) =>
      apiFetch<WorkoutPlanDto>(`/api/workout-plans/${planId}/clone`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkoutPlanInput) =>
      apiFetch<WorkoutPlanDto>('/api/workout-plans', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateWorkoutPlanInput }) =>
      apiFetch<WorkoutPlanDto>(`/api/workout-plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      queryClient.invalidateQueries({ queryKey: ['workout-plan', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useArchivePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) =>
      apiFetch<void>(`/api/workout-plans/${planId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useActivatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) =>
      apiFetch<void>(`/api/workout-plans/${planId}/activate`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
