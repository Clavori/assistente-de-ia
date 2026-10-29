'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  CalendarCheck,
  AlertCircle,
  Clock,
  Activity,
  CheckCircle2,
  ArrowUpRight,
  Smartphone,
  Globe,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function ResumoPage() {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(true);
  const [businessName, setBusinessName] = useState('AndradeStudio');
  const [toast, setToast] = useState('');
  const [stats, setStats] = useState({
    conversationsToday: 12,
    conversationsWeek: 48,
    appointmentsCreated: 7,
    waitingHuman: 1,
    avgResponseTime: '1.2s'
  });
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [waStatus, setWaStatus] = useState('disconnected');
  const [waPhone, setWaPhone] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [resAssistant, resBiz, resStats] = await Promise.all([
          fetch('/api/assistant').then((r) => r.json()),
          fetch('/api/business').then((r) => r.json()),
          fetch('/api/stats').then((r) => r.json())
        ]);

        if (resAssistant.assistant) {
          setActive(resAssistant.assistant.active !== false);
        }
        if (resBiz.business) {
          setBusinessName(resBiz.business.name || 'AndradeStudio');
        }
        if (resStats.stats) {
          setStats(resStats.stats);
          setRecentActions(resStats.recentActions || []);
          setWaStatus(resStats.whatsappStatus || 'disconnected');
          setWaPhone(resStats.whatsappPhone || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleAssistantPower = async () => {
    const nextState = !active;
    setActive(nextState);
    try {
      await fetch('/api/assistant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextState })
      });
      setToast(
        nextState
          ? 'Assistente ativado e respondendo nos canais'
          : 'Assistente pausado temporariamente'
      );
      setTimeout(() => setToast(''), 3000);
    } catch {
      setActive(!nextState);
      alert('Erro ao alterar estado do assistente');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-[#9ba0b0] text-sm">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f20d16] animate-ping" />
          <span>Carregando painel executivo AndradeStudio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Top Banner: Master Switch */}
      <div className="relative overflow-hidden bg-[#0d0d14]/90 backdrop-blur-xl p-6 rounded-2xl border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.55)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#f20d16]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#f20d16] shadow-[0_0_10px_#f20d16] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff4b52]">
              Cockpit de Comando — {businessName}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Resumo Operacional de IA
          </h1>
          <p className="text-sm text-[#9ba0b0] mt-1">
            Acompanhe em tempo real o assistente inteligente, canais conectados e conversões.
          </p>
        </div>

        {/* Master Switch Box */}
        <div className="relative z-10 flex items-center gap-4 p-4 rounded-xl bg-[#13131f] border border-white/[0.09] shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
              {active && <Sparkles className="w-3.5 h-3.5 text-[#ff4b52]" />}
              {active ? 'Assistente IA Ativo' : 'Assistente em Pausa'}
            </span>
            <span className="text-[11px] text-[#9ba0b0]">
              {active ? 'Respondendo WhatsApp e Web 24/7' : 'Mensagens em espera'}
            </span>
          </div>

          <button
            onClick={toggleAssistantPower}
            type="button"
            className={`w-14 h-8 rounded-full transition-all relative p-1 ${
              active
                ? 'bg-gradient-to-r from-[#f20d16] to-[#b90710] shadow-[0_0_20px_rgba(242,13,22,0.5)]'
                : 'bg-[#262636]'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md ${
                active ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0d0d14]/90 border border-white/[0.08] hover:border-white/[0.16] transition-all space-y-3">
          <div className="flex items-center justify-between text-[#9ba0b0]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Conversas Hoje</span>
            <MessageSquare className="w-4 h-4 text-[#ff4b52]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-display">{stats.conversationsToday}</span>
            <span className="text-xs text-[#9ba0b0] font-medium">Semana: {stats.conversationsWeek}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d0d14]/90 border border-white/[0.08] hover:border-white/[0.16] transition-all space-y-3">
          <div className="flex items-center justify-between text-[#9ba0b0]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Reuniões Agendadas</span>
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-400 font-display">{stats.appointmentsCreated}</span>
            <span className="text-[11px] text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full font-semibold">
              Google Calendar
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d0d14]/90 border border-white/[0.08] hover:border-white/[0.16] transition-all space-y-3">
          <div className="flex items-center justify-between text-[#9ba0b0]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Aguardando Humano</span>
            <AlertCircle className="w-4 h-4 text-[#f20d16]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#ff4b52] font-display">{stats.waitingHuman}</span>
            <span className="text-[11px] text-[#ff6b70] bg-[#f20d16]/15 border border-[#f20d16]/30 px-2 py-0.5 rounded-full font-semibold">
              Transbordo
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d0d14]/90 border border-white/[0.08] hover:border-white/[0.16] transition-all space-y-3">
          <div className="flex items-center justify-between text-[#9ba0b0]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tempo de Resposta</span>
            <Clock className="w-4 h-4 text-[#9ba0b0]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-display">{stats.avgResponseTime}</span>
            <span className="text-xs text-[#9ba0b0] font-medium">Andrade AI Core</span>
          </div>
        </div>
      </div>

      {/* Channels Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp Channel Card */}
        <div className="p-6 rounded-2xl bg-[#0d0d14]/90 border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-display">Canal WhatsApp</h3>
                <p className="text-xs text-[#9ba0b0]">Conexão oficial Baileys com QR Code</p>
              </div>
            </div>

            {waStatus === 'connected' ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Conectado {waPhone ? `(+${waPhone})` : ''}
              </span>
            ) : waStatus === 'waiting_qr' ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                QR Code Pronto
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/[0.06] text-[#9ba0b0] border border-white/[0.1]">
                Desconectado
              </span>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
            <Link
              href="/canales"
              className="text-xs font-semibold text-[#ff4b52] hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Gerenciar conexão e QR Code</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Web Chat Channel Card */}
        <div className="p-6 rounded-2xl bg-[#0d0d14]/90 border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#f20d16]/15 border border-[#f20d16]/30 text-[#ff4b52] flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-display">Widget Chat Web</h3>
                <p className="text-xs text-[#9ba0b0]">Bolha de atendimento integrada ao site</p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Widget Ativo
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
            <Link
              href="/demo"
              target="_blank"
              className="text-xs font-semibold text-[#ff4b52] hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Testar demonstração ao vivo (/demo)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Actions Feed */}
      <div className="bg-[#0d0d14]/90 rounded-2xl border border-white/[0.08] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#f20d16]" />
            <h3 className="text-sm font-bold text-white font-display">Últimas Ações do Assistente</h3>
          </div>
          <Link
            href="/actividad"
            className="text-xs font-semibold text-[#9ba0b0] hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Ver auditoria completa</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {recentActions.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#8b90a0]">
              Nenhuma ação recente registrada ainda. Faça um teste na aba <strong>Testar IA</strong>!
            </div>
          ) : (
            recentActions.map((action, i) => (
              <div key={i} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#f20d16] shadow-[0_0_8px_#f20d16]" />
                  <div>
                    <span className="font-semibold text-white font-mono">{action.action}</span>
                    <span className="text-[#9ba0b0] text-[11px] ml-2">
                      via {action.integration || action.channel}
                    </span>
                  </div>
                </div>
                <span className="text-[#9ba0b0] font-mono text-[11px]">
                  {new Date(action.createdAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
