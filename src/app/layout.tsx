import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AppShellWrapper } from '@/components/AppShellWrapper';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AndradeStudio AI — Plataforma de Atendimento & Automação',
  description: 'Painel executivo de IA da AndradeStudio: atendimento inteligente no WhatsApp e Web, qualificação de leads e agendamentos automáticos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`dark ${outfit.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-[#050508] text-[#f5f6fa] flex flex-col antialiased selection:bg-[#f20d16] selection:text-white">
        <div className="flex h-screen overflow-hidden relative z-10">
          <AppShellWrapper>{children}</AppShellWrapper>
        </div>
      </body>
    </html>
  );
}
