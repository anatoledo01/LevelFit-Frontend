'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
      </div>
      <h1 className="text-2xl font-black text-gray-100 mb-2">Ops! Algo quebrou no aplicativo.</h1>
      <p className="text-gray-400 max-w-md mx-auto mb-6">
        Por favor, tire um print desta tela e envie para análise:
      </p>

      <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl text-left w-full max-w-2xl overflow-auto text-xs font-mono text-red-400 mb-8 space-y-2">
        <p className="font-bold text-red-300">{error.name}: {error.message}</p>
        {error.digest && <p className="text-gray-500">Digest: {error.digest}</p>}
        {error.stack && (
          <pre className="text-gray-500 whitespace-pre-wrap mt-2">{error.stack}</pre>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all"
        >
          Tentar Novamente
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
