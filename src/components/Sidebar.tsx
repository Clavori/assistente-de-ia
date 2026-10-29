'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  BookOpen, 
  Blocks, 
  Radio, 
  Terminal, 
  MessageSquare, 
  Activity, 
  Settings,
  LogOut,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import NextLink from 'next/link';

const NAV_ITEMS = [
  { name: 'Resumo', href: '/', icon: LayoutDashboard },
  { name: 'Comportamento', href: '/comportamiento', icon: BrainCircuit },
  { name: 'Conhecimento', href: '/conocimiento', icon: BookOpen },
  { name: 'Integrações', href: '/integraciones', icon: Blocks, badge: '6' },
  { name: 'Canais', href: '/canales', icon: Radio },
  { name: 'Testar IA', href: '/probar', icon: Terminal, highlight: true },
  { name: 'Conversas', href: '/conversaciones', icon: MessageSquare, badge: '3' },
  { name: 'Atividade', href: '/actividad', icon: Activity },
  { name: 'Configurações', href: '/ajustes', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [businessName, setBusinessName] = useState('AndradeStudio');

  useEffect(() => {
    fetch('/api/business')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.business?.name) {
          setBusinessName(data.business.name);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-[#09090f]/95 backdrop-blur-xl border-r border-white/[0.08] flex flex-col justify-between shrink-0 select-none">
      <div className="flex flex-col flex-1 min-h-0">
        
        {/* Header / AndradeStudio Brand */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-white/[0.08]">
          <NextLink href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 shadow-[0_0_22px_rgba(242,13,22,0.45)] group-hover:shadow-[0_0_28px_rgba(242,13,22,0.7)] transition-all shrink-0 bg-[#050508]">
              <img
                src="/assets/logo.png"
                alt="Logo AndradeStudio"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-sm tracking-wide text-white">
                  AndradeStudio
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#f20d16]/20 text-[#ff4b52] border border-[#f20d16]/40">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-[#9ba0b0] font-medium tracking-wide">
                Plataforma de Atendimento
              </span>
            </div>
          </NextLink>
        </div>

        {/* Active Workspace Pill */}
        <div className="px-3.5 pt-3.5">
          <div className="p-2.5 rounded-xl bg-[#12121c] border border-white/[0.08] flex items-center gap-2.5 shadow-inner">
            <div className="w-7 h-7 rounded-lg bg-[#f20d16]/15 border border-[#f20d16]/30 flex items-center justify-center text-[#ff4b52]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[9px] uppercase font-bold text-[#9ba0b0] tracking-widest">
                Operação Ativa
              </span>
              <span className="text-xs font-semibold text-white truncate">
                {businessName}
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <NextLink
                key={item.href}
                href={item.href}
                className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#f20d16] to-[#b90710] text-white font-semibold shadow-[0_8px_22px_rgba(242,13,22,0.32)] border border-white/15'
                    : item.highlight
                    ? 'bg-[#f20d16]/10 text-[#ff6b70] hover:bg-[#f20d16]/20 border border-[#f20d16]/30 font-semibold'
                    : 'text-[#9ba0b0] hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-[#ff4b52]'
                        : 'text-[#8b90a0]'
                    }`}
                  />
                  <span className="tracking-wide">{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      isActive
                        ? 'bg-black/30 text-white'
                        : 'bg-white/[0.06] text-[#c4c8d4] border border-white/[0.08]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#f20d16]/25 text-[#ff8589]">
                    Sandbox
                  </span>
                )}
              </NextLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Website Link & User info */}
      <div className="p-3.5 border-t border-white/[0.08] space-y-2.5">
        <a
          href="https://andrade-studio.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] text-[11px] text-[#9ba0b0] hover:text-white transition-all"
        >
          <span>Site Oficial AndradeStudio</span>
          <ExternalLink className="w-3 h-3 text-[#f20d16]" />
        </a>

        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#12121c] border border-white/[0.08]">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs font-semibold text-white truncate">Eduardo • Admin</span>
            <span className="text-[10px] text-[#8b90a0] truncate">admin@atiende.local</span>
          </div>
          <button
            onClick={handleLogout}
            title="Sair da conta"
            className="text-[#8b90a0] hover:text-[#ff4b52] transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
