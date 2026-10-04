'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { GOAL_LABELS } from '@/lib/labels';
import { http } from '@/lib/http';
import { components } from '@/types/api.generated';
import { CustomSelect } from '@/components/ui/CustomSelect';
import {
  User,
  Camera,
  Target,
  Sparkles,
  Save,
  CheckCircle2,
  Loader2,
  Globe,
  Award,
  Zap,
  Upload,
  Trash2,
  ImagePlus,
} from 'lucide-react';

type GoalEnum = components['schemas']['UserResponseDto']['goal'];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
];

export default function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [goal, setGoal] = useState<GoalEnum>('HYPERTROPHY');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarUrl(user.avatarUrl || '');
      setBio(user.bio || '');
      setGoal(user.goal || 'HYPERTROPHY');
      setTimezone(user.timezone || 'America/Sao_Paulo');
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      avatarUrl?: string;
      bio?: string;
      goal: GoalEnum;
      timezone: string;
    }) => {
      const res = await http.put<components['schemas']['UserResponseDto']>('/users/me', payload);
      return res.data;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['me'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao atualizar o perfil');
    },
  });

  if (!user) return null;

  const stats = user.stats || { xp: 0, level: 1, coins: 0 };
  const goalOptions = Object.entries(GOAL_LABELS).map(([key, label]) => ({
    value: key,
    label,
  }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      name,
      avatarUrl: avatarUrl.trim() || undefined,
      bio: bio.trim() || undefined,
      goal,
      timezone,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-100 flex items-center gap-2">
          <User className="w-7 h-7 text-amber-400" />
          Personalizar Perfil
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Personalize seu nome de atleta, foto de perfil e descrição pública do seu personagem RPG
        </p>
      </div>

      {/* Success Toast Banner */}
      {showSuccessToast && (
        <div className="bg-emerald-500 text-slate-950 p-4 rounded-2xl font-black text-sm shadow-xl flex items-center gap-3 animate-in zoom-in-95 duration-200">
          <CheckCircle2 className="w-5 h-5 stroke-[3]" />
          <span>Perfil atualizado com sucesso! Suas alterações já estão salvas.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Live RPG Profile Card Preview */}
        <div className="lg:col-span-5 bg-gradient-to-b from-gray-900 via-[#131b2e] to-gray-900 border border-gray-800 p-6 rounded-3xl shadow-xl space-y-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Avatar Circle */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-1.5 shadow-xl shadow-amber-500/20 mb-4 relative group">
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover rounded-[18px]"
                />
              ) : (
                <div className="w-full h-full bg-gray-950 rounded-[18px] flex items-center justify-center text-amber-400 font-black text-4xl">
                  {name.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 fill-current" /> Nível {stats.level}
            </div>

            <h2 className="text-xl font-black text-gray-100">{name || 'Nome do Atleta'}</h2>
            <p className="text-xs text-amber-400 font-bold mt-0.5">
              {GOAL_LABELS[goal] || goal}
            </p>

            {/* Bio Preview */}
            <p className="text-xs text-gray-400 mt-3 italic px-4 leading-relaxed bg-gray-950/60 py-2.5 rounded-2xl border border-gray-800/80 w-full">
              &quot;{bio || 'Sem descrição cadastrada ainda...'}&quot;
            </p>
          </div>

          <div className="pt-4 border-t border-gray-800 flex justify-around text-xs font-bold text-gray-400">
            <div>
              <div className="text-gray-500 font-medium">Experiência</div>
              <div className="text-amber-300 font-black">{stats.xp.toLocaleString()} XP</div>
            </div>
            <div className="w-px bg-gray-800" />
            <div>
              <div className="text-gray-500 font-medium">Moedas</div>
              <div className="text-emerald-400 font-black">{stats.coins} 🪙</div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="lg:col-span-7 bg-gray-900/80 border border-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Nome do Atleta / Personagem
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome no jogo"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 focus:border-amber-500 rounded-xl text-gray-100 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            {/* Descrição / Bio */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Descrição do Atleta (Bio RPG)
              </label>
              <textarea
                rows={3}
                maxLength={200}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Escreva uma frase sobre seu objetivo ou lema de treino..."
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 focus:border-amber-500 rounded-xl text-gray-100 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all resize-none"
              />
              <div className="text-[10px] text-gray-500 text-right mt-1">
                {bio.length} / 200 caracteres
              </div>
            </div>

            {/* Foto de Perfil */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-400" />
                  Foto de Perfil
                </span>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Remover foto
                  </button>
                )}
              </label>

              {/* Botão Principal de Upload de Foto do Celular / Computador */}
              <div className="mb-4">
                <label className="relative flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-600/20 border-2 border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer group shadow-lg shadow-amber-500/10">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black group-hover:scale-110 transition-transform shrink-0">
                    <Upload className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-black text-amber-300 uppercase tracking-wider group-hover:text-amber-200 transition-colors">
                      📁 Escolher Foto do seu Celular / Computador
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Clique aqui para selecionar qualquer imagem (PNG, JPG, WebP)
                    </p>
                  </div>
                </label>
              </div>

              {/* Presets RPG */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Ou escolha um Avatar RPG pronto:
                </span>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {AVATAR_PRESETS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        avatarUrl === url
                          ? 'border-amber-400 ring-2 ring-amber-500/30 scale-105'
                          : 'border-gray-800 hover:border-gray-600 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Ou URL customizada */}
              <div className="mt-3">
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Ou cole a URL direta de uma imagem externa..."
                  className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 focus:border-amber-500 rounded-xl text-gray-100 text-xs focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Objetivo Principal */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                Objetivo Principal
              </label>
              <CustomSelect
                options={goalOptions}
                value={goal}
                onChange={(val) => setGoal(val as GoalEnum)}
                placeholder="Selecione seu objetivo"
              />
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-400" />
                Fuso Horário (Timezone IANA)
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Ex.: America/Sao_Paulo"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 focus:border-amber-500 rounded-xl text-gray-100 text-sm font-medium focus:outline-none transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  SALVAR ALTERAÇÕES
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
