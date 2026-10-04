'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { GOAL_LABELS } from '@/lib/labels';
import { components } from '@/types/api.generated';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { ArrowRight, AlertCircle, Loader2, Target } from 'lucide-react';

type GoalEnum = components['schemas']['RegisterDto']['goal'];

export default function RegisterPage() {
  const { register: registerUser, isRegistering, registerError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [goal, setGoal] = useState<GoalEnum>('HYPERTROPHY');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    try {
      await registerUser({
        name,
        email,
        password,
        goal,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
      });
    } catch {
      // tratado via registerError
    }
  };

  const goalOptions = Object.entries(GOAL_LABELS).map(([key, label]) => ({
    value: key,
    label,
  }));

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/20">
              ⚡
            </div>
            <span className="font-black text-2xl tracking-tight">
              Level<span className="gold-gradient-text">Fit</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-100">Crie seu personagem</h1>
          <p className="text-sm text-gray-400">Escolha seu objetivo e inicie sua evolução de nível</p>
        </div>

        {/* Card Form */}
        <div className="bg-gray-900/80 border border-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
          {registerError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Erro no cadastro</p>
                <p className="text-xs text-red-400/80">{registerError.messages.join(', ')}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Nome do Atleta
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como prefere ser chamado?"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Senha (mínimo 6 caracteres)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                Objetivo Principal
              </label>
              <CustomSelect
                options={goalOptions}
                value={goal}
                onChange={(val) => setGoal(val as GoalEnum)}
                placeholder="Selecione seu objetivo"
              />
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm mt-6"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando personagem...
                </>
              ) : (
                <>
                  Começar Minha Jornada
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-gray-400">
          Já possui uma conta?{' '}
          <Link href="/login" className="font-bold text-amber-400 hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
