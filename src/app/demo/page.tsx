'use client';

import Script from 'next/script';
import Link from 'next/link';
import { ArrowLeft, Sparkles, MessageSquare, Zap, Shield } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-transparent text-[#f5f6fa] flex flex-col">
      {/* Top Banner Navigation */}
      <nav className="border-b border-white/[0.08] bg-[#050508]/80 backdrop-blur-xl sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Link
            href="/canales"
            className="flex items-center gap-1.5 text-xs text-[#9ba0b0] hover:text-white transition px-3 py-1.5 rounded-lg bg-[#12121c] border border-white/[0.08]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Painel</span>
          </Link>
          <div className="h-4 w-px bg-white/[0.08]" />
          <div className="flex items-center gap-2">
            <img
              src="/assets/logo.png"
              alt="AndradeStudio"
              className="w-7 h-7 rounded-full border border-white/20 shadow-[0_0_15px_rgba(242,13,22,0.45)]"
            />
            <span className="font-display font-bold text-sm text-white">AndradeStudio</span>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#f20d16]/15 text-[#ff6b70] border border-[#f20d16]/30">
            Demonstração Ao Vivo
          </span>
        </div>

        <div className="text-xs text-[#9ba0b0] hidden sm:block">
          Veja a bolha de chat funcionando no canto inferior direito ↘
        </div>
      </nav>

      {/* Hero Section styled after andrade-studio.vercel.app */}
      <section className="flex-1 max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f20d16]/15 border border-[#f20d16]/30 text-[#ff6b70] text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>IA aplicada ao crescimento da sua empresa</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight font-display">
          Sites, apps e IA que fazem sua marca parecer{' '}
          <span className="bg-gradient-to-r from-[#f20d16] via-[#ff4b52] to-white bg-clip-text text-transparent">
            impossível de ignorar
          </span>
          .
        </h1>

        <p className="text-base sm:text-lg text-[#9ba0b0] max-w-2xl leading-relaxed">
          Presenças digitais premium para empresas que precisam vender melhor: sites modernos,
          aplicativos sob medida e automações com IA integradas ao WhatsApp e Google Calendar.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left pt-10">
          <div className="p-6 rounded-2xl bg-[#0d0d14]/90 border border-white/[0.08] hover:border-[#f20d16]/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#f20d16]/15 text-[#ff4b52] border border-[#f20d16]/30 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-display">Atendimento 24/7 com IA</h3>
            <p className="text-xs text-[#9ba0b0] leading-relaxed">
              Tire dúvidas de clientes, apresente sua tabela de preços e converta visitantes em oportunidades de negócio sem pausas.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0d14]/90 border border-white/[0.08] hover:border-[#f20d16]/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#f20d16]/15 text-[#ff4b52] border border-[#f20d16]/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-display">Agendamento no Calendar</h3>
            <p className="text-xs text-[#9ba0b0] leading-relaxed">
              O assistente consulta horários livres e reserva reuniões diretamente na sua agenda oficial do Google Calendar.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0d14]/90 border border-white/[0.08] hover:border-[#f20d16]/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#f20d16]/15 text-[#ff4b52] border border-[#f20d16]/30 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-display">Transbordo Humano Seguro</h3>
            <p className="text-xs text-[#9ba0b0] leading-relaxed">
              Em caso de dúvidas complexas ou quando o cliente solicitar, o assistente notifica sua equipe pelo Slack ou painel.
            </p>
          </div>
        </div>

        {/* Callout box */}
        <div className="p-5 rounded-2xl bg-[#12121c] border border-[#f20d16]/30 max-w-xl w-full text-center mt-8 shadow-[0_10px_30px_rgba(242,13,22,0.15)]">
          <p className="text-xs text-white">
            👉 Clique no botão de chat flutuante no canto inferior direito para conversar com a IA da <strong>AndradeStudio</strong>!
          </p>
        </div>
      </section>

      {/* Inject Embedded Chat Script */}
      <Script src="/api/widget/embed.js" strategy="lazyOnload" />
    </div>
  );
}
