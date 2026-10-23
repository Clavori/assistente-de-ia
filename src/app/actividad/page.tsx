'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  Calendar,
  Mail,
  FileSpreadsheet,
  MessageSquare,
  CreditCard,
  Bot,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
  Smartphone,
  Globe,
  Cpu
} from 'lucide-react';

interface ActivityItem {
  id: string;
  channel: string;
  integration: string | null;
  action: string;
  details: any;
  result: 'success' | 'error';
  createdAt: string;
}

export default function AtividadePage() {
  const [logs, setLogs] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [integrationFilter, setIntegrationFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/activity?integration=${integrationFilter}&result=${resultFilter}`
      );
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Erro ao buscar logs de atividade:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [integrationFilter, resultFilter]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getIntegrationBadge = (provider: string | null) => {
    switch (provider) {
      case 'google_calendar':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Calendar className="w-3 h-3 text-blue-600" />
            Calendar
          </span>
        );
      case 'gmail':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
            <Mail className="w-3 h-3 text-red-600" />
            Gmail
          </span>
        );
      case 'google_sheets':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
            Sheets
          </span>
        );
      case 'slack':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200">
            <MessageSquare className="w-3 h-3 text-pink-600" />
            Slack
          </span>
        );
      case 'stripe':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CreditCard className="w-3 h-3 text-indigo-600" />
            Stripe
          </span>
        );
      case 'openrouter':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Cpu className="w-3 h-3 text-amber-600" />
            OpenRouter
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Bot className="w-3 h-3 text-slate-600" />
            Sistema
          </span>
        );
    }
  };

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
            <Smartphone className="w-3.5 h-3.5" />
            WhatsApp
          </span>
        );
      case 'web':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700">
            <Globe className="w-3.5 h-3.5" />
            Chat Web
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
            <Cpu className="w-3.5 h-3.5" />
            Interno
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Registro de Atividades
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {logs.length} eventos auditados
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Auditoria em tempo real de cada ferramenta executada pelo assistente de IA, agendamentos, chamadas de modelo e sincronizações externas.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Integration Dropdown */}
          <select
            value={integrationFilter}
            onChange={(e) => setIntegrationFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-xl shadow-sm outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">Todas as Integrações</option>
            <option value="google_calendar">Google Calendar</option>
            <option value="gmail">Gmail</option>
            <option value="google_sheets">Google Sheets</option>
            <option value="slack">Slack</option>
            <option value="stripe">Stripe</option>
            <option value="openrouter">OpenRouter IA</option>
            <option value="system">Sistema Interno</option>
          </select>

          {/* Result Dropdown */}
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-xl shadow-sm outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">Todos os Resultados</option>
            <option value="success">Apenas Sucessos</option>
            <option value="error">Apenas Erros / Falhas</option>
          </select>

          <button
            onClick={fetchLogs}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl shadow-sm transition"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Data e Hora</th>
                <th className="py-3.5 px-4">Canal</th>
                <th className="py-3.5 px-4">Integração</th>
                <th className="py-3.5 px-4">Ação Executada</th>
                <th className="py-3.5 px-4">Resultado</th>
                <th className="py-3.5 px-4 text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedRows[log.id] ?? false;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getChannelBadge(log.channel)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getIntegrationBadge(log.integration)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 font-mono">
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.result === 'success' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Sucesso
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Falha / Erro
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => toggleRow(log.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 transition"
                        >
                          <span>{isExpanded ? 'Ocultar JSON' : 'Ver Detalhes'}</span>
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 text-left bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] max-w-lg ml-auto border border-slate-800 overflow-x-auto">
                            <pre>{JSON.stringify(log.details, null, 2)}</pre>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
