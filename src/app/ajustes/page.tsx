'use client';

import { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Cpu, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  Building, 
  Calculator
} from 'lucide-react';

export default function AjustesPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Business / Agency state
  const [agencyName, setAgencyName] = useState('Andrade Studio AI');
  const [timeZone, setTimeZone] = useState('America/Sao_Paulo');

  // AI Key Status
  const [keyStatus, setKeyStatus] = useState<any>({ configured: false, balance: null });

  // OpenRouter Models state
  const [models, setModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-haiku-5.5');
  const [searchFilter, setSearchFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');

  // Cost calculation
  const [inputTokensPerConv, setInputTokensPerConv] = useState(20000);
  const [outputTokensPerConv, setOutputTokensPerConv] = useState(2000);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      const [resBiz, resAssistant, resKey, resModels] = await Promise.all([
        fetch('/api/business').then(r => r.json()),
        fetch('/api/assistant').then(r => r.json()),
        fetch('/api/ai/key-status').then(r => r.json()),
        fetch('/api/ai/models').then(r => r.json())
      ]);

      if (resBiz.business) {
        setAgencyName(resBiz.business.agencyName || 'Andrade Studio AI');
        setTimeZone(resBiz.business.timeZone || 'America/Sao_Paulo');
      }

      if (resAssistant.assistant?.modelSelected) {
        setSelectedModel(resAssistant.assistant.modelSelected);
      }

      if (resKey) {
        setKeyStatus(resKey);
      }

      if (resModels?.models) {
        setModels(resModels.models);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleRefreshModels = async () => {
    setLoadingModels(true);
    try {
      const res = await fetch('/api/ai/models?refresh=true');
      const data = await res.json();
      if (data.models) {
        setModels(data.models);
        setToast('Catálogo de modelos do OpenRouter atualizado!');
        setTimeout(() => setToast(''), 3000);
      }
    } catch {
      alert('Erro ao atualizar catálogo de modelos');
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await Promise.all([
        fetch('/api/business', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agencyName, timeZone })
        }),
        fetch('/api/assistant', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ modelSelected: selectedModel })
        })
      ]);

      setToast('Configurações salvas com sucesso!');
      setTimeout(() => setToast(''), 3000);
    } catch {
      alert('Erro ao salvar configurações');
    }
  };

  const filteredModels = models.filter((m) => {
    const query = searchFilter.toLowerCase();
    const matchesSearch = 
      m.name.toLowerCase().includes(query) ||
      m.id.toLowerCase().includes(query) ||
      m.provider.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (providerFilter === 'Gratis') {
      return m.rawInputPrice === 0;
    } else if (providerFilter !== 'all') {
      return m.provider.toLowerCase() === providerFilter.toLowerCase();
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'recommended') {
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      return a.rawInputPrice - b.rawInputPrice;
    }
    if (sortBy === 'price_asc') {
      return a.rawInputPrice - b.rawInputPrice;
    }
    return a.name.localeCompare(b.name);
  });

  const currentModelObj = models.find((m) => m.id === selectedModel) || {
    rawInputPrice: 0.25,
    rawOutputPrice: 1.25
  };

  const costPer1000Convs = (
    (1000 * inputTokensPerConv * (currentModelObj.rawInputPrice / 1000000)) +
    (1000 * outputTokensPerConv * (currentModelObj.rawOutputPrice / 1000000))
  ).toFixed(2);

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-slate-400 text-sm">
        Carregando configurações do sistema...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configurações do Sistema</h1>
          <p className="text-sm text-slate-500 mt-1">
            Motor de Inteligência Artificial (OpenRouter), marca da agência e fuso horário.
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
        >
          <span>Salvar configurações</span>
        </button>
      </div>

      {toast && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* SEÇÃO 1: Modelo de IA & OpenRouter */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-slate-700" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Modelo de Inteligência Artificial (OpenRouter)
              </h2>
              <span className="text-xs text-slate-400">
                Apenas modelos que suportam chamadas a ferramentas (tools) são listados
              </span>
            </div>
          </div>
          <button
            onClick={handleRefreshModels}
            disabled={loadingModels}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingModels ? 'animate-spin' : ''}`} />
            <span>Atualizar catálogo</span>
          </button>
        </div>

        {/* Estado da chave OpenRouter */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${keyStatus.configured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">API Key OpenRouter</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  keyStatus.configured ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {keyStatus.configured ? 'Configurada no servidor' : 'Não configurada'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                A chave é protegida na variável de ambiente <code className="font-mono text-slate-700">OPENROUTER_API_KEY</code> e nunca é exposta no navegador.
              </span>
            </div>
          </div>

          {keyStatus.balance && (
            <div className="text-right pl-4 border-l border-slate-200 shrink-0">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Saldo disponível</span>
              <span className="text-sm font-bold text-slate-900">{keyStatus.balance}</span>
            </div>
          )}
        </div>

        {/* Buscador e Filtros Rápidos */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filtrar por nome, provedor (anthropic, openai, gemini) ou ID..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="recommended">Recomendados primeiro</option>
              <option value="price_asc">Menor preço</option>
              <option value="name">Ordem alfabética</option>
            </select>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Filtros:</span>
            {[
              { id: 'all', label: 'Todos' },
              { id: 'Gratis', label: 'Gratuito' },
              { id: 'Anthropic', label: 'Anthropic' },
              { id: 'Google', label: 'Google' },
              { id: 'OpenAI', label: 'OpenAI' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setProviderFilter(f.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  providerFilter === f.id
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Modelos (Matrix / Selector) */}
        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
          {filteredModels.map((m) => {
            const isSelected = selectedModel === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full border ${isSelected ? 'bg-amber-400 border-amber-300' : 'bg-slate-200 border-slate-300'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-900'}`}>{m.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                        isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {m.provider}
                      </span>
                      {m.isRecommended && (
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                          isSelected ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          Recomendado
                        </span>
                      )}
                    </div>
                    <span className={`text-[11px] block mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      Contexto: {(m.contextLength / 1000).toFixed(0)}k tokens • Entrada: {m.inputPricePerM}/M • Saída: {m.outputPricePerM}/M
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[11px] font-bold uppercase ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                    {isSelected ? 'Ativo' : 'Selecionar'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Estimativa de custo para 1.000 conversas */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Estimativa de Custo Mensal (1.000 Conversas)
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Estimado com o modelo atual:</span>
              <span className="text-base font-bold text-slate-900 block">${costPer1000Convs} USD / mês</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Tokens de entrada por conversa:
              </label>
              <input
                type="number"
                step="1000"
                value={inputTokensPerConv}
                onChange={(e) => setInputTokensPerConv(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Tokens de saída por conversa:
              </label>
              <input
                type="number"
                step="500"
                value={outputTokensPerConv}
                onChange={(e) => setOutputTokensPerConv(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: Marca da Agência & Fuso Horário */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <Building className="w-4 h-4 text-slate-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Marca e Configuração Geral</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Nome da Agência / Empresa
            </label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Andrade Studio AI"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              Exibido no menu lateral e na tela de login.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Fuso Horário Oficial
            </label>
            <input
              type="text"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="America/Sao_Paulo"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              Utilizado para agendamentos e lembretes de calendário.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
