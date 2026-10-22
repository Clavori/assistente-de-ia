import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Atiende — Asistente de IA para Negocios',
  description: 'Crea, configura y pon a trabajar tu asistente virtual de atención y citas en WhatsApp y Web.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 flex flex-col antialiased">
        <div className="flex h-screen overflow-hidden">
          {/* Main App Container */}
          <AppShellWrapper>{children}</AppShellWrapper>
        </div>
      </body>
    </html>
  );
}

// Client wrapper to exclude sidebar on login and demo
import { AppShellWrapper } from '@/components/AppShellWrapper';
