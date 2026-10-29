'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

export function AppShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/login' || pathname.startsWith('/demo');

  // Global background heartbeat to keep the Baileys WhatsApp WebSocket active
  // across all pages of the dashboard (even on Vercel Serverless)
  useEffect(() => {
    if (isPublicPage) return;

    let active = true;
    const pingWhatsAppWorker = async () => {
      if (!active) return;
      try {
        const res = await fetch('/api/channels/whatsapp?heartbeat=1', {
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof window !== 'undefined') {
            if (data.status === 'connected') {
              localStorage.setItem(
                'andrade_wa_session',
                JSON.stringify({ connected: true, phone: data.connectedNumber || null })
              );
            } else if (data.status === 'waiting_qr' || data.status === 'disconnected') {
              localStorage.removeItem('andrade_wa_session');
            }
          }
        }
      } catch {}
    };

    pingWhatsAppWorker();
    const interval = setInterval(pingWhatsAppWorker, 3500);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isPublicPage]);

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
