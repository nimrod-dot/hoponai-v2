'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/walkthroughs', label: 'Walkthroughs', icon: '🎬' },
  { href: '/dashboard/team', label: 'Team', icon: '👥' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
  { href: '/dashboard/extension', label: 'Extension', icon: '🧩' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardShell({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFBFD' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260, background: '#fff', borderRight: '1px solid #E8ECF2',
        padding: '24px 16px', display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'baseline', marginBottom: 32, paddingLeft: 12 }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#1A1D26' }}>hopon</span>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#0EA5E9' }}>ai</span>
        </Link>

        {/* Org name */}
        <div style={{
          padding: '10px 12px', marginBottom: 24, borderRadius: 8,
          background: 'rgba(14,165,233,0.05)', fontSize: 13,
          fontWeight: 600, color: '#0EA5E9',
        }}>
          {user?.organizations?.name || 'My Organization'}
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
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
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px' }}>
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
      <main style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}