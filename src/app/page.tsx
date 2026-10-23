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
  Bot,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function ResumoPage() {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(true);
  const [businessName, setBusinessName] = useState('Andrade Studio AI');
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
          setBusinessName(resBiz.business.name || 'Andrade Studio AI');
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
      <div className="flex-1 p-8 flex items-center justify-center text-slate-400 text-sm">
        Carregando resumo geral...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Top Banner: Master Switch */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Painel de Controle — {businessName}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Resumo de Atividades
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Acompanhe em tempo real o assistente de IA, canais integrados e atendimentos.
          </p>
        </div>

        {/* Master Switch Box */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60 shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-slate-900">
              {active ? 'Assistente Ligado' : 'Assistente em Pausa'}
            </span>
            <span className="text-[11px] text-slate-500">
              {active ? 'Respondendo WhatsApp e Web' : 'Mensagens em espera'}
            </span>
          </div>

          <button
            onClick={toggleAssistantPower}
            type="button"
            className={`w-14 h-8 rounded-full transition-colors relative p-1 shadow-inner ${
              active ? 'bg-slate-900' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform shadow-sm ${
                active ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Conversas Hoje</span>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">{stats.conversationsToday}</span>
            <span className="text-xs text-slate-400 font-medium">Semana: {stats.conversationsWeek}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Agendamentos Criados</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-emerald-600">{stats.appointmentsCreated}</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              Google Calendar
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Aguardando Humano</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-rose-600">{stats.waitingHuman}</span>
            <span className="text-xs text-slate-400 font-medium">Transbordo</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Tempo Médio Resposta</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">{stats.avgResponseTime}</span>
            <span className="text-xs text-slate-400 font-medium">OpenRouter IA</span>
          </div>
        </div>
      </div>

      {/* Channels Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp Channel Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Canal WhatsApp</h3>
                <p className="text-xs text-slate-500">Conexão oficial Baileys com QR Code</p>
              </div>
            </div>

            {waStatus === 'connected' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Conectado {waPhone ? `(+${waPhone})` : ''}
              </span>
            ) : waStatus === 'waiting_qr' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Aguardando QR Code
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Desconectado
              </span>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link
              href="/canales"
              className="text-xs font-semibold text-slate-900 hover:underline flex items-center gap-1"
            >
              <span>Gerenciar conexão e QR Code</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Web Chat Channel Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Chat para Web</h3>
                <p className="text-xs text-slate-500">Burbulha de atendimento em seu site</p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Widget Ativo
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link
              href="/demo"
              target="_blank"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Testar demonstração ao vivo (/demo)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Actions Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Últimas Ações do Assistente</h3>
          </div>
          <Link
            href="/actividad"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <span>Ver auditoria completa</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActions.map((action, i) => (
            <div key={i} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <span className="font-semibold text-slate-800 font-mono">{action.action}</span>
                  <span className="text-slate-400 text-[11px] ml-2">
                    via {action.integration || action.channel}
                  </span>
                </div>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                {new Date(action.createdAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
