'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@atiende.local');
  const [password, setPassword] = useState('AdminPassword2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao entrar na conta');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Erro de conexão com o servidor');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#f20d16]/12 blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="flex justify-center items-center gap-3.5 mb-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-white/20 shadow-[0_0_30px_rgba(242,13,22,0.5)] bg-[#050508]">
            <img
              src="/assets/logo.png"
              alt="Logo AndradeStudio"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-white font-display">
                AndradeStudio
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#f20d16]/20 text-[#ff4b52] border border-[#f20d16]/40">
                AI
              </span>
            </div>
            <p className="text-xs text-[#9ba0b0]">
              Sites, Apps & Automações Inteligentes
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0d0d14]/90 backdrop-blur-2xl py-8 px-6 shadow-[0_32px_100px_rgba(0,0,0,0.75)] border border-white/[0.1] rounded-2xl sm:px-10">
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f20d16]/15 border border-[#f20d16]/30 text-[#ff6b70] text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              Acesso Executivo à Plataforma
            </span>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-xl bg-[#f20d16]/15 border border-[#f20d16]/35 text-xs text-[#ff6b70] font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#c4c8d4] mb-1.5">
                E-mail Corporativo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#13131f] border border-white/[0.12] rounded-xl text-sm text-white placeholder:text-[#63687a] transition-all"
                placeholder="admin@atiende.local"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#c4c8d4] mb-1.5">
                Senha de Acesso
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#13131f] border border-white/[0.12] rounded-xl text-sm text-white placeholder:text-[#63687a] transition-all"
                placeholder="••••••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-andrade w-full py-3 px-4 rounded-xl text-white text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-70 font-display"
              >
                <span>{loading ? 'Autenticando...' : 'Entrar no Cockpit'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#13131f] border border-white/[0.07] text-center">
              <span className="text-[11px] text-[#9ba0b0] block">
                Credenciais de demonstração pré-preenchidas:
              </span>
              <span className="text-[11px] font-mono text-white font-medium">
                admin@atiende.local / AdminPassword2026!
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
