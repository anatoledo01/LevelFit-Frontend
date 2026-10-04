'use client';

import { useState } from 'react';
import Link from 'next/link';
import { http } from '@/lib/http';
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      await http.post('/auth/forgot-password', { email });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao solicitar redefinição de senha.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-100">Recuperação de Senha</h1>
          <p className="text-sm text-gray-400">
            Digite seu e-mail cadastrado para receber o link de redefinição
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-gray-900/80 border border-gray-800 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-100">E-mail Enviado com Sucesso!</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Enviamos uma mensagem para <strong className="text-amber-400">{email}</strong> via Brevo com as instruções para definir sua nova senha. Verifique também sua caixa de spam.
              </p>

              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-xl text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar para o Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Seu E-mail Cadastrado
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
                  />
                  <Mail className="w-5 h-5 text-gray-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando e-mail...
                  </>
                ) : (
                  'ENVIAR E-MAIL DE REDEFINIÇÃO'
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs text-gray-400 hover:text-gray-200 inline-flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
