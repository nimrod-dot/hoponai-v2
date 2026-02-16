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

const MOBILE_BREAK = 768;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAK);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileSolutionsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const closeMobile = () => { setMobileOpen(false); setMobileSolutionsOpen(false); };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: (scrolled || mobileOpen) ? 'rgba(250,251,253,0.97)' : 'transparent',
      backdropFilter: (scrolled || mobileOpen) ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: (scrolled || mobileOpen) ? 'blur(16px)' : 'none',
      borderBottom: (scrolled || mobileOpen) ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s', padding: '0 1.25rem',
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        {/* Logo */}
        <Link href={logoHref} style={{ display: 'flex', alignItems: 'baseline', flexShrink: 0 }}>
          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, color: 'var(--heading)' }}>hopon</span>
          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, color: 'var(--blue)' }}>ai</span>
        </Link>

        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
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

            <Link href="/pricing" style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500, transition: 'color 0.2s', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--blue)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}>Pricing</Link>

            <Link href="/contact-sales" style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500, transition: 'color 0.2s', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--blue)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}>Contact Sales</Link>

            {isLoaded && isSignedIn ? (
              <>
                {!isDashboard && (
                  <Link href="/dashboard" style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500, transition: 'color 0.2s', textDecoration: 'none' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--blue)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}>Dashboard</Link>
                )}
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: { width: 34, height: 34 } } }} />
              </>
            ) : isLoaded ? (
              <>
                <Link href="/sign-in" style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500, transition: 'color 0.2s', textDecoration: 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--blue)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}>Sign In</Link>
                <Link href="/sign-up" style={{
                  background: 'var(--blue)', color: 'var(--white)', padding: '9px 22px', borderRadius: 8,
                  fontWeight: 600, fontSize: 14, transition: 'all 0.2s', display: 'inline-block',
                }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'var(--blue-dark)'; (e.target as HTMLElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'var(--blue)'; (e.target as HTMLElement).style.transform = ''; }}>
                  Get Started
                </Link>
              </>
            ) : null}
          </div>
        )}

        {/* Hamburger (mobile) */}
        {isMobile && (
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--heading)" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <><line x1="6" y1="6" x2="18" y2="18" /><line x1="6" y1="18" x2="18" y2="6" /></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </svg>
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && mobileOpen && (
        <div style={{
          position: 'absolute', top: 68, left: 0, right: 0,
          background: 'rgba(250,251,253,0.97)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          padding: '8px 1.25rem 24px', display: 'flex', flexDirection: 'column', gap: 4,
          maxHeight: 'calc(100vh - 68px)', overflowY: 'auto',
        }}>
          <button onClick={() => setMobileSolutionsOpen(!mobileSolutionsOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
              fontSize: 15, fontWeight: 500, color: 'var(--text)', padding: '12px 0',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid var(--border)',
            }}>
            Solutions
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: mobileSolutionsOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {mobileSolutionsOpen && (
            <div style={{ paddingLeft: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {solutions.map((s) => (
                <Link key={s.href} href={s.href} onClick={closeMobile}
                  style={{ display: 'block', padding: '10px 8px', borderRadius: 8, textDecoration: 'none' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--heading)', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{s.desc}</div>
                </Link>
              ))}
            </div>
          )}

          <Link href="/pricing" onClick={closeMobile} style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', padding: '12px 0', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>Pricing</Link>
          <Link href="/contact-sales" onClick={closeMobile} style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', padding: '12px 0', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>Contact Sales</Link>

          {isLoaded && isSignedIn ? (
            <>
              {!isDashboard && (
                <Link href="/dashboard" onClick={closeMobile} style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', padding: '12px 0', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>Dashboard</Link>
              )}
              <div style={{ padding: '12px 0' }}>
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: { width: 34, height: 34 } } }} />
              </div>
            </>
          ) : isLoaded ? (
            <>
              <Link href="/sign-in" onClick={closeMobile} style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', padding: '12px 0', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>Sign In</Link>
              <Link href="/sign-up" onClick={closeMobile} style={{
                background: 'var(--blue)', color: 'var(--white)', padding: '12px 22px', borderRadius: 8,
                fontWeight: 600, fontSize: 15, textDecoration: 'none', textAlign: 'center',
                display: 'block', marginTop: 8,
              }}>Get Started</Link>
            </>
          ) : null}
        </div>
      )}
    </nav>
  );
}
