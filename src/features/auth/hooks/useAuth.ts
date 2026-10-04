'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/http';
import type { components } from '@/types/api.generated';

export type UserDto = components['schemas']['UserResponseDto'];
export type RegisterInput = components['schemas']['RegisterDto'];
export type LoginInput = components['schemas']['LoginDto'];

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery<UserDto>({
    queryKey: ['me'],
    queryFn: () => apiFetch<UserDto>('/api/users/me'),
    retry: false,
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) =>
      apiFetch<components['schemas']['AuthResponseDto']>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data.user);
      router.push('/dashboard');
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) =>
      apiFetch<components['schemas']['AuthResponseDto']>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data.user);
      router.push('/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () =>
      apiFetch<void>('/api/auth/logout', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.clear();
      router.push('/login');
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    isError,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error as ApiError | null,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error as ApiError | null,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    refetchUser: refetch,
  };
}
