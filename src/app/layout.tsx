import type { Metadata } from 'next';
import './globals.css';
import { AppShellWrapper } from '@/components/AppShellWrapper';

export const metadata: Metadata = {
  title: 'Atende — Assistente de IA para Negócios',
  description: 'Crie, configure e coloque para rodar seu assistente virtual de atendimento e agendamentos no WhatsApp e Web.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 flex flex-col antialiased">
        <div className="flex h-screen overflow-hidden">
          <AppShellWrapper>{children}</AppShellWrapper>
        </div>
      </body>
    </html>
  );
}
