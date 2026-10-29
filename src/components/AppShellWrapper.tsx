'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

export function AppShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/login' || pathname.startsWith('/demo');

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
