'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

export function AppShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/login' || pathname.startsWith('/demo');

  // Global background heartbeat to keep the Baileys WhatsApp WebSocket active
  // across all pages of the dashboard
  useEffect(() => {
    if (isPublicPage || pathname === '/canales') return;

    let active = true;
    const pingWhatsAppWorker = async () => {
      if (!active) return;
      try {
        await fetch('/api/channels/whatsapp?heartbeat=1', {
          cache: 'no-store'
        });
      } catch {}
    };

    pingWhatsAppWorker();
    const interval = setInterval(pingWhatsAppWorker, 6000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isPublicPage, pathname]);

  if (isPublicPage) {
    return <main className="flex-1 w-full overflow-y-auto bg-transparent">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 min-w-0 bg-transparent overflow-y-auto flex flex-col">
        {children}
      </main>
    </>
  );
}
