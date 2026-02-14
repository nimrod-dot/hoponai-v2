'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';

const solutions = [
  { href: '/solutions/onboarding', label: 'Employee Onboarding', desc: 'Get every new hire productive from day one' },
  { href: '/solutions/training', label: 'Continuous Training', desc: 'Keep your org sharp as tools and processes evolve' },
  { href: '/solutions/customers', label: 'Customer Training', desc: 'Onboard and educate your customers interactively' },
  { href: '/solutions/sops', label: 'SOPs & Compliance', desc: 'Ensure every procedure is followed correctly' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { isSignedIn, user, isLoaded } = useUser();

  const isDashboard = pathname.startsWith('/dashboard');
  const logoHref = isDashboard ? '/dashboard' : '/';

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(250,251,253,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s', padding: '0 2rem',
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        {/* Logo - always links home or dashboard */}
        <Link href={logoHref} style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, color: 'var(--heading)' }}>hopon</span>
          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, color: 'var(--blue)' }}>ai</span>
        </Link>

        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {/* Solutions dropdown */}
          <div ref={dropRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropOpen(!dropOpen)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                color: dropOpen ? 'var(--blue)' : 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif",
                display: 'flex', alignItems: 'center', gap: 4, padding: 0, transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--blue)')}
              onMouseLeave={(e) => { if (!dropOpen) e.currentTarget.style.color = 'var(--text)'; }}
            >
              Solutions
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: dropOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {dropOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 12px)', left: '-16px', width: 320,
                background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.08)', padding: '8px', zIndex: 200,
              }}>
                {solutions.map((s) => (
                  <Link key={s.href} href={s.href} onClick={() => setDropOpen(false)}
                    style={{ display: 'block', padding: '12px 14px', borderRadius: 8, transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--blue-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--heading)', marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{s.desc}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pricing link */}
          <Link href="/pricing" style={{
            color: 'var(--text)', fontSize: 14, fontWeight: 500,
            transition: 'color 0.2s', textDecoration: 'none',
          }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--blue)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}
          >
            Pricing
          </Link>

          {/* Contact Sales link */}
          <Link href="/contact-sales" style={{
            color: 'var(--text)', fontSize: 14, fontWeight: 500,
            transition: 'color 0.2s', textDecoration: 'none',
          }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--blue)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}
          >
            Contact Sales
          </Link>

          {/* Auth-aware section */}
          {isLoaded && isSignedIn ? (
            <>
              {/* Dashboard link if not already there */}
              {!isDashboard && (
                <Link href="/dashboard" style={{
                  color: 'var(--text)', fontSize: 14, fontWeight: 500,
                  transition: 'color 0.2s', textDecoration: 'none',
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--blue)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}
                >
                  Dashboard
                </Link>
              )}
              {/* Clerk UserButton with avatar */}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: { width: 34, height: 34 },
                  },
                }}
              />
            </>
          ) : isLoaded ? (
            <>
              {/* Sign In link */}
              <Link href="/sign-in" style={{
                color: 'var(--text)', fontSize: 14, fontWeight: 500,
                transition: 'color 0.2s', textDecoration: 'none',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--blue)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}
              >
                Sign In
              </Link>

              {/* Get Started button */}
              <Link href="/sign-up" style={{
                background: 'var(--blue)', color: 'var(--white)', padding: '9px 22px', borderRadius: 8,
                fontWeight: 600, fontSize: 14, transition: 'all 0.2s', display: 'inline-block',
              }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'var(--blue-dark)'; (e.target as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'var(--blue)'; (e.target as HTMLElement).style.transform = ''; }}
              >
                Get Started
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}