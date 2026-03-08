'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

const NAV_ITEMS = [
  {
    href: '/dashboard', label: 'Overview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/dashboard/walkthroughs', label: 'Walkthroughs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    href: '/dashboard/team', label: 'Team',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/dashboard/analytics', label: 'Analytics',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: '/dashboard/extension', label: 'Extension',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    href: '/dashboard/settings', label: 'Settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

const MOBILE_BREAK = 768;

export default function DashboardShell({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAK);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    document.body.style.overflow = (isMobile && sidebarOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, sidebarOpen]);

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', background: '#FAFBFD' }}>

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 56, background: '#fff',
          borderBottom: '1px solid #E8ECF2', position: 'sticky', top: 0, zIndex: 50,
        }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#1A1D26' }}>hopon</span>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#0EA5E9' }}>ai</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1D26" strokeWidth="2" strokeLinecap="round">
              {sidebarOpen ? (
                <><line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" /></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </svg>
          </button>
        </div>
      )}

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, top: 56, background: 'rgba(0,0,0,0.3)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        ...(!isMobile ? {
          width: 260, background: '#fff', borderRight: '1px solid #E8ECF2',
          padding: '24px 16px', display: 'flex', flexDirection: 'column' as const,
        } : {
          position: 'fixed' as const, top: 56, left: 0, right: 0, zIndex: 45,
          background: '#fff', borderBottom: '1px solid #E8ECF2',
          padding: '16px', display: sidebarOpen ? 'flex' : 'none',
          flexDirection: 'column' as const,
          maxHeight: 'calc(100vh - 56px)', overflowY: 'auto' as const,
        }),
      }}>
        {/* Logo (desktop only) */}
        {!isMobile && (
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'baseline', marginBottom: 32, paddingLeft: 12 }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#1A1D26' }}>hopon</span>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#0EA5E9' }}>ai</span>
          </Link>
        )}

        {/* Org name */}
        <div style={{
          padding: '10px 12px', marginBottom: isMobile ? 12 : 24, borderRadius: 8,
          background: 'rgba(14,165,233,0.05)', fontSize: 13,
          fontWeight: 600, color: '#0EA5E9',
        }}>
          {user?.organizations?.name || 'My Organization'}
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: isMobile ? undefined : 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 8,
                  background: isActive ? 'rgba(14,165,233,0.08)' : 'transparent',
                  color: isActive ? '#0EA5E9' : '#4A5168',
                  fontSize: 14, fontWeight: isActive ? 600 : 500,
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', marginTop: isMobile ? 12 : 0 }}>
          <UserButton afterSignOutUrl="/" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1D26' }}>
              {user?.full_name || 'User'}
            </div>
            <div style={{ fontSize: 12, color: '#8B92A5' }}>
              {user?.role}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: isMobile ? '20px 16px' : '32px 40px', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
