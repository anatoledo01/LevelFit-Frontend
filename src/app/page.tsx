import Link from 'next/link';
import { Dumbbell, Shield, Trophy, Flame, Zap, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-gray-800/80 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20">
              ⚡
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              Level<span className="gold-gradient-text">Fit</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-black rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              Criar Conta
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs sm:text-sm font-medium mb-6">
            <Flame className="w-4 h-4 text-orange-400" />
            Treine na vida real, evolua como em um RPG
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            Transforme seu esforço na academia em{' '}
            <span className="gold-gradient-text">Níveis, XP e Conquistas</span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            O LevelFit une o melhor da musculação com gamificação de alta performance. Execute seus treinos, supere recordes de carga, cumpra missões diárias e suba de nível.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-2xl shadow-xl shadow-amber-500/25 transition-all text-base flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-current" />
              Começar Minha Jornada
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-200 font-semibold rounded-2xl transition-all text-base"
            >
              Já possuo conta
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-t border-gray-800/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl space-y-3 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-100">Biblioteca & Fichas</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Escolha fichas prontas de hipertrofia ou condicionamento, personalize treinos existentes ou crie sua própria ficha do zero.
              </p>
            </div>

            <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl space-y-3 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-100">Sequência & XP</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Cada série concluída e cada treino finalizado rende XP. Mantenha sua sequência ativa e desbloqueie bônus de moedas.
              </p>
            </div>

            <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl space-y-3 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-100">Missões & Conquistas</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Complete missões diárias e semanais, bata recordes pessoais de carga e conquiste títulos lendários no seu perfil.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 py-8 bg-[#080b12]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} LevelFit. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="text-amber-500/80 font-medium">Desenvolvido por Ana Toledo</span>
            <span className="hidden sm:inline">•</span>
            <span>Self-service • Treino + RPG</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
