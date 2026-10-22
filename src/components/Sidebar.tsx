'use client';

import Link from 'next/navigation';
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
  Building2,
  Sparkles
} from 'lucide-react';
import NextLink from 'next/link';

const NAV_ITEMS = [
  { name: 'Resumen', href: '/', icon: LayoutDashboard },
  { name: 'Comportamiento', href: '/comportamiento', icon: BrainCircuit },
  { name: 'Conocimiento', href: '/conocimiento', icon: BookOpen },
  { name: 'Integraciones', href: '/integraciones', icon: Blocks, badge: '6' },
  { name: 'Canales', href: '/canales', icon: Radio },
  { name: 'Probar', href: '/probar', icon: Terminal, highlight: true },
  { name: 'Conversaciones', href: '/conversaciones', icon: MessageSquare, badge: '2' },
  { name: 'Actividad', href: '/actividad', icon: Activity },
  { name: 'Ajustes', href: '/ajustes', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 select-none">
      <div className="flex flex-col flex-1 min-h-0">
        
        {/* Header / Brand */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              A
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-slate-900">Atiende</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">IA</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Andrade Studio AI
              </span>
            </div>
          </div>
        </div>

        {/* Business Selector Pill */}
        <div className="px-3 pt-3">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Negocio</span>
              <span className="text-xs font-semibold text-slate-800 truncate">Clínica Dental Lumen</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <NextLink
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : item.highlight
                    ? 'bg-amber-50 text-amber-900 hover:bg-amber-100/70 border border-amber-200/60 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-700' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-900">
                    Test
                  </span>
                )}
              </NextLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / User info */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/60">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs font-semibold text-slate-800 truncate">Administrador</span>
            <span className="text-[10px] text-slate-400 truncate">admin@atiende.local</span>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-white"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
