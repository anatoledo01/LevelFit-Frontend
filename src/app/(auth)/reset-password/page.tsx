'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { http } from '@/lib/http';
import { KeyRound, CheckCircle2, Loader2, Lock } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMessage('Token de redefinição ausente na URL.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await http.post('/auth/reset-password', {
        token,
        newPassword,
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao redefinir a senha. O token pode ter expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-100">Senha Alterada com Sucesso!</h3>
        <p className="text-xs text-gray-400">
          Sua nova senha foi gravada no sistema. Redirecionando para a página de login...
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="py-2.5 px-6 bg-amber-500 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider inline-block shadow-lg shadow-amber-500/20"
          >
            Ir para Login Agora
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Nova Senha
        </label>
        <div className="relative">
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="No mínimo 6 caracteres"
            className="w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
          />
          <Lock className="w-5 h-5 text-gray-500 absolute left-3.5 top-3.5" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Confirmar Nova Senha
        </label>
        <div className="relative">
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita a nova senha"
            className="w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
          />
          <KeyRound className="w-5 h-5 text-gray-500 absolute left-3.5 top-3.5" />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !token}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Salvando nova senha...
          </>
        ) : (
          'SALVAR NOVA SENHA'
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/20">
              ⚡
            </div>
            <span className="font-black text-2xl tracking-tight text-white">
              Level<span className="gold-gradient-text">Fit</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-100">Criar Nova Senha</h1>
          <p className="text-sm text-gray-400">Escolha uma nova senha forte para acessar sua conta</p>
        </div>

        {/* Card Form */}
        <div className="bg-gray-900/80 border border-gray-800 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
          <Suspense fallback={<div className="text-center py-8 text-gray-400">Carregando...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
