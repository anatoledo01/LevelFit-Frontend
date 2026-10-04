'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Dumbbell,
  BookOpen,
  History,
  LineChart,
  Target,
  LogOut,
  Flame,
  Coins,
  Loader2,
  Menu,
  X,
  User,
  Trophy,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', shortLabel: 'Início', icon: LayoutDashboard },
  { href: '/plans', label: 'Fichas', shortLabel: 'Fichas', icon: Dumbbell },
  { href: '/leaderboard', label: 'Ranking Global', shortLabel: 'Ranking', icon: Trophy },
  { href: '/exercises', label: 'Exercícios', shortLabel: 'Exercícios', icon: BookOpen },
  { href: '/history', label: 'Histórico', shortLabel: 'Histórico', icon: History },
  { href: '/progress', label: 'Evolução', shortLabel: 'Evolução', icon: LineChart },
  { href: '/missions', label: 'Missões', shortLabel: 'Missões', icon: Target },
  { href: '/profile', label: 'Meu Perfil', shortLabel: 'Perfil', icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout, isLoggingOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm font-medium text-gray-400">Carregando dados do personagem...</p>
      </div>
    );
  }

  const stats = user.stats;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col relative overflow-x-hidden">
      {/* Header Topbar */}
      <header className="border-b border-gray-800/80 bg-[#0d1322]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-lg shadow-md shadow-amber-500/20">
              ⚡
            </div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight">
              Level<span className="gold-gradient-text">Fit</span>
            </span>
          </Link>

          {/* User Gamification Stats Header (Compact on mobile) */}
          <div className="flex items-center gap-2 sm:gap-4 bg-gray-900/90 border border-gray-800/80 px-2 sm:px-3 py-1.5 rounded-xl text-xs">
            {/* Level Badge */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase">Nv.</span>
              <span className="text-xs sm:text-sm font-black text-amber-400 bg-amber-500/10 px-1.5 sm:px-2 py-0.5 rounded-lg border border-amber-500/20">
                {stats?.level ?? 1}
              </span>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-1 text-amber-300 font-bold text-xs sm:text-sm">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span>{stats?.coins ?? 0}</span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1 text-orange-400 font-bold text-xs sm:text-sm">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 fill-current" />
              <span>{stats?.currentStreak ?? 0}d</span>
            </div>
          </div>

          {/* User Profile & Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs overflow-hidden">
                {user.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-xs font-semibold text-gray-200 max-w-[120px] truncate">
                {user.name}
              </span>
            </Link>

            <button
              onClick={() => logout()}
              disabled={isLoggingOut}
              title="Encerrar Sessão"
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Hamburger Toggle (Mobile) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Desktop Navigation Tabs Bar */}
        <nav className="hidden md:block border-t border-gray-800/60 bg-[#090d16]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 h-12">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-gray-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-between p-6 animate-in slide-in-from-top duration-200">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <Link href="/profile" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm overflow-hidden">
                  {user.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{user.name}</h3>
                  <p className="text-xs text-amber-400 font-semibold">Editar Perfil &amp; Foto &rarr;</p>
                </div>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Links inside Drawer */}
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'text-gray-300 hover:bg-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-gray-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="w-full py-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400 font-bold text-sm flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Encerrar Sessão
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-28 md:pb-12">
        {children}
      </main>

      {/* Fixed Mobile Bottom Navbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d1322]/95 border-t border-amber-500/20 backdrop-blur-xl py-1.5 px-1 shadow-2xl">
        <div className="grid grid-cols-7 gap-0.5 max-w-md mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-xl text-[9px] font-extrabold transition-all text-center leading-none ${
                  isActive
                    ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400 stroke-[2.5]' : 'text-gray-400'}`} />
                <span className="truncate w-full text-center">{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
