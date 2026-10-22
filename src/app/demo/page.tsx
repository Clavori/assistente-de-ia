'use client';

import Script from 'next/script';
import Link from 'next/link';
import { ArrowLeft, Sparkles, CheckCircle2, MessageSquare, Zap, Shield, ArrowRight } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Banner Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/canales"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Painel</span>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Ambiente de Demonstração Ao Vivo
          </span>
        </div>

        <div className="text-xs text-slate-400 hidden sm:block">
          Veja a bolha de chat funcionando no canto inferior direito ↘
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transformação Digital com Inteligência Artificial</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
          Criamos Sites, Apps e <span className="text-emerald-400">Automações com IA</span> de Alto Impacto
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Esta é uma página de exemplo simulando o site do seu negócio. O assistente virtual inteligente já está integrado através do script do Atende no canto inferior direito.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left pt-12">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Atendimento 24/7 com IA</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tire dúvidas de clientes, apresente sua tabela de preços e converta visitantes em oportunidades de negócio sem pausas.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Agendamento no Calendar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O assistente consulta horários livres e reserva reuniões diretamente na sua agenda oficial do Google Calendar.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Transbordo Humano Seguro</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Em caso de dúvidas complexas ou quando o cliente solicitar, o assistente notifica sua equipe pelo Slack ou painel.
            </p>
          </div>
        </div>

        {/* Callout box */}
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 max-w-xl w-full text-center mt-8">
          <p className="text-xs text-slate-300">
            👉 Clique no botão de chat flutuante no canto inferior direito para conversar com a IA, perguntar sobre preços ou agendar uma reunião de demonstração!
          </p>
        </div>
      </section>

      {/* Inject Embedded Chat Script */}
      <Script src="/api/widget/embed.js" strategy="lazyOnload" />
    </div>
  );
}
